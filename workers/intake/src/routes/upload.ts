import { Hono } from 'hono';
import { generateInterviewId, ValidationError } from '@sesap/core';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { ApiResponse, IntakeSession, InterviewRecord, SubmitterMedia } from '@sesap/types';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { clientIp } from '../services/rate-limit';
import { loadSessionFromRequest, putSession, requireSession } from '../services/session';
import { createSelfServiceInterview } from '../services/interview';

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
};

function mediaExtension(contentType: string): string {
  const base = contentType.split(';')[0].trim().toLowerCase();
  const ext = MEDIA_EXTENSIONS[base];
  if (!ext) {
    throw new ValidationError(`Unsupported media type: ${base}`);
  }
  return ext;
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

// POST /api/intake/upload/start — allocate an interview id and open an R2
// multipart upload. Student video routinely exceeds the Workers request-body
// cap, so the browser sends parts rather than one body.
upload.post('/api/intake/upload/start', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  assertReadyToUpload(session);

  const body = await c.req.json<{ contentType?: unknown }>();
  if (typeof body.contentType !== 'string') {
    throw new ValidationError('contentType is required.');
  }

  const contentType = body.contentType;
  // Resume an in-flight upload's id; never one that already has a record.
  // A session that reaches here with a completed interview would otherwise
  // overwrite it — media, consent, processing state and all.
  let id = session.interviewId ?? generateInterviewId();
  if (session.interviewId && (await c.env.SESAP_KV.get(KV_KEYS.interview(session.interviewId)))) {
    throw new ValidationError(
      'This session has already submitted an interview. Watch your inbox for the review link.',
    );
  }
  if (session.upload && session.upload.contentType !== contentType) {
    // A new recording with a different type gets a fresh key; the abandoned
    // multipart upload is left for R2's own expiry.
    id = generateInterviewId();
  }
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

  await putSession(c.env, sessionId, { ...session, upload: { ...session.upload, parts } });

  const response: ApiResponse<{ partNumber: number; received: number }> = {
    success: true,
    data: { partNumber: uploaded.partNumber, received: parts.length },
  };
  return c.json(response);
});

// PUT /api/intake/upload/audio — the browser-extracted mp3 that processing
// transcribes. Small enough for a single body, unlike the source media.
upload.put('/api/intake/upload/audio', async (c) => {
  const { session } = requireSession(await loadSessionFromRequest(c.env, c.req.header('Cookie')));
  if (!session.interviewId) {
    throw new ValidationError('Start the media upload before sending audio.');
  }

  const contentType = c.req.header('Content-Type') ?? 'audio/mpeg';
  const bytes = await c.req.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new ValidationError('Audio is empty.');
  }

  const key = R2_PATHS.audioTemp(session.interviewId, 'mp3');
  await c.env.SESAP_BUCKET.put(key, bytes, { httpMetadata: { contentType } });

  const response: ApiResponse<{ key: string; sizeBytes: number }> = {
    success: true,
    data: { key, sizeBytes: bytes.byteLength },
  };
  return c.json(response);
});

// POST /api/intake/upload/complete — assemble the parts, create the interview
// record, archive consent and enqueue processing.
upload.post('/api/intake/upload/complete', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  assertReadyToUpload(session);

  if (!session.upload || !session.interviewId) {
    throw new ValidationError('No upload in progress.');
  }
  if (session.upload.parts.length === 0) {
    throw new ValidationError('No parts were uploaded.');
  }

  const body = await c.req.json<{ kind?: unknown }>().catch(() => ({ kind: undefined }));
  const kind = body.kind === 'audio' ? 'audio' : 'video';

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

  // The wizard is finished. Clear the upload and remember what was submitted,
  // so a refreshed session lands on the thank-you step rather than recording
  // again over this interview.
  await putSession(c.env, sessionId, {
    ...session,
    upload: undefined,
    interviewId: undefined,
    submittedInterviewId: record.id,
  });

  const response: ApiResponse<{ interviewId: string; email: string }> = {
    success: true,
    data: { interviewId: record.id, email: session.email },
  };
  return c.json(response, 201);
});
