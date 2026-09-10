import { KV_KEYS, R2_PATHS, SHOWCASE_ROUTES } from '@sesap/types';
import type { IntakeSession, InterviewRecord, SubmitterMedia } from '@sesap/types';
import { buildConsentRecord, NotFoundError } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';

const logger = new Logger({ worker: 'sesap-intake', module: 'interview-service' });

export async function getInterview(env: Env, id: string): Promise<InterviewRecord> {
  const raw = await env.SESAP_KV.get(KV_KEYS.interview(id));
  if (!raw) throw new NotFoundError('Interview', id);
  return JSON.parse(raw) as InterviewRecord;
}

export async function putInterview(env: Env, record: InterviewRecord): Promise<void> {
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));
}

export interface CreateSelfServiceInput {
  /** Allocated when the upload started, because R2 keys embed it. */
  id: string;
  session: IntakeSession;
  media: SubmitterMedia;
  /** Key of the browser-extracted audio that processing will transcribe. */
  audioKey: string;
  audioContentType: string;
  audioSizeBytes: number;
  ip?: string;
  userAgent?: string;
}

/**
 * Create the interview record for a completed self-service upload, archive the
 * consent, and wait for staff media moderation before any processing.
 *
 * The first gate is staff review of raw media. No AI service is called until
 * an administrator records a pre-analysis approval.
 */
export async function createSelfServiceInterview(
  env: Env,
  { id, session, media, audioKey, audioContentType, audioSizeBytes, ip, userAgent }:
    CreateSelfServiceInput,
): Promise<InterviewRecord> {
  if (!session.consent) {
    throw new NotFoundError('Consent for session', session.email);
  }

  const now = new Date().toISOString();

  const consent = await buildConsentRecord({
    interviewId: id,
    attribution: session.consent.attribution,
    displayName: session.name,
    agreedAt: session.consent.agreedAt,
    ip,
    userAgent,
  });

  // Archive consent before the record exists, so there can never be a submitted
  // interview whose consent was not written down.
  await env.SESAP_BUCKET.put(R2_PATHS.consent(id), JSON.stringify(consent, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });

  const record: InterviewRecord = {
    id,
    title: `${session.major ?? 'Alumni'} interview — ${session.graduationYear ?? 'unknown year'}`,
    demographics: session.demographics ?? {},
    metadata: { interviewDate: now.slice(0, 10) },
    source: 'audio',
    origin: 'self_service',
    submitter: {
      email: session.email,
      name: session.name ?? '',
      major: session.major,
      graduationYear: session.graduationYear,
      verifiedAt: session.verifiedAt,
    },
    consent,
    media,
    submitterReview: { revisionRound: 0 },
    video: { provider: 'r2', embedUrl: SHOWCASE_ROUTES.media(id) },
    // Processing transcribes the extracted audio and deletes it afterward; the
    // full media file under `media/` is what the showcase later streams.
    audioRef: {
      key: audioKey,
      contentType: audioContentType,
      sizeBytes: audioSizeBytes,
      uploadedAt: media.uploadedAt,
    },
    processing: { status: 'pending' },
    approval: { status: 'pending_media_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  logger.info('Self-service interview awaiting media review', { id, attribution: consent.attribution });
  return record;
}
