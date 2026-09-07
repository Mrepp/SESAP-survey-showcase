import type { AttributionChoice, ConsentRecord } from '@sesap/types';
import { sha256Hex } from '../crypto';
import { CONSENT_TEXT, CONSENT_VERSION } from './consent-text';

export * from './consent-text';

/**
 * SHA-256 of the exact consent text a contributor agreed to, hex-encoded.
 *
 * Storing the hash alongside the version means a later edit to the wording of a
 * shipped version is detectable rather than silent.
 */
export function hashConsentText(text: string = CONSENT_TEXT): Promise<string> {
  return sha256Hex(text);
}

export interface BuildConsentRecordInput {
  interviewId: string;
  attribution: AttributionChoice;
  /** Required when `attribution` is `named`; ignored otherwise. */
  displayName?: string;
  agreedAt?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Assemble the immutable consent record archived to R2. Anonymous submissions
 * deliberately carry no display name, so an anonymous choice cannot later be
 * un-anonymized from the archive.
 */
export async function buildConsentRecord({
  interviewId,
  attribution,
  displayName,
  agreedAt,
  ip,
  userAgent,
}: BuildConsentRecordInput): Promise<ConsentRecord> {
  return {
    interviewId,
    consentVersion: CONSENT_VERSION,
    consentHash: await hashConsentText(),
    attribution,
    displayName: attribution === 'named' ? displayName : undefined,
    agreedAt: agreedAt ?? new Date().toISOString(),
    ip,
    userAgent,
  };
}
