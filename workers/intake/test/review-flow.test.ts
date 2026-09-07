import { describe, expect, it } from 'vitest';
import { createMockEnv, createMockQueue, createMockR2Bucket } from '@sesap/test-utils';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { InterviewRecord, ProcessingQueueMessage } from '@sesap/types';
import type { Env } from '../src/bindings';
import { upload } from '../src/routes/upload';
import { review } from '../src/routes/review';
import { createSession, putSession, SESSION_COOKIE } from '../src/services/session';
import { mintReviewToken, resolveReviewToken } from '../src/services/review-token';
import { getInterview } from '../src/services/interview';

const NOW = '2026-01-01T00:00:00.000Z';

function makeEnv(): Env {
  return createMockEnv<Env>({
    SESAP_BUCKET: createMockR2Bucket(),
    PROCESSING_QUEUE: createMockQueue<ProcessingQueueMessage>(),
    INTAKE_SESSION_SECRET: 'test-secret',
    INTAKE_URL: 'https://share.example.edu',
    ALLOWED_EMAIL_DOMAIN: 'oregonstate.edu',
    EMAIL_FROM: 'sesap@example.edu',
    MEDIA_RETENTION_DAYS: '365',
  });
}

/** A session that has already cleared verify, profile and consent. */
async function seedReadySession(env: Env): Promise<string> {
  const { sessionId, cookie } = await createSession(env, {
    email: 'beaver@oregonstate.edu',
    verifiedAt: NOW,
  });
  const session = JSON.parse((await env.SESAP_KV.get(KV_KEYS.intakeSession(sessionId)))!);

  await putSession(env, sessionId, {
    ...session,
    name: 'Casey Beaver',
    major: 'Computer Science',
    graduationYear: '2024',
    consent: { consentVersion: 'draft', attribution: 'named', agreedAt: NOW },
  });

  return cookie.split(';')[0].slice(SESSION_COOKIE.length + 1);
}

function withCookie(cookie: string, init: RequestInit = {}): RequestInit {
  return { ...init, headers: { ...(init.headers ?? {}), Cookie: `${SESSION_COOKIE}=${cookie}` } };
}

describe('multipart upload', () => {
  it('assembles parts in ascending order regardless of upload order', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);

    const started = await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    expect(started.status).toBe(200);
    const { data } = await started.json<{ data: { interviewId: string; key: string } }>();

    // Deliberately out of order: R2 assembles by part number, not arrival.
    for (const [partNumber, text] of [
      [2, 'second'],
      [1, 'first'],
      [3, 'third'],
    ] as const) {
      const res = await upload.request(
        `/api/intake/upload/part?partNumber=${partNumber}`,
        withCookie(cookie, { method: 'PUT', body: text }),
        env,
      );
      expect(res.status).toBe(200);
    }

    await upload.request(
      '/api/intake/upload/audio',
      withCookie(cookie, { method: 'PUT', body: 'fake-mp3-bytes' }),
      env,
    );

    const completed = await upload.request(
      '/api/intake/upload/complete',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'video' }),
      }),
      env,
    );
    expect(completed.status).toBe(201);

    const stored = await env.SESAP_BUCKET.get(data.key);
    expect(await stored!.text()).toBe('firstsecondthird');
  });

  it('refuses to complete without the extracted audio track', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);

    await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    await upload.request(
      '/api/intake/upload/part?partNumber=1',
      withCookie(cookie, { method: 'PUT', body: 'only-part' }),
      env,
    );

    // Driven through the sub-router directly, a thrown ValidationError surfaces
    // as a 500; the app-level error handler is what maps it to 400 in prod.
    const completed = await upload.request(
      '/api/intake/upload/complete',
      withCookie(cookie, { method: 'POST', body: '{}' }),
      env,
    );
    expect(completed.status).not.toBe(201);
  });

  it('creates the record awaiting the submitter, not an admin', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);

    await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    await upload.request(
      '/api/intake/upload/part?partNumber=1',
      withCookie(cookie, { method: 'PUT', body: 'media' }),
      env,
    );
    await upload.request(
      '/api/intake/upload/audio',
      withCookie(cookie, { method: 'PUT', body: 'audio' }),
      env,
    );
    const completed = await upload.request(
      '/api/intake/upload/complete',
      withCookie(cookie, { method: 'POST', body: '{}' }),
      env,
    );

    const { data } = await completed.json<{ data: { interviewId: string } }>();
    const record = await getInterview(env, data.interviewId);

    expect(record.origin).toBe('self_service');
    expect(record.approval.status).toBe('pending_submitter_review');
    expect(record.processing.status).toBe('queued');
    expect(record.video).toEqual({ provider: 'r2', embedUrl: `/media/${data.interviewId}` });

    // The session remembers what it submitted and forgets the upload.
    const sessionRaw = await env.SESAP_KV.get(
      (await env.SESAP_KV.list({ prefix: KV_KEYS.intakeSession('') })).keys[0].name,
    );
    const session = JSON.parse(sessionRaw!) as Record<string, unknown>;
    expect(session.submittedInterviewId).toBe(data.interviewId);
    expect(session).not.toHaveProperty('upload');
    expect(session).not.toHaveProperty('interviewId');

    // Consent is archived before the record exists — there must never be a
    // submitted interview whose consent was not written down.
    const consent = await env.SESAP_BUCKET.get(R2_PATHS.consent(data.interviewId));
    expect(await consent!.json()).toMatchObject({
      attribution: 'named',
      displayName: 'Casey Beaver',
    });

    const queue = env.PROCESSING_QUEUE as unknown as { sent: ProcessingQueueMessage[] };
    expect(queue.sent).toHaveLength(1);
    expect(queue.sent[0].metadata?.reason).toBe('new_upload');
  });
});

describe('one interview per session', () => {
  async function submitOnce(env: Env, cookie: string): Promise<string> {
    await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    await upload.request('/api/intake/upload/part?partNumber=1', withCookie(cookie, { method: 'PUT', body: 'media' }), env);
    await upload.request('/api/intake/upload/audio', withCookie(cookie, { method: 'PUT', body: 'audio' }), env);
    const completed = await upload.request(
      '/api/intake/upload/complete',
      withCookie(cookie, { method: 'POST', body: '{}' }),
      env,
    );
    expect(completed.status).toBe(201);
    return (await completed.json<{ data: { interviewId: string } }>()).data.interviewId;
  }

  it('refuses a second upload from a session that already submitted', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    const first = await submitOnce(env, cookie);
    const before = await getInterview(env, first);

    // A reloaded wizard that tried to record again must not touch the record
    // that already exists — not its media, its consent, nor its processing state.
    const again = await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    expect(again.status).not.toBe(200);

    expect(await getInterview(env, first)).toEqual(before);
    const queue = env.PROCESSING_QUEUE as unknown as { sent: ProcessingQueueMessage[] };
    expect(queue.sent).toHaveLength(1);
  });

  it('refuses to start when the session\'s interview id already has a record', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    const sessionKey = (await env.SESAP_KV.list({ prefix: KV_KEYS.intakeSession('') })).keys[0].name;
    const session = JSON.parse((await env.SESAP_KV.get(sessionKey))!);

    // A session shaped like the old bug: interviewId still set, record present.
    const existing: InterviewRecord = {
      id: 'int_existing0001',
      title: 'Existing',
      demographics: {},
      metadata: { interviewDate: '2026-01-01' },
      source: 'audio',
      origin: 'self_service',
      processing: { status: 'completed' },
      approval: { status: 'approved' },
      artifacts: { transcript: true, analysis: true, embeddings: true },
      createdAt: NOW,
      updatedAt: NOW,
    };
    await env.SESAP_KV.put(KV_KEYS.interview(existing.id), JSON.stringify(existing));
    await env.SESAP_KV.put(sessionKey, JSON.stringify({ ...session, interviewId: existing.id }));

    const started = await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    expect(started.status).not.toBe(200);
    expect((await getInterview(env, existing.id)).approval.status).toBe('approved');
  });
});

describe('review tokens', () => {
  function seedRecord(env: Env, overrides: Partial<InterviewRecord> = {}): InterviewRecord {
    const record: InterviewRecord = {
      id: 'int_review0001',
      title: 'Interview',
      demographics: {},
      metadata: { interviewDate: '2026-01-01' },
      source: 'audio',
      origin: 'self_service',
      submitter: { email: 'beaver@oregonstate.edu', name: 'Casey', verifiedAt: NOW },
      submitterReview: { revisionRound: 0 },
      processing: { status: 'completed' },
      approval: { status: 'pending_submitter_review' },
      artifacts: { transcript: true, analysis: true, embeddings: true },
      createdAt: NOW,
      updatedAt: NOW,
      ...overrides,
    };
    return record;
  }

  it('stores only the hash and resolves the token once', async () => {
    const env = makeEnv();
    const record = seedRecord(env);

    const { token, url } = await mintReviewToken(env, record);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    expect(url).toBe(`https://share.example.edu/review/${token}`);
    expect(record.submitterReview!.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(record.submitterReview!.tokenHash).not.toBe(token);

    const resolved = await resolveReviewToken(env, token, (id) => getInterview(env, id));
    expect(resolved.id).toBe(record.id);
  });

  it('rejects an unknown token', async () => {
    const env = makeEnv();
    await expect(
      resolveReviewToken(env, 'nope', (id) => getInterview(env, id)),
    ).rejects.toThrow(/expired or already been used/);
  });

  it('rejects a token superseded by a re-mint', async () => {
    const env = makeEnv();
    const record = seedRecord(env);

    const first = await mintReviewToken(env, record);
    const second = await mintReviewToken(env, record);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    // The old KV entry has not expired, but the record now points elsewhere.
    await expect(
      resolveReviewToken(env, first.token, (id) => getInterview(env, id)),
    ).rejects.toThrow(/expired or already been used/);
    await expect(
      resolveReviewToken(env, second.token, (id) => getInterview(env, id)),
    ).resolves.toMatchObject({ id: record.id });
  });

  it('moves the record to pending_review on submit and burns the token', async () => {
    const env = makeEnv();
    const record = seedRecord(env);
    const { token } = await mintReviewToken(env, record);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const submitted = await review.request(
      `/api/intake/review/${token}/submit`,
      { method: 'POST' },
      env,
    );
    expect(submitted.status).toBe(200);

    const stored = await getInterview(env, record.id);
    expect(stored.approval.status).toBe('pending_review');
    expect(stored.submitterReview?.submittedAt).toBeTruthy();

    await expect(
      resolveReviewToken(env, token, (id) => getInterview(env, id)),
    ).rejects.toThrow(/expired or already been used/);
  });

  it('refuses to submit an interview that is no longer awaiting the submitter', async () => {
    // The link is still technically live (an admin approved without the
    // submitter ever submitting, before approve started burning tokens), but
    // the record has moved on: it must not be handed back to the admin queue.
    const env = makeEnv();
    const record = seedRecord(env, { approval: { status: 'approved' } });
    const { token } = await mintReviewToken(env, record);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const submitted = await review.request(`/api/intake/review/${token}/submit`, { method: 'POST' }, env);
    expect(submitted.status).not.toBe(200);
    expect((await getInterview(env, record.id)).approval.status).toBe('approved');
  });

  it('refuses to submit an interview that is still processing', async () => {
    const env = makeEnv();
    const record = seedRecord(env, { processing: { status: 'processing' } });
    const { token } = await mintReviewToken(env, record);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const submitted = await review.request(
      `/api/intake/review/${token}/submit`,
      { method: 'POST' },
      env,
    );
    expect(submitted.status).not.toBe(200);
    expect((await getInterview(env, record.id)).approval.status).toBe('pending_submitter_review');
  });
});
