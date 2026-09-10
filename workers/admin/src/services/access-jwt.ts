import type { Env } from '../bindings';

/**
 * Cloudflare Access JWT verification.
 *
 * The middleware used to read `Cf-Access-Authenticated-User-Email` and trust
 * it. That header is only meaningful when the worker is reachable *exclusively*
 * through the Access-protected hostname: anywhere else — a live workers.dev
 * subdomain, a route that bypasses the Access application — any client can set
 * it and get full admin, which now means publishing arbitrary content and
 * reading contributor PII and raw media.
 *
 * `Cf-Access-Jwt-Assertion` is the assertion Access actually signs. Verifying
 * it against the team's JWKS, with the application's audience tag checked, is
 * what makes the identity trustworthy independently of how the request arrived.
 */

export class AccessAuthError extends Error {
  constructor(
    message: string,
    /** Safe to show a browser; never carries the token or its claims. */
    readonly detail: string,
  ) {
    super(message);
    this.name = 'AccessAuthError';
  }
}

/** Access sets the assertion on this header for every authenticated request. */
export const ACCESS_JWT_HEADER = 'Cf-Access-Jwt-Assertion';

interface JsonWebKey_ extends JsonWebKey {
  kid?: string;
  alg?: string;
}

interface Jwks {
  keys: JsonWebKey_[];
}

interface AccessClaims {
  aud?: string | string[];
  iss?: string;
  exp?: number;
  nbf?: number;
  email?: string;
  sub?: string;
}

/**
 * JWKS cache, per isolate. Access rotates signing keys, so this is short — but
 * fetching the key set on every admin request would put a network round trip in
 * front of every page load.
 */
const JWKS_TTL_MS = 60 * 60 * 1000;
const jwksCache = new Map<string, { fetchedAt: number; jwks: Jwks }>();

/** Small tolerance for clock skew between Access and the edge. */
const CLOCK_SKEW_SECONDS = 60;

function issuerFor(teamDomain: string): string {
  const team = teamDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return team.includes('.') ? `https://${team}` : `https://${team}.cloudflareaccess.com`;
}

async function fetchJwks(teamDomain: string): Promise<Jwks> {
  const issuer = issuerFor(teamDomain);
  const cached = jwksCache.get(issuer);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) {
    return cached.jwks;
  }

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`);
  if (!response.ok) {
    // A stale key set beats locking every administrator out over one blip.
    if (cached) return cached.jwks;
    throw new AccessAuthError(
      'Could not verify your Cloudflare Access session.',
      `The Access key set could not be fetched (${response.status}).`,
    );
  }

  const jwks = (await response.json()) as Jwks;
  jwksCache.set(issuer, { fetchedAt: Date.now(), jwks });
  return jwks;
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJson<T>(segment: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
}

/**
 * Verify one Access assertion and return the email it asserts.
 *
 * Throws `AccessAuthError` for anything that does not verify: a missing token,
 * an unexpected algorithm, an unknown key, a bad signature, a wrong audience,
 * a wrong issuer, or an expired token. The caller decides how to present that.
 */
export async function verifyAccessJwt(env: Env, token: string | undefined): Promise<string> {
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const audience = env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) {
    // Fail closed. Falling back to the header here would reinstate exactly the
    // spoofable path this function exists to remove.
    throw new AccessAuthError(
      'This worker is not configured for Cloudflare Access.',
      'CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD must both be set.',
    );
  }

  if (!token) {
    throw new AccessAuthError(
      'This page requires authentication via Cloudflare Access.',
      'No Cloudflare Access assertion was present on the request.',
    );
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new AccessAuthError('Your Cloudflare Access session is not valid.', 'Malformed assertion.');
  }
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  try {
    header = decodeJson<{ alg?: string; kid?: string }>(headerSegment);
    claims = decodeJson<AccessClaims>(payloadSegment);
  } catch {
    throw new AccessAuthError('Your Cloudflare Access session is not valid.', 'Malformed assertion.');
  }

  // Pin the algorithm: accepting whatever the token names is how `alg: none`
  // and HMAC-with-the-public-key confusions get in.
  if (header.alg !== 'RS256') {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid.',
      'Unexpected assertion signing algorithm.',
    );
  }

  const jwks = await fetchJwks(teamDomain);
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid.',
      'The assertion was signed by an unknown key.',
    );
  }

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlToBytes(signatureSegment),
    new TextEncoder().encode(`${headerSegment}.${payloadSegment}`),
  );
  if (!verified) {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid.',
      'The assertion signature did not verify.',
    );
  }

  // A valid signature from the right team is not enough: without the audience
  // check, a token minted for any other Access application in the same account
  // would be accepted here.
  const audiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!audiences.includes(audience)) {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid for this application.',
      'The assertion audience did not match this application.',
    );
  }

  if (claims.iss !== issuerFor(teamDomain)) {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid.',
      'The assertion issuer did not match the configured team.',
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_SECONDS < now) {
    throw new AccessAuthError(
      'Your Cloudflare Access session has expired. Sign in again.',
      'The assertion has expired.',
    );
  }
  if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_SKEW_SECONDS > now) {
    throw new AccessAuthError(
      'Your Cloudflare Access session is not valid yet.',
      'The assertion is not yet valid.',
    );
  }

  if (!claims.email) {
    throw new AccessAuthError(
      'Your Cloudflare Access session does not carry an email address.',
      'The assertion had no email claim.',
    );
  }

  return claims.email.trim().toLowerCase();
}
