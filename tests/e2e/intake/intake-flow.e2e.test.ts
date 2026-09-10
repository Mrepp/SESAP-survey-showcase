import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { IntakeSession, InterviewRecord } from '@sesap/types';

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket; SESAP_KV: KVNamespace };

const EMAIL = 'beaver@oregonstate.edu';
const BASE = 'http://intake';

/**
 * The verification code is never returned by the API — it only exists in the
 * email. This suite runs as `development` with no `EMAIL` binding, so the
 * mailer's development-only fallback logs the message, and the test reads the
 * code out of that log the way the recipient would read it out of the mail.
 * Only the code's hash is stored, inside the per-address Durable Object.
 */
let logged: string[] = [];

function readCodeFromLog(): string {
  for (const line of [...logged].reverse()) {
    const match = line.match(/Your verification code is (\d{6})\./);
    if (match) return match[1];
  }
  throw new Error('Verification code not found in the mailer log');
}

function cookieFrom(response: Response): string {
  const header = response.headers.get('Set-Cookie');
  if (!header) throw new Error('No session cookie was set');
  return header.split(';')[0];
}

async function clearAll(): Promise<void> {
  logged = [];
  vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
    logged.push(String(line));
  });
  for (const prefix of ['interview:', 'intake:']) {
    const listed = await e2eEnv.SESAP_KV.list({ prefix });
    for (const key of listed.keys) await e2eEnv.SESAP_KV.delete(key.name);
  }
}

afterEach(() => vi.restoreAllMocks());

async function json(
  path: string,
  body: unknown,
  cookie?: string,
  method: 'POST' | 'PUT' = 'POST',
): Promise<Response> {
  return SELF.fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('self-service intake: verify → profile → consent → upload → awaiting moderation', () => {
  beforeEach(clearAll);

  it('walks a contributor from an unverified address to a moderation-queued interview', async () => {
    const start = await json('/api/intake/verify/start', { email: EMAIL });
    expect(start.status).toBe(200);

    const code = readCodeFromLog();
    const confirmed = await json('/api/intake/verify/confirm', { email: EMAIL, code });
    expect(confirmed.status).toBe(200);
    const cookie = cookieFrom(confirmed);

    const profile = await json(
      '/api/intake/session/profile',
      { name: 'Casey Beaver', major: 'Computer Science', graduationYear: '2024' },
      cookie,
    );
    expect(profile.status).toBe(200);

    const consent = await json(
      '/api/intake/session/consent',
      { agreed: true, attribution: 'anonymous' },
      cookie,
    );
    expect(consent.status).toBe(200);

    const started = await json('/api/intake/upload/start', { contentType: 'video/webm' }, cookie);
    expect(started.status).toBe(200);
    const { data: upload } = await started.json<{ data: { interviewId: string; key: string } }>();

    const part = await SELF.fetch(`${BASE}/api/intake/upload/part?partNumber=1`, {
      method: 'PUT',
      headers: { Cookie: cookie },
      body: 'pretend-video-bytes',
    });
    expect(part.status).toBe(200);

    const audio = await SELF.fetch(`${BASE}/api/intake/upload/audio`, {
      method: 'PUT',
      headers: { Cookie: cookie, 'Content-Type': 'audio/mpeg' },
      body: 'pretend-mp3-bytes',
    });
    expect(audio.status).toBe(200);

    const completed = await json('/api/intake/upload/complete', { kind: 'video' }, cookie);
    expect(completed.status).toBe(201);

    const stored = await e2eEnv.SESAP_KV.get(KV_KEYS.interview(upload.interviewId));
    const record = JSON.parse(stored!) as InterviewRecord;

    expect(record.origin).toBe('self_service');
    // Pre-analysis moderation: the submission waits for a staff member to watch
    // the media, and nothing is queued for AI until they approve it. This is
    // the control protecting the pipeline from unvetted contributor media.
    expect(record.approval.status).toBe('pending_media_review');
    expect(record.processing.status).toBe('pending');
    expect(record.submitter?.email).toBe(EMAIL);

    // Anonymous attribution must not carry a display name into the archive.
    const consentObject = await e2eEnv.SESAP_BUCKET.get(R2_PATHS.consent(upload.interviewId));
    expect(await consentObject!.json()).toMatchObject({ attribution: 'anonymous' });
    expect((await (await e2eEnv.SESAP_BUCKET.get(R2_PATHS.consent(upload.interviewId)))!.text()))
      .not.toContain('Casey Beaver');

    const media = await e2eEnv.SESAP_BUCKET.get(upload.key);
    expect(await media!.text()).toBe('pretend-video-bytes');

    // One interview per session: the wizard lands on "done" on reload, and a
    // second recording cannot start over this record.
    const resumed = await SELF.fetch(`${BASE}/api/intake/session`, { headers: { Cookie: cookie } });
    const { data } = await resumed.json<{ data: { session: IntakeSession } }>();
    expect(data.session.submittedInterviewId).toBe(upload.interviewId);
    expect(data.session.interviewId).toBeUndefined();

    const again = await json('/api/intake/upload/start', { contentType: 'video/webm' }, cookie);
    expect(again.status).toBe(400);
  });

  it('caps code guesses per address', async () => {
    await json('/api/intake/verify/start', { email: EMAIL });
    const code = readCodeFromLog();
    const wrong = code === '000000' ? '111111' : '000000';

    // Five parallel wrong guesses: the Durable Object serializes them, so the
    // cap holds and the real code is dead afterwards.
    const guesses = await Promise.all(
      Array.from({ length: 5 }, () => json('/api/intake/verify/confirm', { email: EMAIL, code: wrong })),
    );
    for (const guess of guesses) expect(guess.status).toBe(400);

    const real = await json('/api/intake/verify/confirm', { email: EMAIL, code });
    expect(real.status).toBe(400);
  });

  it('accepts any valid address and refuses a malformed one', async () => {
    // Enrollment is open on purpose: there is no domain allow-list, and inbox
    // control is what an address proves. The bot, rate and quota controls are
    // what make that safe to expose, not the shape of the domain.
    const external = await json('/api/intake/verify/start', { email: 'someone@gmail.com' });
    expect(external.status).toBe(200);

    const malformed = await json('/api/intake/verify/start', { email: 'not an address' });
    expect(malformed.status).toBe(400);
  });

  it('ends a session on logout', async () => {
    await json('/api/intake/verify/start', { email: EMAIL });
    const code = readCodeFromLog();
    const confirmed = await json('/api/intake/verify/confirm', { email: EMAIL, code });
    const cookie = cookieFrom(confirmed);

    const before = await SELF.fetch(`${BASE}/api/intake/session`, { headers: { Cookie: cookie } });
    expect((await before.json<{ data: { session: unknown } }>()).data.session).not.toBeNull();

    const loggedOut = await SELF.fetch(`${BASE}/api/intake/session/logout`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    expect(loggedOut.status).toBe(200);

    // The server-side session is gone, so the cookie is inert even if the
    // browser kept it — a shared machine needs more than an expiry header.
    const after = await SELF.fetch(`${BASE}/api/intake/session`, { headers: { Cookie: cookie } });
    expect((await after.json<{ data: { session: unknown } }>()).data.session).toBeNull();
  });

  it('serves the Turnstile site key at the public config endpoint', async () => {
    // The wizard reads this to decide whether to render the widget. It exists
    // because the UI is one static export serving every environment; a
    // build-time NEXT_PUBLIC_ value could not do that.
    const response = await SELF.fetch(`${BASE}/api/intake/config`);
    expect(response.status).toBe(200);
    const { data } = await response.json<{ data: { turnstileSiteKey: string } }>();
    expect(data).toHaveProperty('turnstileSiteKey');
  });

  it('refuses to upload before consent is given', async () => {
    await json('/api/intake/verify/start', { email: EMAIL });
    const code = readCodeFromLog();
    const confirmed = await json('/api/intake/verify/confirm', { email: EMAIL, code });
    const cookie = cookieFrom(confirmed);

    const started = await json('/api/intake/upload/start', { contentType: 'video/webm' }, cookie);
    expect(started.status).toBe(400);
  });
});

describe('self-review: token minted → draft edited → submitted → visible to admin', () => {
  beforeEach(clearAll);

  it('moves the interview into the admin queue and burns the token', async () => {
    // Stand in for a completed processing run: a record awaiting its submitter,
    // with a transcript and analysis already in R2.
    const id = 'int_e2ereview01';
    const now = '2026-01-01T00:00:00.000Z';
    const record: InterviewRecord = {
      id,
      title: 'Alumni interview',
      demographics: {},
      metadata: { interviewDate: '2026-01-01' },
      source: 'audio',
      origin: 'self_service',
      submitter: { email: EMAIL, name: 'Casey Beaver', verifiedAt: now },
      submitterReview: { revisionRound: 0 },
      processing: { status: 'completed', completedAt: now },
      approval: { status: 'pending_submitter_review' },
      artifacts: { transcript: true, analysis: true, embeddings: true },
      createdAt: now,
      updatedAt: now,
    };
    await e2eEnv.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
    await e2eEnv.SESAP_BUCKET.put(R2_PATHS.transcript(id), 'I studied computer science.');

    // Driving the queue consumer is what mints the token and would send the
    // email; only the hash is persisted, so the plaintext token is captured
    // here the way the recipient gets it — from the minting call itself.
    const { handleNotification } = await import('../../../workers/intake/src/services/notifications');
    await handleNotification(env as never, { kind: 'processed', interviewId: id, queuedAt: now });

    const afterMint = JSON.parse((await e2eEnv.SESAP_KV.get(KV_KEYS.interview(id)))!) as InterviewRecord;
    expect(afterMint.submitterReview?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect((await e2eEnv.SESAP_KV.list({ prefix: 'intake:review:' })).keys).toHaveLength(1);

    const { mintReviewToken } = await import('../../../workers/intake/src/services/review-token');
    const { token } = await mintReviewToken(env as never, afterMint);
    await e2eEnv.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(afterMint));

    const loaded = await SELF.fetch(`${BASE}/api/intake/review/${token}`);
    expect(loaded.status).toBe(200);
    const { data: view } = await loaded.json<{ data: { transcript: string } }>();
    expect(view.transcript).toContain('computer science');

    const saved = await json(
      `/api/intake/review/${token}/draft`,
      { title: 'My Oregon State story' },
      undefined,
      'PUT',
    );
    expect(saved.status).toBe(200);

    const submitted = await SELF.fetch(`${BASE}/api/intake/review/${token}/submit`, {
      method: 'POST',
    });
    expect(submitted.status).toBe(200);

    const final = JSON.parse((await e2eEnv.SESAP_KV.get(KV_KEYS.interview(id)))!) as InterviewRecord;
    expect(final.title).toBe('My Oregon State story');
    expect(final.approval.status).toBe('pending_review');
    expect(final.submitterReview?.submittedAt).toBeTruthy();

    // The link is single-use.
    const replay = await SELF.fetch(`${BASE}/api/intake/review/${token}`);
    expect(replay.status).toBe(401);
  });
});
