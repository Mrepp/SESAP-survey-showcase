import type {
  Interview,
  InterviewRecord,
  CreateInterviewRequest,
  InterviewEmbeddings,
  Analysis,
  BuildDirtyState,
  BuildMetadata,
  KalturaRef,
} from '@sesap/types';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import {
  generateInterviewId,
  NotFoundError,
  Logger,
  ProcessingError,
  ValidationError,
  parseKalturaSource,
} from '@sesap/shared';
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

async function appendToInterviewsList(env: Env, id: string): Promise<void> {
  const listRaw = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  const list: string[] = listRaw ? JSON.parse(listRaw) : [];
  list.push(id);
  await env.SESAP_KV.put(KV_KEYS.interviewsList, JSON.stringify(list));
}

const logger = new Logger({ worker: 'sesap-admin', module: 'interview-service' });

export async function createInterview(
  env: Env,
  request: CreateInterviewRequest,
  transcript: string,
): Promise<InterviewRecord> {
  const id = generateInterviewId();
  const now = new Date().toISOString();

  logger.info('Creating interview', { id, title: request.title });

  // 1. Upload to R2
  await storageService.uploadTranscript(env.SESAP_BUCKET, id, transcript);

  // 2. Verify R2 upload (eliminates race condition)
  const verification = await env.SESAP_BUCKET.head(R2_PATHS.transcript(id));
  if (!verification) {
    throw new ProcessingError('Transcript upload verification failed');
  }

  // 3. Create unified record
  const record: InterviewRecord = {
    id,
    title: request.title,
    demographics: request.demographics,
    metadata: request.metadata,
    source: 'transcript',
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: true, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  // 4. Store in KV
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // 5. Update interviews list
  await appendToInterviewsList(env, id);

  // 6. Send to queue (guaranteed delivery)
  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload' },
  });

  // 7. Update status to 'queued'
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

  // 1. Upload audio to R2 (temporary)
  const key = await storageService.uploadAudio(env.SESAP_BUCKET, id, ext, audioBytes, contentType);

  // 2. Verify upload
  const verification = await env.SESAP_BUCKET.head(key);
  if (!verification) {
    throw new ProcessingError('Audio upload verification failed');
  }

  // 3. Create record
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
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  await appendToInterviewsList(env, id);

  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload_audio' },
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
    sourceInput: rawSource,
  };

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
    processing: { status: 'pending' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: now,
    updatedAt: now,
  };

  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
  await appendToInterviewsList(env, id);

  await env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: { triggeredBy: 'admin', reason: 'new_upload_kaltura' },
  });

  record.processing.status = 'queued';
  record.processing.queuedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Kaltura interview created and queued', { id });
  return record;
}

export async function listInterviews(env: Env): Promise<InterviewRecord[]> {
  const listRaw = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (!listRaw) {
    return [];
  }

  const ids: string[] = JSON.parse(listRaw);
  const records: InterviewRecord[] = [];

  for (const id of ids) {
    const raw = await env.SESAP_KV.get(KV_KEYS.interview(id));
    if (raw) {
      const record: InterviewRecord = JSON.parse(raw);
      records.push(record);
    }
  }

  return records;
}

export async function getInterview(env: Env, id: string): Promise<InterviewRecord> {
  const raw = await env.SESAP_KV.get(KV_KEYS.interview(id));
  if (!raw) {
    throw new NotFoundError('Interview', id);
  }
  return JSON.parse(raw);
}

export async function approveInterview(env: Env, id: string): Promise<InterviewRecord> {
  const record = await getInterview(env, id);
  const now = new Date().toISOString();

  logger.info('Approving interview', { id });

  // Get transcript from R2
  const transcriptText = await storageService.getTranscript(env.SESAP_BUCKET, id);

  // Get analysis from R2
  const analysis = await storageService.getAnalysis(env.SESAP_BUCKET, id) as Analysis;

  // Get embeddings from R2 (may not exist)
  const embeddings = await storageService.getEmbeddings(env.SESAP_BUCKET, id) as InterviewEmbeddings | null;

  // Count words for transcript validation
  const words = transcriptText.split(/\s+/).filter(Boolean);

  // Assemble full Interview JSON
  const interview: Interview = {
    id,
    title: record.title,
    demographics: record.demographics,
    transcript: {
      rawText: transcriptText,
      validation: {
        wordCount: words.length,
        hasQuestions: transcriptText.includes('?'),
        hasResponses: words.length > 50,
        estimatedDuration: `${Math.round(words.length / 150)} minutes`,
      },
    },
    metadata: record.metadata,
    analysis,
    embeddings: embeddings ?? undefined,
    createdAt: record.createdAt,
    updatedAt: now,
  };

  // Store in interview repository
  await storageService.storeInterview(env.SESAP_BUCKET, id, interview);

  // Update KV record to approved before building
  record.approval.status = 'approved';
  record.approval.reviewedAt = now;
  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Mark build as dirty (indexes need rebuilding)
  await markBuildDirty(env, 'approve');

  logger.info('Interview approved — indexes marked dirty', { id });
  return record;
}

export async function rejectInterview(env: Env, id: string, reason: string): Promise<InterviewRecord> {
  const record = await getInterview(env, id);
  const now = new Date().toISOString();

  logger.info('Rejecting interview', { id, reason });

  record.approval.status = 'rejected';
  record.approval.rejectionReason = reason;
  record.approval.reviewedAt = now;
  record.updatedAt = now;
  await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Interview rejected', { id });
  return record;
}

export async function deleteInterview(env: Env, id: string): Promise<void> {
  const record = await getInterview(env, id);

  logger.info('Deleting interview', { id, approvalStatus: record.approval.status });

  // 1. Delete all R2 artifacts for this interview
  await Promise.all([
    env.SESAP_BUCKET.delete(R2_PATHS.transcript(id)),
    env.SESAP_BUCKET.delete(R2_PATHS.analysis(id)),
    env.SESAP_BUCKET.delete(R2_PATHS.embeddings(id)),
    env.SESAP_BUCKET.delete(R2_PATHS.interview(id)),
    storageService.deleteAudioTemp(env.SESAP_BUCKET, id),
  ]);

  // 2. Delete KV record
  await env.SESAP_KV.delete(KV_KEYS.interview(id));

  // 3. Remove from interviews list
  const listRaw = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (listRaw) {
    const list: string[] = JSON.parse(listRaw);
    const updated = list.filter((item) => item !== id);
    await env.SESAP_KV.put(KV_KEYS.interviewsList, JSON.stringify(updated));
  }

  // 4. If the interview was approved, mark build as dirty (stale indexes)
  if (record.approval.status === 'approved') {
    await markBuildDirty(env, 'delete');
  }

  logger.info('Interview deleted', { id });
}

export async function markBuildDirty(
  env: Env,
  changeType: BuildDirtyState['lastChangeType'],
): Promise<void> {
  const raw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
  const current: BuildDirtyState = raw
    ? JSON.parse(raw)
    : { isDirty: false, pendingChanges: 0, lastChangeAt: '', lastChangeType: changeType, lastBuildAt: null };

  current.isDirty = true;
  current.pendingChanges += 1;
  current.lastChangeAt = new Date().toISOString();
  current.lastChangeType = changeType;

  await env.SESAP_KV.put(KV_KEYS.buildDirty, JSON.stringify(current));
}

export async function getBuildStatus(env: Env): Promise<{
  dirty: BuildDirtyState | null;
  manifest: BuildMetadata | null;
}> {
  const [dirtyRaw, manifestRaw] = await Promise.all([
    env.SESAP_KV.get(KV_KEYS.buildDirty),
    env.SESAP_KV.get(KV_KEYS.buildManifest),
  ]);

  return {
    dirty: dirtyRaw ? JSON.parse(dirtyRaw) : null,
    manifest: manifestRaw ? JSON.parse(manifestRaw) : null,
  };
}

export async function clearBuildDirty(env: Env): Promise<void> {
  const raw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
  const current: BuildDirtyState = raw
    ? JSON.parse(raw)
    : { isDirty: false, pendingChanges: 0, lastChangeAt: '', lastChangeType: 'approve', lastBuildAt: null };

  current.isDirty = false;
  current.pendingChanges = 0;
  current.lastBuildAt = new Date().toISOString();

  await env.SESAP_KV.put(KV_KEYS.buildDirty, JSON.stringify(current));
}
