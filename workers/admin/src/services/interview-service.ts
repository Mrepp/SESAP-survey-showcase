import type {
  InterviewRecord,
  CreateInterviewRequest,
  BuildDirtyState,
  BuildMetadata,
  KalturaRef,
  InterviewVideo,
  NotificationMessage,
} from '@sesap/types';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import {
  generateInterviewId,
  NotFoundError,
  ProcessingError,
  ValidationError,
  parseKalturaSource,
  parseVideoEmbed,
} from '@sesap/core';
import {
  listInterviewRecords,
  Logger,
  markBuildDirty as markBuildDirtyInKv,
  readBuildDirty,
} from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import * as storageService from './storage-service';

function audioExtFromContentType(contentType: string): string {
  const lc = contentType.toLowerCase();
  if (lc.includes('mpeg') || lc.includes('mp3')) return 'mp3';
  if (lc.includes('ogg')) return 'ogg';
  if (lc.includes('webm')) return 'webm';
  if (lc.includes('mp4') || lc.includes('m4a') || lc.includes('aac')) return 'm4a';
  if (lc.includes('wav') || lc.includes('wave')) return 'wav';
  if (lc.includes('flac')) return 'flac';
  return 'bin';
}

const logger = new Logger({ worker: 'sesap-admin', module: 'interview-service' });

export async function createInterview(
  env: Env,
  request: CreateInterviewRequest,
  transcript: string,
  video?: InterviewVideo,
): Promise<InterviewRecord> {
  const id = generateInterviewId();
  const now = new Date().toISOString();

  logger.info('Creating interview', { id, title: request.title });

  await storageService.uploadTranscript(env.SESAP_BUCKET, id, transcript);

  const verification = await env.SESAP_BUCKET.head(R2_PATHS.transcript(id));
  if (!verification) {
    throw new ProcessingError('Transcript upload verification failed');
  }

  const record: InterviewRecord = {
    id,
    title: request.title,
    demographics: request.demographics,
    metadata: request.metadata,
    source: 'transcript',
    video,
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: true, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload' },
  });

  record.processing.status = 'queued';
  record.processing.queuedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Interview created and queued', { id });
  return record;
}

export async function createInterviewFromAudio(
  env: Env,
  request: CreateInterviewRequest,
  audioBytes: ArrayBuffer,
  contentType: string,
  video?: InterviewVideo,
): Promise<InterviewRecord> {
  const id = generateInterviewId();
  const now = new Date().toISOString();
  const ext = audioExtFromContentType(contentType);

  logger.info('Creating interview from audio', {
    id,
    title: request.title,
    sizeBytes: audioBytes.byteLength,
    contentType,
  });

  //audio
  const key = await storageService.uploadAudio(env.SESAP_BUCKET, id, ext, audioBytes, contentType);

  const verification = await env.SESAP_BUCKET.head(key);
  if (!verification) {
    throw new ProcessingError('Audio upload verification failed');
  }

  const record: InterviewRecord = {
    id,
    title: request.title,
    demographics: request.demographics,
    metadata: request.metadata,
    source: 'audio',
    audioRef: {
      key,
      contentType,
      sizeBytes: audioBytes.byteLength,
      uploadedAt: now,
    },
    video,
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload' },
  });

  record.processing.status = 'queued';
  record.processing.queuedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Audio interview created and queued', { id });
  return record;
}

export async function createInterviewFromKaltura(
  env: Env,
  request: CreateInterviewRequest,
  rawSource: string,
): Promise<InterviewRecord> {
  const id = generateInterviewId();
  const now = new Date().toISOString();

  const parsed = parseKalturaSource(rawSource);
  const partnerId = parsed.partnerId ?? env.KALTURA_PARTNER_ID;
  if (!partnerId) {
    throw new ValidationError(
      'Could not determine the Kaltura partner id. Paste an embed iframe (which carries it) or set KALTURA_PARTNER_ID.',
    );
  }

  const kalturaRef: KalturaRef = {
    entryId: parsed.entryId,
    partnerId,
    widgetId: parsed.widgetId,
    uiconfId: parsed.uiconfId ?? (env.KALTURA_UICONF_ID || undefined),
    sourceInput: rawSource,
  };
  const video = parseVideoEmbed(rawSource, {
    fallbackKalturaPartnerId: partnerId,
    fallbackKalturaUiconfId: env.KALTURA_UICONF_ID || undefined,
  });

  logger.info('Creating interview from Kaltura', {
    id,
    title: request.title,
    entryId: kalturaRef.entryId,
    partnerId: kalturaRef.partnerId,
  });

  const record: InterviewRecord = {
    id,
    title: request.title,
    demographics: request.demographics,
    metadata: request.metadata,
    source: 'kaltura',
    kalturaRef,
    video,
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload' },
  });

  record.processing.status = 'queued';
  record.processing.queuedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Kaltura interview created and queued', { id });
  return record;
}

export async function listInterviews(env: Env): Promise<InterviewRecord[]> {
  return listInterviewRecords(env.SESAP_KV);
}

export async function getInterview(env: Env, id: string): Promise<InterviewRecord> {
  const raw = await env.SESAP_KV.get(KV_KEYS.interview(id));
  if (!raw) {
    throw new NotFoundError('Interview', id);
  }
  return JSON.parse(raw);
}

/**
 * Best-effort notification to intake. A failure here must never fail the admin
 * action it accompanies — the state change is already committed, and the
 * message is a courtesy email, not part of the record.
 */
async function notify(
  env: Env,
  kind: NotificationMessage['kind'],
  record: InterviewRecord,
): Promise<void> {
  if (!env.NOTIFICATION_QUEUE || record.origin !== 'self_service') return;
  try {
    await env.NOTIFICATION_QUEUE.send({
      kind,
      interviewId: record.id,
      queuedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to enqueue notification', {
      id: record.id,
      kind,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * How many times a self-service interview may be sent back to its submitter
 * before rejection becomes terminal. Two rounds is enough to fix a real problem
 * and few enough that a disagreement does not become a loop.
 */
export const MAX_REVISION_ROUNDS = 2;

/**
 * Approval preconditions. Only a completed interview that is waiting on an
 * admin — or one an admin previously rejected and now wants after all — can be
 * approved. Enforced here, not only in the UI, because this is the API that
 * owns the state.
 */
export function assertApprovable(record: InterviewRecord): void {
  if (record.processing.status !== 'completed') {
    throw new ValidationError(
      `Interview cannot be approved until processing completes (processing: ${record.processing.status})`,
    );
  }
  if (record.approval.status !== 'pending_review' && record.approval.status !== 'rejected') {
    throw new ValidationError(
      `Interview cannot be approved from approval status '${record.approval.status}'`,
    );
  }
}

/**
 * Forget the submitter's review link on the record. Intake checks the record's
 * hash before honouring a token, so clearing it here is enough to burn the
 * link — admin never needs to know the token itself.
 */
function clearSubmitterToken(record: InterviewRecord): void {
  if (!record.submitterReview) return;
  record.submitterReview = {
    ...record.submitterReview,
    tokenHash: undefined,
    tokenExpiresAt: undefined,
  };
}

/**
 * Approve an interview.
 *
 * Approval is a state change on the record and nothing more: the public
 * document is assembled by indexing at build time from the record and its R2
 * artifacts, so there is no snapshot to write here and later edits reach the
 * showcase on the next build. The artifacts are still checked so a record
 * cannot be approved without an analysis to publish.
 */
export async function approveInterview(env: Env, id: string, reviewedBy?: string): Promise<InterviewRecord> {
  const record = await getInterview(env, id);
  const now = new Date().toISOString();

  assertApprovable(record);
  logger.info('Approving interview', { id });

  // Both must exist for the build to include this interview.
  await storageService.getTranscript(env.SESAP_BUCKET, id);
  await storageService.getAnalysis(env.SESAP_BUCKET, id);

  record.approval.status = 'approved';
  record.approval.reviewedAt = now;
  record.approval.reviewedBy = reviewedBy;
  record.approval.adminConfirmed = true;
  record.approval.adminConfirmedAt = now;
  record.approval.adminConfirmedBy = reviewedBy;
  record.approval.rejectionReason = undefined;
  // A live review link on a published interview would let the submitter keep
  // editing it, or hand it back to the admin queue.
  clearSubmitterToken(record);
  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Mark build as dirty (indexes need rebuilding)
  await markBuildDirty(env, 'approve');

  await notify(env, 'approved', record);

  logger.info('Interview approved — indexes marked dirty', { id });
  return record;
}

/** Admit moderated self-service media to the processing pipeline exactly once. */
export async function approveForAnalysis(
  env: Env,
  id: string,
  reviewedBy: string,
): Promise<InterviewRecord> {
  const record = await getInterview(env, id);
  if (record.origin !== 'self_service' || record.approval.status !== 'pending_media_review') {
    throw new ValidationError('Only self-service submissions awaiting media review can be approved for analysis.');
  }
  if (!record.media || !record.audioRef) throw new ValidationError('Submitted media is unavailable.');

  const now = new Date().toISOString();
  record.approval.preAnalysisReviewedAt = now;
  record.approval.preAnalysisReviewedBy = reviewedBy;
  record.processing.status = 'queued';
  record.processing.queuedAt = now;
  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  try {
    await env.PROCESSING_QUEUE.send({
      interviewId: id,
      queuedAt: now,
      metadata: { triggeredBy: reviewedBy, reason: 'new_upload' },
    });
  } catch (error) {
    // Keep the record actionable when enqueueing fails; without this rollback
    // a staff member could not retry the approval endpoint.
    record.approval.preAnalysisReviewedAt = undefined;
    record.approval.preAnalysisReviewedBy = undefined;
    record.processing = { status: 'pending' };
    record.updatedAt = new Date().toISOString();
    await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
    throw error;
  }
  logger.info('Self-service media approved for analysis', { id, reviewedBy });
  return record;
}

/** Terminal pre-analysis moderation rejection; consent/audit stays in KV/R2. */
export async function rejectBeforeAnalysis(
  env: Env,
  id: string,
  reason: string,
  reviewedBy: string,
): Promise<InterviewRecord> {
  if (!reason.trim()) throw new ValidationError('A rejection reason is required.');
  const record = await getInterview(env, id);
  if (record.origin !== 'self_service' || record.approval.status !== 'pending_media_review') {
    throw new ValidationError('Only self-service submissions awaiting media review can be rejected before analysis.');
  }
  const now = new Date().toISOString();
  await Promise.all([
    record.media ? storageService.deleteMediaByKey(env.SESAP_BUCKET, record.media.key) : Promise.resolve(),
    storageService.deleteAudioTemp(env.SESAP_BUCKET, id),
  ]);
  record.media = undefined;
  record.audioRef = undefined;
  record.processing.status = 'failed';
  record.processing.failedAt = now;
  record.processing.error = 'Rejected before analysis';
  record.approval.status = 'rejected';
  record.approval.rejectionReason = reason.trim();
  record.approval.preAnalysisReviewedAt = now;
  record.approval.preAnalysisReviewedBy = reviewedBy;
  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  await notify(env, 'rejected_before_analysis', record);
  return record;
}

/**
 * Reject an interview.
 *
 * For an admin-authored interview this is terminal, as it always has been. A
 * self-service interview instead goes back to its submitter for one more pass —
 * up to {@link MAX_REVISION_ROUNDS} times, after which rejection is terminal for
 * it too. Intake mints the new review token when it consumes the notification;
 * admin deliberately knows nothing about tokens.
 */
export async function rejectInterview(env: Env, id: string, reason: string): Promise<InterviewRecord> {
  const record = await getInterview(env, id);
  const now = new Date().toISOString();

  const review = record.submitterReview ?? { revisionRound: 0 };
  const reopenable =
    record.origin === 'self_service' && review.revisionRound < MAX_REVISION_ROUNDS;
  const wasPublished = record.approval.status === 'approved';

  logger.info('Rejecting interview', { id, reason, reopenable, wasPublished });

  record.approval.status = reopenable ? 'pending_submitter_review' : 'rejected';
  record.approval.rejectionReason = reason;
  record.approval.reviewedAt = now;

  if (reopenable) {
    record.submitterReview = {
      ...review,
      revisionRound: review.revisionRound + 1,
      submittedAt: undefined,
      tokenHash: undefined,
      tokenExpiresAt: undefined,
    };
  }

  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Rejecting a published interview unpublishes it: the next build drops it,
  // and the flag is what tells someone to run that build.
  if (wasPublished) await markBuildDirty(env, 'reject');

  if (reopenable) await notify(env, 'rejected', record);

  logger.info('Interview rejected', { id, status: record.approval.status });
  return record;
}

/**
 * Delete an interview and everything stored for it.
 *
 * For a self-service interview that includes the contributor's media. The
 * archived consent is not destroyed: it moves to `consent/withdrawn/`, stamped
 * with who deleted it and when, as proof both of the original agreement and of
 * its withdrawal.
 */
export async function deleteInterview(env: Env, id: string, deletedBy?: string): Promise<void> {
  const record = await getInterview(env, id);

  logger.info('Deleting interview', { id, approvalStatus: record.approval.status, origin: record.origin });

  const consent = await env.SESAP_BUCKET.get(R2_PATHS.consent(id));
  if (consent) {
    const archived = {
      ...((await consent.json()) as Record<string, unknown>),
      withdrawn: { deletedAt: new Date().toISOString(), deletedBy: deletedBy ?? 'unknown' },
    };
    await env.SESAP_BUCKET.put(R2_PATHS.consentWithdrawn(id), JSON.stringify(archived, null, 2), {
      httpMetadata: { contentType: 'application/json' },
    });
  }

  // `allSettled`, not `all`: erasure must reach the KV record and the build
  // flag even if one artifact is already gone or its delete fails. A partial
  // failure is logged and the withdrawal still completes.
  const artifacts: [string, Promise<unknown>][] = [
    ['transcript', env.SESAP_BUCKET.delete(R2_PATHS.transcript(id))],
    ['analysis', env.SESAP_BUCKET.delete(R2_PATHS.analysis(id))],
    ['embeddings', env.SESAP_BUCKET.delete(R2_PATHS.embeddings(id))],
    // Legacy approve-time snapshot, from before indexing assembled from source.
    ['interview', env.SESAP_BUCKET.delete(R2_PATHS.interview(id))],
    ['consent', env.SESAP_BUCKET.delete(R2_PATHS.consent(id))],
    ['audioTemp', storageService.deleteAudioTemp(env.SESAP_BUCKET, id)],
    ['media', storageService.deleteMedia(env.SESAP_BUCKET, id)],
  ];
  const settled = await Promise.allSettled(artifacts.map(([, promise]) => promise));
  settled.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error('Failed to delete interview artifact', {
        id,
        artifact: artifacts[index][0],
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });

  // Deleting the record removes it from the index: the index *is* the key space.
  await env.SESAP_KV.delete(KV_KEYS.interview(id));

  if (record.approval.status === 'approved') {
    await markBuildDirty(env, 'delete');
  }

  logger.info('Interview deleted', { id });
}

export async function markBuildDirty(
  env: Env,
  changeType: BuildDirtyState['lastChangeType'],
): Promise<void> {
  await markBuildDirtyInKv(env.SESAP_KV, changeType);
}

export async function getBuildStatus(env: Env): Promise<{
  dirty: BuildDirtyState | null;
  manifest: BuildMetadata | null;
}> {
  const [dirty, manifestRaw] = await Promise.all([
    readBuildDirty(env.SESAP_KV),
    env.SESAP_KV.get(KV_KEYS.buildManifest),
  ]);

  return {
    dirty,
    manifest: manifestRaw ? JSON.parse(manifestRaw) : null,
  };
}
