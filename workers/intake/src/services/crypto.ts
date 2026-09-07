/**
 * Crypto helpers for the session cookie, verification codes and review tokens.
 * One-way hashing and constant-time comparison come from `@sesap/core`, shared
 * with the consent module and the seed tooling; what is here is intake-only.
 */
import { bytesToHex } from '@sesap/core';

export { sha256Hex, timingSafeEqual } from '@sesap/core';

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function hmacHex(secret: string, value: string): Promise<string> {
  return bytesToHex(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(value)));
}

/** URL-safe random token, e.g. for review links and session ids. */
export function randomToken(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return bytesToHex(buffer);
}

/**
 * A 6-digit verification code, uniformly distributed. Rejection sampling keeps
 * the modulo bias out — with a million outcomes it would otherwise be visible.
 */
export function randomVerificationCode(): string {
  const limit = 1_000_000;
  const max = Math.floor(0xffffffff / limit) * limit;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= max);
  return String(value % limit).padStart(6, '0');
}
