import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockDurableObjectNamespace,
  createMockEnv,
  createMockRateLimit,
} from '@sesap/test-utils';
import type { Env } from '../src/bindings';
import { IntakeVerificationGuard } from '../src/durable/verification-guard';
import { Hono } from 'hono';
import { verify } from '../src/routes/verify';
import {
  CODE_TTL_SECONDS,
  MAX_CODE_ATTEMPTS,
  MAX_EMAIL_LENGTH,
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
  return createMockEnv<Env & { INTAKE_VERIFY: GuardNamespace }>({ INTAKE_VERIFY });
}

/**
 * Enrollment is open. There is no domain allow-list to test — the earlier
 * suite pinned an `oregonstate.edu` restriction that no longer exists and that
 * the project decided against. What this pins instead is the contract that
 * replaced it: syntactic validation only, plus normalization, because inbox
 * control is proven by the emailed code rather than by the address's domain.
 */
describe('email acceptance', () => {
  it('accepts any syntactically valid address, whatever the domain', () => {
    expect(isAllowedEmail('Student@Oregonstate.EDU')).toBe(true);
    expect(isAllowedEmail('a@engr.oregonstate.edu')).toBe(true);
    // Deliberately accepted: open enrollment is the intended behavior.
    expect(isAllowedEmail('a@gmail.com')).toBe(true);
    expect(isAllowedEmail('alum@example.co.uk')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isAllowedEmail('not an email')).toBe(false);
    expect(isAllowedEmail('a@@oregonstate.edu')).toBe(false);
    expect(isAllowedEmail('a@nodot')).toBe(false);
    expect(isAllowedEmail('@nolocal.edu')).toBe(false);
    expect(isAllowedEmail('nodomain@')).toBe(false);
    expect(isAllowedEmail('')).toBe(false);
  });

  it('rejects an address longer than a mailbox can be', () => {
    // Unbounded input on a public endpoint becomes a Durable Object name and a
    // rate-limit key; RFC 5321 caps the path at 256 octets.
    const local = 'a'.repeat(MAX_EMAIL_LENGTH);
    expect(isAllowedEmail(`${local}@example.edu`)).toBe(false);
  });

  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeEmail('  Beaver@Oregonstate.EDU ')).toBe('beaver@oregonstate.edu');
    // Case folding is what makes the guard key and the rate-limit key agree.
    expect(isAllowedEmail('  Beaver@Oregonstate.EDU ')).toBe(true);
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


/**
 * The per-address guess limit.
 *
 * `IntakeVerificationGuard.issue` resets `attempts` on every fresh code, so the
 * attempt cap alone bounds guesses per code, not guesses per address. With only
 * a per-IP rule in front of it, an attacker spread across IPs gets the address's
 * full issuance rate times the attempt cap against a 10^6 keyspace, forever,
 * with no lockout. The per-address rule is what closes that.
 */
describe('confirm is limited per address, not only per IP', () => {
  const email = 'target@example.edu';
  const CONFIRM_LIMIT = 3;

  function makeRouteEnv(): Env {
    const INTAKE_VERIFY = createMockDurableObjectNamespace(
      (_name, state) => new IntakeVerificationGuard(state),
    );
    return createMockEnv<Env>({
      INTAKE_VERIFY: INTAKE_VERIFY as unknown as DurableObjectNamespace,
      INTAKE_SESSION_SECRET: 'test-secret',
      RL_CONFIRM_EMAIL: createMockRateLimit(CONFIRM_LIMIT),
      // Generous, and keyed per IP — so it never trips in this test. That is
      // the point: the attacker's IPs are all different.
      RL_CONFIRM_IP: createMockRateLimit(1_000),
    });
  }

  /**
   * A sub-router carries no error handler, so a thrown error would surface as
   * an opaque 500 and a rate-limit refusal would be indistinguishable from a
   * wrong code. Mounting it under a minimal app that reports the error's code
   * is what makes the two tellable apart here; production uses the real
   * handler from `src/index.ts`.
   */
  function makeApp() {
    const app = new Hono<{ Bindings: Env }>();
    app.onError((error, c) =>
      c.json({ code: (error as { code?: string }).code ?? 'UNKNOWN' }, 500),
    );
    app.route('', verify);
    return app;
  }

  function guess(app: ReturnType<typeof makeApp>, env: Env, address: string, ip: string) {
    return app.request(
      '/api/intake/verify/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
        body: JSON.stringify({ email: address, code: '000000' }),
      },
      env,
    );
  }

  async function codeOf(response: Response): Promise<string> {
    return (await response.json<{ code?: string }>().catch(() => ({}))).code ?? '';
  }

  it('refuses further guesses at one address even when every guess comes from a new IP', async () => {
    const env = makeRouteEnv();
    const app = makeApp();
    await issueVerificationCode(env, email);

    for (let attempt = 0; attempt < CONFIRM_LIMIT; attempt++) {
      // Refused for being wrong, by the guard — not yet by the limiter.
      expect(await codeOf(await guess(app, env, email, `10.0.0.${attempt}`))).not.toBe(
        'RATE_LIMITED',
      );
    }

    expect(await codeOf(await guess(app, env, email, '10.0.0.99'))).toBe('RATE_LIMITED');

    // A different address still has its own budget: the rule keys on the
    // normalized address, not globally.
    await issueVerificationCode(env, 'bystander@example.edu');
    expect(
      await codeOf(await guess(app, env, 'bystander@example.edu', '10.0.0.99')),
    ).not.toBe('RATE_LIMITED');
  });

  it('keys the address limit after normalization', async () => {
    const env = makeRouteEnv();
    const app = makeApp();
    await issueVerificationCode(env, email);

    for (let attempt = 0; attempt < CONFIRM_LIMIT; attempt++) {
      await guess(app, env, email, `10.0.1.${attempt}`);
    }

    // Varying the case must not buy a fresh budget.
    expect(await codeOf(await guess(app, env, 'Target@Example.EDU', '10.0.1.99'))).toBe(
      'RATE_LIMITED',
    );
  });
});
