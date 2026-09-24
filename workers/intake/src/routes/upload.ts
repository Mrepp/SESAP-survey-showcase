import { Hono } from 'hono';
import { generateInterviewId, ValidationError } from '@sesap/core';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { ApiResponse, IntakeSession, InterviewRecord, SubmitterMedia } from '@sesap/types';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { clientIp, enforceRateLimit } from '../services/rate-limit';
import {
  emailKeyHash,
  loadSessionFromRequest,
  putSession,
  requireSession,
} from '../services/session';
import {
  createSelfServiceInterview,
  createSelfServiceInterviewFromKaltura,
} from '../services/interview';

const logger = new Logger({ worker: 'sesap-intake', module: 'upload-routes' });

export const upload = new Hono<{ Bindings: Env }>();

/** Extensions we are willing to store, mapped from the browser's content type. */
const MEDIA_EXTENSIONS: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'audio/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/x-m4a': 'm4a',
};

/**
 * Byte budgets. Nothing upstream of R2 caps a request body, so these are the
 * only thing standing between a public endpoint and an unbounded write surface.
 *
 * The client sends 8 MiB parts (`ui/src/lib/api.ts`), so 16 MiB leaves room for
 * a differently-chunked client without leaving the part size open. The session
 * budget covers a long recording — roughly two hours of 720p — with margin, and
 * counts every accepted byte including retried parts: a retry costs a write
 * whether or not its bytes survive to the finished object.
 */
export const MAX_PART_BYTES = 16 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 64 * 1024 * 1024;
export const MAX_SESSION_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

/**
 * Interviews one verified address may submit. The session-scoped guards below
 * are per-session by construction and so cap nothing on their own; this is the
 * quota that actually holds, and it is keyed by the address that proved inbox
 * control rather than by the cookie in front of it.
 */
export const MAX_SUBMISSIONS_PER_EMAIL = 3;

/** Submission counts outlive a session but should not outlive the project. */
const SUBMISSION_COUNT_TTL_SECONDS = 365 * 24 * 60 * 60;

function mediaExtension(contentType: string): string {
  const base = normalizeContentType(contentType);
  const ext = MEDIA_EXTENSIONS[base];
  if (!ext) {
    throw new ValidationError(`Unsupported media type: ${base}`);
  }
  return ext;
}

function normalizeContentType(contentType: string): string {
  return contentType.split(';')[0].trim().toLowerCase();
}

/**
 * The audio track is transcribed, so it must actually be audio. `/upload/start`
 * has enforced this allow-list since it was written; this route took the raw
 * header and stored it as R2 metadata.
 */
function assertAudioContentType(contentType: string): string {
  const base = normalizeContentType(contentType);
  mediaExtension(base);
  if (!base.startsWith('audio/')) {
    throw new ValidationError(`Unsupported audio type: ${base}`);
  }
  return base;
}

function assertReadyToUpload(session: IntakeSession): void {
  if (!session.name) {
    throw new ValidationError('Complete your profile before uploading.');
  }
  if (!session.consent) {
    throw new ValidationError('Agree to the consent and release before uploading.');
  }
  if (session.submittedInterviewId) {
    throw new ValidationError(
      'This session has already submitted an interview. Watch your inbox for the review link.',
    );
  }
}

/** Both upload rate-limit rules, applied together on every upload route. */
async function enforceUploadLimits(env: Env, request: Request, sessionId: string): Promise<void> {
  await enforceRateLimit(env, 'RL_UPLOAD_IP', clientIp(request));
  await enforceRateLimit(env, 'RL_UPLOAD_SESSION', sessionId);
}

async function readSubmissionCount(env: Env, email: string): Promise<number> {
  const raw = await env.SESAP_KV.get(KV_KEYS.intakeSubmissionCount(await emailKeyHash(email)));
  const count = raw ? Number(raw) : 0;
  return Number.isFinite(count) && count > 0 ? count : 0;
}

/** Refuse a new upload once the address behind it is at its quota. */
async function assertSubmissionQuota(env: Env, email: string): Promise<void> {
  if ((await readSubmissionCount(env, email)) >= MAX_SUBMISSIONS_PER_EMAIL) {
    throw new ValidationError(
      'This address has submitted the maximum number of interviews. Contact the program if you need another.',
    );
  }
}

async function recordSubmission(env: Env, email: string): Promise<void> {
  const emailHash = await emailKeyHash(email);
  const next = (await readSubmissionCount(env, email)) + 1;
  await env.SESAP_KV.put(KV_KEYS.intakeSubmissionCount(emailHash), String(next), {
    expirationTtl: SUBMISSION_COUNT_TTL_SECONDS,
  });
}

/**
 * Charge bytes against the session's budget and persist the running total.
 *
 * Returns the session to write back, so the caller makes one `putSession` call
 * with both the byte total and whatever else it changed.
 */
function chargeBytes(session: IntakeSession, byteLength: number): IntakeSession {
  const used = (session.uploadedBytes ?? 0) + byteLength;
  if (used > MAX_SESSION_UPLOAD_BYTES) {
    throw new ValidationError(
      'This submission has exceeded its upload size limit. Record a shorter interview or contact the program.',
    );
  }
  return { ...session, uploadedBytes: used };
}

/** Dispose of browser media that was superseded by a new file or Kaltura link. */
async function discardPendingUpload(env: Env, session: IntakeSession): Promise<void> {
  if (session.upload) {
    try {
      await env.SESAP_BUCKET.resumeMultipartUpload(
        session.upload.key,
        session.upload.uploadId,
      ).abort();
    } catch (error) {
      logger.warn('Could not abort superseded multipart upload', {
        key: session.upload.key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  if (session.interviewId) {
    await env.SESAP_BUCKET.delete(R2_PATHS.audioTemp(session.interviewId, 'mp3'));
  }
}

async function assertInterviewIdUnused(env: Env, session: IntakeSession): Promise<void> {
  if (session.interviewId && (await env.SESAP_KV.get(KV_KEYS.interview(session.interviewId)))) {
    throw new ValidationError(
      'This session has already submitted an interview. Watch your inbox for the review link.',
    );
  }
}

async function finishSession(
  env: Env,
  sessionId: string,
  session: IntakeSession,
  record: InterviewRecord,
): Promise<void> {
  await recordSubmission(env, session.email);
  await putSession(env, sessionId, {
    ...session,
    upload: undefined,
    interviewId: undefined,
    submittedInterviewId: record.id,
  });
}

// POST /api/intake/upload/start — allocate an interview id and open an R2
// multipart upload. Student video routinely exceeds the Workers request-body
// cap, so the browser sends parts rather than one body.
upload.post('/api/intake/upload/start', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  await enforceUploadLimits(c.env, c.req.raw, sessionId);
  assertReadyToUpload(session);
  await assertSubmissionQuota(c.env, session.email);

  const body = await c.req.json<{ contentType?: unknown }>();
  if (typeof body.contentType !== 'string') {
    throw new ValidationError('contentType is required.');
  }

  const contentType = normalizeContentType(body.contentType);
  mediaExtension(contentType);
  // The browser cannot recover its Blob after a reload, so every deliberate
  // start is a replacement. Reusing same-type parts can corrupt a shorter
  // second file with stale trailing parts from the first.
  await assertInterviewIdUnused(c.env, session);
  await discardPendingUpload(c.env, session);
  const id = generateInterviewId();
  const key = R2_PATHS.media(id, mediaExtension(contentType));

  const multipart = await c.env.SESAP_BUCKET.createMultipartUpload(key, {
    httpMetadata: { contentType },
  });

  await putSession(c.env, sessionId, {
    ...session,
    interviewId: id,
    upload: { key, uploadId: multipart.uploadId, contentType, parts: [] },
  });

  logger.info('Multipart upload started', { id, key });

  const response: ApiResponse<{ interviewId: string; uploadId: string; key: string }> = {
    success: true,
    data: { interviewId: id, uploadId: multipart.uploadId, key },
  };
  return c.json(response);
});

// PUT /api/intake/upload/part?partNumber=N — one part of the media file. Part
// numbers are 1-based and recorded in the session so a dropped connection
// resumes instead of restarting a 30-minute upload.
upload.put('/api/intake/upload/part', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  await enforceUploadLimits(c.env, c.req.raw, sessionId);
  if (!session.upload) {
    throw new ValidationError('No upload in progress. Start one first.');
  }

  const partNumber = Number(c.req.query('partNumber'));
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) {
    throw new ValidationError('partNumber must be an integer between 1 and 10000.');
  }

  const bytes = await c.req.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new ValidationError('Part is empty.');
  }
  if (bytes.byteLength > MAX_PART_BYTES) {
    throw new ValidationError(
      `Part is too large: ${bytes.byteLength} bytes exceeds the ${MAX_PART_BYTES}-byte limit.`,
    );
  }
  // Charged before the write, so an over-budget part is never stored.
  const charged = chargeBytes(session, bytes.byteLength);

  const multipart = c.env.SESAP_BUCKET.resumeMultipartUpload(
    session.upload.key,
    session.upload.uploadId,
  );
  const uploaded = await multipart.uploadPart(partNumber, bytes);

  // Replace rather than append: a retried part must not be recorded twice.
  const parts = [
    ...session.upload.parts.filter((part) => part.partNumber !== partNumber),
    { partNumber: uploaded.partNumber, etag: uploaded.etag },
  ].sort((a, b) => a.partNumber - b.partNumber);

  await putSession(c.env, sessionId, { ...charged, upload: { ...session.upload, parts } });

  const response: ApiResponse<{ partNumber: number; received: number }> = {
    success: true,
    data: { partNumber: uploaded.partNumber, received: parts.length },
  };
  return c.json(response);
});

// PUT /api/intake/upload/audio — the browser-extracted mp3 that processing
// transcribes. Small enough for a single body, unlike the source media.
upload.put('/api/intake/upload/audio', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  await enforceUploadLimits(c.env, c.req.raw, sessionId);
  // The same profile-and-consent precondition the other routes carry. Without
  // it this route wrote contributor audio to R2 before consent was recorded.
  assertReadyToUpload(session);
  if (!session.interviewId) {
    throw new ValidationError('Start the media upload before sending audio.');
  }

  const contentType = assertAudioContentType(c.req.header('Content-Type') ?? 'audio/mpeg');
  const bytes = await c.req.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new ValidationError('Audio is empty.');
  }
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new ValidationError(
      `Audio is too large: ${bytes.byteLength} bytes exceeds the ${MAX_AUDIO_BYTES}-byte limit.`,
    );
  }
  const charged = chargeBytes(session, bytes.byteLength);

  // The key keeps the `.mp3` extension the wizard's extractor produces and
  // `upload/complete` looks for; the validated type rides as R2 metadata.
  const key = R2_PATHS.audioTemp(session.interviewId, 'mp3');
  await c.env.SESAP_BUCKET.put(key, bytes, { httpMetadata: { contentType } });
  await putSession(c.env, sessionId, charged);

  const response: ApiResponse<{ key: string; sizeBytes: number }> = {
    success: true,
    data: { key, sizeBytes: bytes.byteLength },
  };
  return c.json(response);
});

// POST /api/intake/upload/complete — assemble the parts, create the interview
// record and archive consent. Nothing is enqueued: a self-service interview
// waits for staff media moderation before any AI service is called.
upload.post('/api/intake/upload/complete', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  await enforceUploadLimits(c.env, c.req.raw, sessionId);
  assertReadyToUpload(session);
  await assertSubmissionQuota(c.env, session.email);

  if (!session.upload || !session.interviewId) {
    throw new ValidationError('No upload in progress.');
  }
  if (session.upload.parts.length === 0) {
    throw new ValidationError('No parts were uploaded.');
  }

  const kind = normalizeContentType(session.upload.contentType).startsWith('audio/')
    ? 'audio'
    : 'video';

  const multipart = c.env.SESAP_BUCKET.resumeMultipartUpload(
    session.upload.key,
    session.upload.uploadId,
  );
  const stored = await multipart.complete(session.upload.parts);

  const audio = await c.env.SESAP_BUCKET.head(R2_PATHS.audioTemp(session.interviewId, 'mp3'));
  if (!audio) {
    throw new ValidationError(
      'Audio track missing. Upload the extracted audio before completing.',
    );
  }

  const media: SubmitterMedia = {
    key: session.upload.key,
    contentType: session.upload.contentType,
    sizeBytes: stored.size,
    kind,
    uploadedAt: new Date().toISOString(),
  };

  const record: InterviewRecord = await createSelfServiceInterview(c.env, {
    id: session.interviewId,
    session,
    media,
    audioKey: audio.key,
    audioContentType: audio.httpMetadata?.contentType ?? 'audio/mpeg',
    audioSizeBytes: audio.size,
    ip: clientIp(c.req.raw),
    userAgent: c.req.header('User-Agent'),
  });

  // Counted against the address, not the session, so a fresh cookie does not
  // reset it. Recorded after the record exists: a failed submission must not
  // consume the contributor's quota.
  // The wizard is finished. Clear the upload and remember what was submitted,
  // so a refreshed session lands on the thank-you step rather than recording
  // again over this interview.
  await finishSession(c.env, sessionId, session, record);

  const response: ApiResponse<{ interviewId: string; email: string }> = {
    success: true,
    data: { interviewId: record.id, email: session.email },
  };
  return c.json(response, 201);
});

// POST /api/intake/upload/kaltura — create a moderated self-service record
// from a public Kaltura entry. The parser extracts identifiers and constructs a
// trusted CDN embed; raw contributor HTML is never rendered.
upload.post('/api/intake/upload/kaltura', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  await enforceUploadLimits(c.env, c.req.raw, sessionId);
  assertReadyToUpload(session);
  await assertSubmissionQuota(c.env, session.email);
  await assertInterviewIdUnused(c.env, session);

  const body = await c.req.json<{ source?: unknown }>();
  if (typeof body.source !== 'string' || !body.source.trim()) {
    throw new ValidationError('Kaltura link or embed is required.');
  }

  await discardPendingUpload(c.env, session);
  const id = generateInterviewId();
  const record = await createSelfServiceInterviewFromKaltura(c.env, {
    id,
    session,
    source: body.source.trim(),
    fallbackPartnerId: c.env.KALTURA_PARTNER_ID || undefined,
    fallbackUiconfId: c.env.KALTURA_UICONF_ID || undefined,
    ip: clientIp(c.req.raw),
    userAgent: c.req.header('User-Agent'),
  });

  await finishSession(c.env, sessionId, session, record);
  const response: ApiResponse<{ interviewId: string; email: string }> = {
    success: true,
    data: { interviewId: record.id, email: session.email },
  };
  return c.json(response, 201);
});
