import { KV_KEYS, R2_PATHS, SHOWCASE_ROUTES } from '@sesap/types';
import type {
  IntakeSession,
  InterviewRecord,
  InterviewVideo,
  KalturaRef,
  SubmitterMedia,
} from '@sesap/types';
import {
  buildConsentRecord,
  NotFoundError,
  parseKalturaSource,
  parseVideoEmbed,
  ValidationError,
} from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';

const logger = new Logger({ worker: 'sesap-intake', module: 'interview-service' });
const OSU_KALTURA_PARTNER_ID = '391241';

function knownKalturaPartnerId(sourceUrl?: string): string | undefined {
  if (!sourceUrl) return undefined;
  try {
    return new URL(sourceUrl).hostname === 'media.oregonstate.edu'
      ? OSU_KALTURA_PARTNER_ID
      : undefined;
  } catch {
    return undefined;
  }
}

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

export interface CreateSelfServiceKalturaInput {
  id: string;
  session: IntakeSession;
  source: string;
  fallbackPartnerId?: string;
  fallbackUiconfId?: string;
  ip?: string;
  userAgent?: string;
}

async function archiveConsent(
  env: Env,
  id: string,
  session: IntakeSession,
  ip?: string,
  userAgent?: string,
) {
  if (!session.consent) {
    throw new NotFoundError('Consent for session', session.email);
  }

  const consent = await buildConsentRecord({
    interviewId: id,
    attribution: session.consent.attribution,
    displayName: session.name,
    agreedAt: session.consent.agreedAt,
    ip,
    userAgent,
  });

  await env.SESAP_BUCKET.put(R2_PATHS.consent(id), JSON.stringify(consent, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });
  return consent;
}

function selfServiceFields(session: IntakeSession, now: string) {
  return {
    title: `${session.major ?? 'Alumni'} interview — ${session.graduationYear ?? 'unknown year'}`,
    demographics: session.demographics ?? {},
    metadata: { interviewDate: now.slice(0, 10) },
    origin: 'self_service' as const,
    submitter: {
      email: session.email,
      name: session.name ?? '',
      major: session.major,
      graduationYear: session.graduationYear,
      verifiedAt: session.verifiedAt,
    },
    submitterReview: { revisionRound: 0 },
    processing: { status: 'pending' as const },
    approval: { status: 'pending_media_review' as const },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };
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
  const now = new Date().toISOString();
  // Archive consent before the record exists, so there can never be a submitted
  // interview whose consent was not written down.
  const consent = await archiveConsent(env, id, session, ip, userAgent);

  const record: InterviewRecord = {
    id,
    ...selfServiceFields(session, now),
    source: 'audio',
    consent,
    media,
    video: { provider: 'r2', embedUrl: SHOWCASE_ROUTES.media(id) },
    // Processing transcribes the extracted audio and deletes it afterward; the
    // full media file under `media/` is what the showcase later streams.
    audioRef: {
      key: audioKey,
      contentType: audioContentType,
      sizeBytes: audioSizeBytes,
      uploadedAt: media.uploadedAt,
    },
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  logger.info('Self-service interview awaiting media review', { id, attribution: consent.attribution });
  return record;
}

/** Create a moderated self-service record backed by a public Kaltura entry. */
export async function createSelfServiceInterviewFromKaltura(
  env: Env,
  {
    id,
    session,
    source,
    fallbackPartnerId,
    fallbackUiconfId,
    ip,
    userAgent,
  }: CreateSelfServiceKalturaInput,
): Promise<InterviewRecord> {
  const parsed = parseKalturaSource(source);
  const partnerId =
    parsed.partnerId ?? fallbackPartnerId ?? knownKalturaPartnerId(parsed.embedUrl);
  if (!partnerId) {
    throw new ValidationError(
      'Could not determine the Kaltura partner id. Paste an embed iframe or contact the program.',
    );
  }

  const kalturaRef: KalturaRef = {
    entryId: parsed.entryId,
    partnerId,
    widgetId: parsed.widgetId,
    uiconfId: parsed.uiconfId ?? fallbackUiconfId,
    // Keep only the normalized URL/id needed for audit; never persist pasted
    // iframe markup from the public form.
    sourceInput: parsed.embedUrl ?? parsed.entryId,
  };
  const video: InterviewVideo = parseVideoEmbed(source, {
    fallbackKalturaPartnerId: partnerId,
    fallbackKalturaUiconfId: fallbackUiconfId,
  });
  const now = new Date().toISOString();
  const consent = await archiveConsent(env, id, session, ip, userAgent);

  const record: InterviewRecord = {
    id,
    ...selfServiceFields(session, now),
    source: 'kaltura',
    kalturaRef,
    video,
    consent,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  logger.info('Self-service Kaltura interview awaiting media review', {
    id,
    entryId: kalturaRef.entryId,
    attribution: consent.attribution,
  });
  return record;
}
