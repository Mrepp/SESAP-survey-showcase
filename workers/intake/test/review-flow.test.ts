import { describe, expect, it } from 'vitest';
import { createMockEnv, createMockR2Bucket } from '@sesap/test-utils';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { InterviewRecord } from '@sesap/types';
import type { Env } from '../src/bindings';
import {
  MAX_PART_BYTES,
  MAX_SESSION_UPLOAD_BYTES,
  MAX_SUBMISSIONS_PER_EMAIL,
  upload,
} from '../src/routes/upload';
import { review } from '../src/routes/review';
import {
  createSession,
  emailKeyHash,
  putSession,
  SESSION_COOKIE,
} from '../src/services/session';
import { mintReviewToken, resolveReviewToken } from '../src/services/review-token';
import { getInterview, putInterview } from '../src/services/interview';

const NOW = '2026-01-01T00:00:00.000Z';
const EMAIL = 'beaver@oregonstate.edu';

function makeEnv(): Env {
  return createMockEnv<Env>({
    SESAP_BUCKET: createMockR2Bucket(),
    // Explicit: the upload and review routes now enforce rate limits, and a
    // missing binding is skipped in development only — anywhere else it
    // refuses the request with a 503, which is the intended production
    // behavior but would drown out what these tests are actually checking.
    ENVIRONMENT: 'development',
    INTAKE_SESSION_SECRET: 'test-secret',
    INTAKE_URL: 'https://share.example.edu',
    EMAIL_FROM: 'sesap@example.edu',
  });
}

/** A session that has already cleared verify, profile and consent. */
async function seedReadySession(env: Env, email = EMAIL): Promise<string> {
  const { sessionId, cookie } = await createSession(env, {
    email,
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

  it('creates the record awaiting staff media review, and enqueues nothing', async () => {
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
    // The pre-analysis moderation gate: a submission waits for a staff member
    // to watch the media, and no AI service is called until they approve it.
    expect(record.approval.status).toBe('pending_media_review');
    expect(record.processing.status).toBe('pending');
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

    // Intake holds no queue producer binding at all any more — admin enqueues,
    // after moderation. `Env` no longer declares PROCESSING_QUEUE, so a
    // reintroduced `send` here would not compile.
    expect('PROCESSING_QUEUE' in env).toBe(false);
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

/**
 * Regression tests for the volumetric controls.
 *
 * Open enrollment is intentional, which makes this an internet-facing endpoint
 * rather than an institution-facing one. Every bound below was absent: part
 * size, cumulative bytes, the audio route's content type and consent check, and
 * the per-address submission quota. They are the reason the endpoint can be
 * exposed at all, so each gets a test that fails loudly if it is removed.
 */
describe('upload bounds', () => {
  async function startUpload(env: Env, cookie: string): Promise<void> {
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
  }

  it('rejects a part larger than the cap without writing it', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    await startUpload(env, cookie);

    const oversized = new Uint8Array(MAX_PART_BYTES + 1);
    const res = await upload.request(
      '/api/intake/upload/part?partNumber=1',
      withCookie(cookie, { method: 'PUT', body: oversized }),
      env,
    );

    expect(res.status).not.toBe(200);
    // Charged before the write, so nothing was stored and the session's byte
    // total did not move.
    const sessionKey = (await env.SESAP_KV.list({ prefix: KV_KEYS.intakeSession('') })).keys[0].name;
    const session = JSON.parse((await env.SESAP_KV.get(sessionKey))!) as { uploadedBytes?: number };
    expect(session.uploadedBytes ?? 0).toBe(0);
  });

  it('refuses a session that has exceeded its cumulative byte budget', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    await startUpload(env, cookie);

    // Seed the session at its budget rather than actually uploading gigabytes.
    const sessionKey = (await env.SESAP_KV.list({ prefix: KV_KEYS.intakeSession('') })).keys[0].name;
    const session = JSON.parse((await env.SESAP_KV.get(sessionKey))!);
    await env.SESAP_KV.put(
      sessionKey,
      JSON.stringify({ ...session, uploadedBytes: MAX_SESSION_UPLOAD_BYTES }),
    );

    const res = await upload.request(
      '/api/intake/upload/part?partNumber=1',
      withCookie(cookie, { method: 'PUT', body: 'one more byte-ish' }),
      env,
    );
    expect(res.status).not.toBe(200);
  });

  it('rejects a non-audio content type on the audio route', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    await startUpload(env, cookie);

    for (const contentType of ['text/html', 'application/javascript', 'video/webm']) {
      const res = await upload.request(
        '/api/intake/upload/audio',
        withCookie(cookie, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: 'not-audio',
        }),
        env,
      );
      expect(res.status).not.toBe(200);
    }

    // The allow-listed type still works.
    const ok = await upload.request(
      '/api/intake/upload/audio',
      withCookie(cookie, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/mpeg' },
        body: 'audio',
      }),
      env,
    );
    expect(ok.status).toBe(200);
  });

  it('refuses audio from a session that has not consented', async () => {
    const env = makeEnv();
    const { sessionId, cookie: rawCookie } = await createSession(env, {
      email: EMAIL,
      verifiedAt: NOW,
    });
    const stored = JSON.parse((await env.SESAP_KV.get(KV_KEYS.intakeSession(sessionId)))!);
    // Named and profiled, but no consent recorded — and an interview id set, so
    // the only thing standing between this and a write to R2 is the consent
    // check the route did not have.
    await putSession(env, sessionId, {
      ...stored,
      name: 'Casey Beaver',
      major: 'Computer Science',
      graduationYear: '2024',
      interviewId: 'int_noconsent001',
    });
    const cookie = rawCookie.split(';')[0].slice(SESSION_COOKIE.length + 1);

    const res = await upload.request(
      '/api/intake/upload/audio',
      withCookie(cookie, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/mpeg' },
        body: 'audio',
      }),
      env,
    );

    expect(res.status).not.toBe(200);
    expect(await env.SESAP_BUCKET.get(R2_PATHS.audioTemp('int_noconsent001', 'mp3'))).toBeNull();
  });

  it('aborts the superseded multipart when the content type changes', async () => {
    const env = makeEnv();
    const cookie = await seedReadySession(env);
    await startUpload(env, cookie);

    const sessionKey = (await env.SESAP_KV.list({ prefix: KV_KEYS.intakeSession('') })).keys[0].name;
    const first = JSON.parse((await env.SESAP_KV.get(sessionKey))!) as {
      upload: { key: string };
    };

    const again = await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'audio/mpeg' }),
      }),
      env,
    );
    expect(again.status).toBe(200);

    // A fresh key, and the abandoned one left nothing behind: looping this used
    // to strand a partial multipart per iteration.
    const second = JSON.parse((await env.SESAP_KV.get(sessionKey))!) as {
      upload: { key: string };
    };
    expect(second.upload.key).not.toBe(first.upload.key);
    expect(await env.SESAP_BUCKET.get(first.upload.key)).toBeNull();
  });
});

describe('per-address submission quota', () => {
  it('refuses a new upload once the address is at its quota', async () => {
    const env = makeEnv();

    // A fresh session for the same address is three code requests away, so the
    // quota has to key on the verified address rather than on the session.
    await env.SESAP_KV.put(
      KV_KEYS.intakeSubmissionCount(await emailKeyHash(EMAIL)),
      String(MAX_SUBMISSIONS_PER_EMAIL),
    );

    const cookie = await seedReadySession(env);
    const res = await upload.request(
      '/api/intake/upload/start',
      withCookie(cookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );

    expect(res.status).not.toBe(200);

    // A different address is unaffected: the quota is per identity, not global.
    const otherCookie = await seedReadySession(env, 'other@example.edu');
    const allowed = await upload.request(
      '/api/intake/upload/start',
      withCookie(otherCookie, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'video/webm' }),
      }),
      env,
    );
    expect(allowed.status).toBe(200);
  });

  it('counts a completed submission against the address', async () => {
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
      withCookie(cookie, { method: 'PUT', headers: { 'Content-Type': 'audio/mpeg' }, body: 'a' }),
      env,
    );
    const completed = await upload.request(
      '/api/intake/upload/complete',
      withCookie(cookie, { method: 'POST', body: '{}' }),
      env,
    );
    expect(completed.status).toBe(201);

    expect(
      await env.SESAP_KV.get(KV_KEYS.intakeSubmissionCount(await emailKeyHash(EMAIL))),
    ).toBe('1');
  });

  it('retires a prior session when the same address verifies again', async () => {
    const env = makeEnv();
    const first = await createSession(env, { email: EMAIL, verifiedAt: NOW });
    const second = await createSession(env, { email: EMAIL, verifiedAt: NOW });

    expect(await env.SESAP_KV.get(KV_KEYS.intakeSession(first.sessionId))).toBeNull();
    expect(await env.SESAP_KV.get(KV_KEYS.intakeSession(second.sessionId))).not.toBeNull();
  });
});

describe('review draft window', () => {
  function seedDraftRecord(overrides: Partial<InterviewRecord> = {}): InterviewRecord {
    return {
      id: 'int_draft000001',
      title: 'Interview',
      demographics: {},
      metadata: { interviewDate: '2026-01-01' },
      source: 'audio',
      origin: 'self_service',
      submitter: { email: EMAIL, name: 'Casey', verifiedAt: NOW },
      submitterReview: { revisionRound: 0 },
      processing: { status: 'completed' },
      approval: { status: 'pending_submitter_review' },
      artifacts: { transcript: true, analysis: true, embeddings: true },
      createdAt: NOW,
      updatedAt: NOW,
      ...overrides,
    };
  }

  const draftBody = JSON.stringify({ title: 'Edited by the submitter' });

  function putDraft(env: Env, token: string) {
    return review.request(
      `/api/intake/review/${token}/draft`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: draftBody },
      env,
    );
  }

  it('refuses a draft write once the record is no longer awaiting the submitter', async () => {
    // An admin reprocess sets `pending_review` without clearing the token, so
    // the link still resolves. The status guard — which `submit` always had and
    // this route did not — is what stops the token holder from carrying on
    // overwriting analysis/<id>.json while it sits in the admin queue.
    const env = makeEnv();
    const record = seedDraftRecord({ approval: { status: 'pending_review' } });
    const { token } = await mintReviewToken(env, record);
    await putInterview(env, record);

    const res = await putDraft(env, token);

    expect(res.status).not.toBe(200);
    expect((await getInterview(env, record.id)).title).toBe('Interview');
  });

  it('accepts a draft write inside the window', async () => {
    const env = makeEnv();
    const record = seedDraftRecord();
    const { token } = await mintReviewToken(env, record);
    await putInterview(env, record);

    expect((await putDraft(env, token)).status).toBe(200);
    expect((await getInterview(env, record.id)).title).toBe('Edited by the submitter');
  });

  it('does not revert a concurrent approval', async () => {
    // The lost-update race: a submitter reads at T0, an admin approves at T1,
    // the submitter writes at T2. `putInterview` writes the whole record with
    // no compare-and-set, so applying the draft to the copy read at T0 would
    // restore it — status back to pending_submitter_review, `adminConfirmed`
    // wiped, and the burned token reinstated, with the build already marked
    // dirty. Re-reading and re-checking the guard is what makes T2 lose.
    const env = makeEnv();
    const record = seedDraftRecord();
    const { token } = await mintReviewToken(env, record);
    await putInterview(env, record);

    // T1: the admin approves. The token is deliberately left in place here, so
    // that what is under test is the status guard on the re-read record rather
    // than token resolution — the two are independent, and only one of them
    // held before. (`approveInterview` does clear the token; the case where it
    // has been cleared is covered below.)
    const approved = await getInterview(env, record.id);
    approved.approval = { status: 'approved', adminConfirmed: true, reviewedBy: 'staff@example.edu' };
    await putInterview(env, approved);

    // T2: the submitter's editor saves against the record it read at T0.
    const res = await putDraft(env, token);
    expect(res.status).not.toBe(200);

    const after = await getInterview(env, record.id);
    expect(after.approval.status).toBe('approved');
    expect(after.approval.adminConfirmed).toBe(true);
    expect(after.title).toBe('Interview');
  });

  it('refuses a draft write after approval burned the token', async () => {
    const env = makeEnv();
    const record = seedDraftRecord();
    const { token } = await mintReviewToken(env, record);
    await putInterview(env, record);

    const approved = await getInterview(env, record.id);
    approved.approval = { status: 'approved', adminConfirmed: true };
    approved.submitterReview = { ...approved.submitterReview!, tokenHash: undefined };
    await putInterview(env, approved);

    expect((await putDraft(env, token)).status).not.toBe(200);
    const after = await getInterview(env, record.id);
    expect(after.approval.status).toBe('approved');
    expect(after.submitterReview?.tokenHash).toBeUndefined();
    expect(after.title).toBe('Interview');
  });
});
