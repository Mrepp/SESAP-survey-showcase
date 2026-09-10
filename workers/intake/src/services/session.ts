import { KV_KEYS } from '@sesap/types';
import type { IntakeSession } from '@sesap/types';
import { AuthenticationError } from '@sesap/core';
import type { Env } from '../bindings';
import { hmacHex, randomToken, sha256Hex, timingSafeEqual } from './crypto';

/**
 * `__Host-` is a prefix the browser enforces, not a hint: it refuses the cookie
 * unless it is Secure, Path=/ and carries no Domain attribute. Without it a
 * compromised sibling subdomain can set a `Domain=`-scoped cookie of the same
 * name on this origin and plant a session.
 */
export const SESSION_COOKIE = '__Host-sesap_intake';

/** Sessions live a day: long enough to finish a recording, short enough to expire. */
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

/**
 * Cookie value is `<sessionId>.<hmac>`. The id alone is meaningless without the
 * signature, and the signature is over the id only — every mutable fact lives
 * in KV, so a stolen-and-edited cookie cannot forge profile or consent state.
 */
export async function signSessionId(env: Env, sessionId: string): Promise<string> {
  return `${sessionId}.${await hmacHex(env.INTAKE_SESSION_SECRET, sessionId)}`;
}

export async function verifySessionCookie(env: Env, cookie: string): Promise<string | null> {
  const separator = cookie.lastIndexOf('.');
  if (separator <= 0) return null;

  const sessionId = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);
  const expected = await hmacHex(env.INTAKE_SESSION_SECRET, sessionId);

  return timingSafeEqual(signature, expected) ? sessionId : null;
}

export function buildSessionCookie(value: string, maxAge = SESSION_TTL_SECONDS): string {
  // Lax rather than Strict: the emailed review link is a top-level cross-site
  // navigation and must still arrive with the session attached.
  //
  // SameSite=Lax with no CORS anywhere in this worker is what covers CSRF on
  // the state-changing routes — there is no CSRF token. Adding a permissive
  // `Access-Control-Allow-Origin` later would silently remove that protection.
  //
  // Path and Secure are also required by the `__Host-` prefix, and no `Domain`
  // attribute may be present.
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

/** Key material for the per-address records; the address itself never lands in KV. */
export async function emailKeyHash(email: string): Promise<string> {
  return sha256Hex(email.trim().toLowerCase());
}

export function clearSessionCookie(): string {
  return buildSessionCookie('', 0);
}

/**
 * Start a session for a freshly verified address, retiring any previous one.
 *
 * One address, one live session. Without this, the per-session upload budget
 * and the id-reuse guard cap nothing: three code requests a minute mint three
 * fresh sessions a minute, each with a full budget. The per-address submission
 * quota in `routes/upload` is the other half of that; this half also means a
 * verified address cannot fan out across parallel wizards.
 */
export async function createSession(
  env: Env,
  session: Omit<IntakeSession, 'createdAt' | 'updatedAt'>,
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = randomToken(16);
  const now = new Date().toISOString();

  const emailHash = await emailKeyHash(session.email);
  const previous = await env.SESAP_KV.get(KV_KEYS.intakeEmailSession(emailHash));
  if (previous && previous !== sessionId) {
    await deleteSession(env, previous);
  }

  await putSession(env, sessionId, { ...session, createdAt: now, updatedAt: now });
  await env.SESAP_KV.put(KV_KEYS.intakeEmailSession(emailHash), sessionId, {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  return { sessionId, cookie: buildSessionCookie(await signSessionId(env, sessionId)) };
}

export async function putSession(
  env: Env,
  sessionId: string,
  session: IntakeSession,
): Promise<void> {
  await env.SESAP_KV.put(
    KV_KEYS.intakeSession(sessionId),
    JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
    { expirationTtl: SESSION_TTL_SECONDS },
  );
}

export async function getSession(env: Env, sessionId: string): Promise<IntakeSession | null> {
  const raw = await env.SESAP_KV.get(KV_KEYS.intakeSession(sessionId));
  return raw ? (JSON.parse(raw) as IntakeSession) : null;
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await env.SESAP_KV.delete(KV_KEYS.intakeSession(sessionId));
}

/** Read the signed cookie off a request and load the session it points at. */
export async function loadSessionFromRequest(
  env: Env,
  cookieHeader: string | undefined,
): Promise<{ sessionId: string; session: IntakeSession } | null> {
  if (!cookieHeader) return null;

  const raw = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return null;

  const sessionId = await verifySessionCookie(env, decodeURIComponent(raw));
  if (!sessionId) return null;

  const session = await getSession(env, sessionId);
  return session ? { sessionId, session } : null;
}

export function requireSession<T>(loaded: T | null): T {
  if (!loaded) {
    throw new AuthenticationError('Verify your email address before continuing.');
  }
  return loaded;
}
