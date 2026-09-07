import { ValidationError, sha256Hex } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import type { ConfirmResult } from '../durable/verification-guard';
import { randomVerificationCode } from './crypto';

export type { ConfirmResult };

const logger = new Logger({ worker: 'sesap-intake', module: 'verification' });

export const CODE_TTL_SECONDS = 15 * 60;
export const MAX_CODE_ATTEMPTS = 5;

/**
 * Normalize an address for keying and comparison. Case is folded because email
 * domains are case-insensitive and mailbox case is, in practice, ignored by
 * every provider we care about here.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Enforce the institutional domain. Only exact-domain and subdomain addresses
 * pass — `oregonstate.edu.attacker.com` must not.
 */
export function isAllowedEmail(email: string, allowedDomain: string): boolean {
  const normalized = normalizeEmail(email);
  // Deliberately strict: one @, no spaces, a dot in the domain.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;

  const domain = normalized.slice(normalized.lastIndexOf('@') + 1);
  const allowed = allowedDomain.trim().toLowerCase();
  return domain === allowed || domain.endsWith(`.${allowed}`);
}

export function assertAllowedEmail(email: string, allowedDomain: string): string {
  if (!isAllowedEmail(email, allowedDomain)) {
    throw new ValidationError(`Use your @${allowedDomain} email address.`);
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
