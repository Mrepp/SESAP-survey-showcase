import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDurableObjectNamespace, createMockEnv } from '@sesap/test-utils';
import type { Env } from '../src/bindings';
import { IntakeVerificationGuard } from '../src/durable/verification-guard';
import {
  CODE_TTL_SECONDS,
  MAX_CODE_ATTEMPTS,
  confirmVerificationCode,
  isAllowedEmail,
  issueVerificationCode,
  normalizeEmail,
} from '../src/services/verification';

// Fake timers rather than an injected clock: the guard reads `Date.now()`, and
// TTL behavior is only meaningful when issue and confirm agree on the time.
const START = Date.UTC(2026, 0, 1);
const advance = (seconds: number) => vi.setSystemTime(new Date(Date.now() + seconds * 1000));

type GuardNamespace = ReturnType<typeof createMockDurableObjectNamespace>;

function makeEnv(): Env & { INTAKE_VERIFY: GuardNamespace } {
  const INTAKE_VERIFY = createMockDurableObjectNamespace(
    (_name, state) => new IntakeVerificationGuard(state),
  );
  return createMockEnv<Env & { INTAKE_VERIFY: GuardNamespace }>({
    INTAKE_VERIFY,
    ALLOWED_EMAIL_DOMAIN: 'oregonstate.edu',
  });
}

describe('domain allowlist', () => {
  it('accepts the institutional domain and its subdomains', () => {
    expect(isAllowedEmail('Student@Oregonstate.EDU', 'oregonstate.edu')).toBe(true);
    expect(isAllowedEmail('a@engr.oregonstate.edu', 'oregonstate.edu')).toBe(true);
  });

  it('rejects lookalikes and malformed addresses', () => {
    // The classic suffix trick: a domain that merely *ends* with the allowed
    // string must not pass.
    expect(isAllowedEmail('a@notoregonstate.edu', 'oregonstate.edu')).toBe(false);
    expect(isAllowedEmail('a@oregonstate.edu.attacker.com', 'oregonstate.edu')).toBe(false);
    expect(isAllowedEmail('a@gmail.com', 'oregonstate.edu')).toBe(false);
    expect(isAllowedEmail('not an email', 'oregonstate.edu')).toBe(false);
    expect(isAllowedEmail('a@@oregonstate.edu', 'oregonstate.edu')).toBe(false);
  });

  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeEmail('  Beaver@Oregonstate.EDU ')).toBe('beaver@oregonstate.edu');
  });
});

describe('verification codes', () => {
  let env: ReturnType<typeof makeEnv>;
  const email = 'beaver@oregonstate.edu';

  beforeAll(() => vi.useFakeTimers());
  afterAll(() => vi.useRealTimers());

  beforeEach(() => {
    vi.setSystemTime(new Date(START));
    env = makeEnv();
  });

  it('keys the guard by normalized address and stores only a hash', async () => {
    const code = await issueVerificationCode(env, '  Beaver@OregonState.edu ');

    expect(code).toMatch(/^\d{6}$/);
    expect(env.INTAKE_VERIFY.idFromName).toHaveBeenCalledWith(email);
    expect(env.INTAKE_VERIFY.instances.has(email)).toBe(true);
    const stored = JSON.stringify([...(await storageOf(env, email))]);
    expect(stored).not.toContain(code);
    expect(stored).toMatch(/"codeHash":"[0-9a-f]{64}"/);
  });

  it('accepts the right code exactly once', async () => {
    const code = await issueVerificationCode(env, email);

    expect(await confirmVerificationCode(env, email, code)).toEqual({ ok: true });
    // Consumed — a replay of the same code must fail.
    expect(await confirmVerificationCode(env, email, code)).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('expires after the TTL', async () => {
    const code = await issueVerificationCode(env, email);
    advance(CODE_TTL_SECONDS + 1);

    expect(await confirmVerificationCode(env, email, code)).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('caps attempts and then destroys the code', async () => {
    const code = await issueVerificationCode(env, email);
    const wrong = code === '000000' ? '111111' : '000000';

    for (let attempt = 1; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      expect(await confirmVerificationCode(env, email, wrong)).toEqual({
        ok: false,
        reason: 'mismatch',
      });
    }

    expect(await confirmVerificationCode(env, email, wrong)).toEqual({
      ok: false,
      reason: 'attempts_exhausted',
    });
    // Even the correct code is now useless — a fresh one must be requested.
    expect(await confirmVerificationCode(env, email, code)).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('counts parallel wrong guesses individually', async () => {
    // The whole point of the Durable Object: guesses arriving together are
    // serialized by one actor, so the cap cannot be slipped past.
    const code = await issueVerificationCode(env, email);
    const wrong = code === '000000' ? '111111' : '000000';

    const results = await Promise.all(
      Array.from({ length: MAX_CODE_ATTEMPTS + 3 }, () => confirmVerificationCode(env, email, wrong)),
    );

    expect(results.filter((r) => !r.ok && r.reason === 'mismatch')).toHaveLength(MAX_CODE_ATTEMPTS - 1);
    expect(results.filter((r) => !r.ok && r.reason === 'attempts_exhausted')).toHaveLength(1);
    expect(await confirmVerificationCode(env, email, code)).toEqual({ ok: false, reason: 'expired' });
  });

  it('does not slide the expiry forward on a failed attempt', async () => {
    const code = await issueVerificationCode(env, email);
    advance(CODE_TTL_SECONDS - 60);
    await confirmVerificationCode(env, email, '999999');

    advance(61);
    expect(await confirmVerificationCode(env, email, code)).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('a fresh code replaces the outstanding one', async () => {
    const first = await issueVerificationCode(env, email);
    const second = await issueVerificationCode(env, email);

    expect(await confirmVerificationCode(env, email, first)).toEqual({ ok: false, reason: 'mismatch' });
    expect(await confirmVerificationCode(env, email, second)).toEqual({ ok: true });
  });
});

/** Peek at the guard's storage for one address. */
async function storageOf(env: ReturnType<typeof makeEnv>, email: string) {
  const guard = env.INTAKE_VERIFY.instances.get(email) as unknown as {
    state: { storage: { store: Map<string, unknown> } };
  };
  return guard.state.storage.store;
}
