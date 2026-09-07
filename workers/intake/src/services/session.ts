import { KV_KEYS } from '@sesap/types';
import type { IntakeSession } from '@sesap/types';
import { AuthenticationError } from '@sesap/core';
import type { Env } from '../bindings';
import { hmacHex, randomToken, timingSafeEqual } from './crypto';

export const SESSION_COOKIE = 'sesap_intake';

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
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

export function clearSessionCookie(): string {
  return buildSessionCookie('', 0);
}

export async function createSession(
  env: Env,
  session: Omit<IntakeSession, 'createdAt' | 'updatedAt'>,
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = randomToken(16);
  const now = new Date().toISOString();

  await putSession(env, sessionId, { ...session, createdAt: now, updatedAt: now });

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
