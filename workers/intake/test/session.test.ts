import { describe, expect, it } from 'vitest';
import { createMockEnv, createMockRateLimit } from '@sesap/test-utils';
import type { Env } from '../src/bindings';
import {
  SESSION_COOKIE,
  buildSessionCookie,
  createSession,
  loadSessionFromRequest,
  signSessionId,
  verifySessionCookie,
} from '../src/services/session';
import { enforceRateLimit, RateLimitConfigError, RateLimitError } from '../src/services/rate-limit';

function makeEnv(secret = 'test-secret', overrides: Partial<Env> = {}): Env {
  return createMockEnv<Env>({ INTAKE_SESSION_SECRET: secret, ...overrides } as Partial<Env>);
}

describe('session cookie', () => {
  it('round-trips a signed session id', async () => {
    const env = makeEnv();
    const signed = await signSessionId(env, 'abc123');
    expect(await verifySessionCookie(env, signed)).toBe('abc123');
  });

  it('rejects a tampered id', async () => {
    const env = makeEnv();
    const signed = await signSessionId(env, 'abc123');
    const [, signature] = signed.split('.');

    // Same signature, different id — the whole point of signing it.
    expect(await verifySessionCookie(env, `abc124.${signature}`)).toBeNull();
  });

  it('rejects a tampered signature and a missing one', async () => {
    const env = makeEnv();
    const [id, signature] = (await signSessionId(env, 'abc123')).split('.');

    expect(await verifySessionCookie(env, `${id}.${signature.slice(0, -1)}0`)).toBeNull();
    expect(await verifySessionCookie(env, id)).toBeNull();
    expect(await verifySessionCookie(env, '')).toBeNull();
  });

  it('rejects a cookie signed with a different secret', async () => {
    const signed = await signSessionId(makeEnv('secret-a'), 'abc123');
    expect(await verifySessionCookie(makeEnv('secret-b'), signed)).toBeNull();
  });

  it('sets HttpOnly, Secure and SameSite=Lax', () => {
    const cookie = buildSessionCookie('value');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    // Lax, not Strict: the emailed review link is a cross-site top-level
    // navigation and must still carry the session.
    expect(cookie).toContain('SameSite=Lax');
  });

  it('loads a session from a request cookie header', async () => {
    const env = makeEnv();
    const { cookie } = await createSession(env, {
      email: 'a@oregonstate.edu',
      verifiedAt: new Date().toISOString(),
    });
    const value = cookie.split(';')[0].slice(SESSION_COOKIE.length + 1);

    const loaded = await loadSessionFromRequest(env, `other=1; ${SESSION_COOKIE}=${value}`);
    expect(loaded?.session.email).toBe('a@oregonstate.edu');

    expect(await loadSessionFromRequest(env, 'other=1')).toBeNull();
    expect(await loadSessionFromRequest(env, undefined)).toBeNull();
  });
});

describe('rate limits', () => {
  it('allows up to the binding\'s limit, then rejects with a retry-after', async () => {
    const env = makeEnv('s', { RL_VERIFY_EMAIL: createMockRateLimit(3) });

    await enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c');
    await enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c');
    await enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c');

    await expect(enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c')).rejects.toBeInstanceOf(RateLimitError);
    await expect(enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c')).rejects.toMatchObject({
      statusCode: 429,
      code: 'RATE_LIMITED',
    });
  });

  it('counts each key separately', async () => {
    const env = makeEnv('s', { RL_VERIFY_EMAIL: createMockRateLimit(1) });

    await enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'a@b.c');
    // A different address must not inherit the first one's budget.
    await expect(enforceRateLimit(env, 'RL_VERIFY_EMAIL', 'd@e.f')).resolves.toBeUndefined();
  });

  it('skips a missing binding in development only', async () => {
    await expect(
      enforceRateLimit(makeEnv('s', { ENVIRONMENT: 'development' }), 'RL_VERIFY_IP', '1.2.3.4'),
    ).resolves.toBeUndefined();

    for (const environment of ['staging', 'production']) {
      await expect(
        enforceRateLimit(makeEnv('s', { ENVIRONMENT: environment }), 'RL_VERIFY_IP', '1.2.3.4'),
      ).rejects.toBeInstanceOf(RateLimitConfigError);
    }
  });
});
