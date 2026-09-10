import { ValidationError, sha256Hex } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import type { ConfirmResult } from '../durable/verification-guard';
import { randomVerificationCode } from './crypto';

export type { ConfirmResult };

const logger = new Logger({ worker: 'sesap-intake', module: 'verification' });

export const CODE_TTL_SECONDS = 15 * 60;
export const MAX_CODE_ATTEMPTS = 5;
/** RFC 5321 caps a path at 256 octets; anything longer is not a mailbox. */
export const MAX_EMAIL_LENGTH = 254;

/**
 * Normalize an address for keying and comparison. Case is folded because email
 * domains are case-insensitive and mailbox case is, in practice, ignored by
 * every provider we care about here.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Enrollment is open: any address on the internet may verify. A verification
 * address proves inbox control, not institutional affiliation, so there is no
 * domain allow-list to consult — only syntax, deliberately conservative, and
 * mailbox ownership proven by the emailed code.
 *
 * Because that makes this an internet-facing endpoint, the volumetric controls
 * around it are load-bearing: Turnstile on `verify/start`, the per-address and
 * per-IP rate limits, and the per-address submission quota in `routes/upload`.
 */
export function isAllowedEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (normalized.length > MAX_EMAIL_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function assertAllowedEmail(email: string): string {
  if (!isAllowedEmail(email)) {
    throw new ValidationError('Enter a valid email address.');
  }
  return normalizeEmail(email);
}

/** The guard instance for one address. */
function guardFor(env: Env, email: string) {
  return env.INTAKE_VERIFY.get(env.INTAKE_VERIFY.idFromName(normalizeEmail(email)));
}

async function callGuard<T>(env: Env, email: string, path: string, body: unknown): Promise<T> {
  const response = await guardFor(env, email).fetch(`https://intake-verify${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Verification guard returned ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Issue a fresh code, replacing any outstanding one for the same address. */
export async function issueVerificationCode(env: Env, email: string): Promise<string> {
  const code = randomVerificationCode();
  await callGuard(env, email, '/issue', {
    codeHash: await sha256Hex(code),
    ttlSeconds: CODE_TTL_SECONDS,
  });
  // The address itself is PII and stays out of the log.
  logger.info('Issued verification code', { ttlSeconds: CODE_TTL_SECONDS });
  return code;
}

/** Check a submitted code against the address's guard. */
export async function confirmVerificationCode(
  env: Env,
  email: string,
  code: string,
): Promise<ConfirmResult> {
  const result = await callGuard<ConfirmResult>(env, email, '/confirm', {
    codeHash: await sha256Hex(code.trim()),
    maxAttempts: MAX_CODE_ATTEMPTS,
  });
  if (!result.ok && result.reason === 'attempts_exhausted') {
    logger.warn('Verification attempts exhausted');
  }
  return result;
}
