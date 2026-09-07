import { KV_KEYS } from '@sesap/types';
import type { InterviewRecord } from '@sesap/types';
import { AuthenticationError } from '@sesap/core';
import type { Env } from '../bindings';
import { randomToken, sha256Hex } from './crypto';

/** Long enough for a student to get to it, short enough to be worth expiring. */
export const REVIEW_TOKEN_TTL_DAYS = 14;
const TTL_SECONDS = REVIEW_TOKEN_TTL_DAYS * 24 * 60 * 60;

/**
 * Mint a review token for an interview.
 *
 * Only the hash is stored — in KV as a lookup, and on the record for
 * single-use enforcement. The token itself exists only in the email, so a dump
 * of either store does not yield working links.
 */
export async function mintReviewToken(
  env: Env,
  record: InterviewRecord,
): Promise<{ token: string; url: string }> {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();

  await env.SESAP_KV.put(KV_KEYS.intakeReviewToken(tokenHash), record.id, {
    expirationTtl: TTL_SECONDS,
  });

  record.submitterReview = {
    ...(record.submitterReview ?? { revisionRound: 0 }),
    tokenHash,
    tokenExpiresAt: expiresAt,
    submittedAt: undefined,
  };

  return {
    token,
    url: `${env.INTAKE_URL.replace(/\/+$/, '')}/review/${token}`,
  };
}

/**
 * Resolve a token to its interview, rejecting anything expired, already used,
 * or superseded by a newer token for the same interview.
 */
export async function resolveReviewToken(
  env: Env,
  token: string,
  loadInterview: (id: string) => Promise<InterviewRecord>,
): Promise<InterviewRecord> {
  const tokenHash = await sha256Hex(token);
  const interviewId = await env.SESAP_KV.get(KV_KEYS.intakeReviewToken(tokenHash));
  if (!interviewId) {
    throw new AuthenticationError('This review link has expired or already been used.');
  }

  const record = await loadInterview(interviewId);
  const review = record.submitterReview;

  // The KV entry alone is not enough: a re-mint after a rejection must
  // invalidate the previous link even though its KV entry has not expired yet.
  if (!review || review.tokenHash !== tokenHash || review.submittedAt) {
    await env.SESAP_KV.delete(KV_KEYS.intakeReviewToken(tokenHash));
    throw new AuthenticationError('This review link has expired or already been used.');
  }

  if (review.tokenExpiresAt && Date.parse(review.tokenExpiresAt) <= Date.now()) {
    await env.SESAP_KV.delete(KV_KEYS.intakeReviewToken(tokenHash));
    throw new AuthenticationError('This review link has expired.');
  }

  return record;
}

/** Burn a token once its interview has been submitted for admin review. */
export async function invalidateReviewToken(env: Env, tokenHash: string): Promise<void> {
  await env.SESAP_KV.delete(KV_KEYS.intakeReviewToken(tokenHash));
}
