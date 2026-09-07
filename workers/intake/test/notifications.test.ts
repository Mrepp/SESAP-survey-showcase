import { describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '@sesap/test-utils';
import { KV_KEYS } from '@sesap/types';
import type { InterviewRecord } from '@sesap/types';
import type { Env } from '../src/bindings';
import { handleNotification } from '../src/services/notifications';

const NOW = '2026-01-01T00:00:00.000Z';

function makeEnv(): Env {
  return createMockEnv<Env>({
    ENVIRONMENT: 'development',
    INTAKE_URL: 'https://share.example.edu',
    SHOWCASE_URL: 'https://showcase.example.edu',
    EMAIL_FROM: 'sesap@example.edu',
  });
}

function record(overrides: Partial<InterviewRecord> = {}): InterviewRecord {
  return {
    id: 'int_notify000001',
    title: 'Alumni interview',
    demographics: {},
    metadata: { interviewDate: '2026-01-01' },
    source: 'audio',
    origin: 'self_service',
    submitter: { email: 'beaver@oregonstate.edu', name: 'Casey', verifiedAt: NOW },
    submitterReview: { revisionRound: 0 },
    processing: { status: 'completed', completedAt: NOW },
    approval: { status: 'pending_submitter_review' },
    artifacts: { transcript: true, analysis: true, embeddings: false },
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

async function stored(env: Env, id: string): Promise<InterviewRecord> {
  return JSON.parse((await env.SESAP_KV.get(KV_KEYS.interview(id)))!) as InterviewRecord;
}

describe('handleNotification', () => {
  it('mints a review link when processing finishes for an interview awaiting its submitter', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const env = makeEnv();
    const rec = record();
    await env.SESAP_KV.put(KV_KEYS.interview(rec.id), JSON.stringify(rec));

    await handleNotification(env, { kind: 'processed', interviewId: rec.id, queuedAt: NOW, reason: 'new_upload' });

    expect((await stored(env, rec.id)).submitterReview?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    vi.restoreAllMocks();
  });

  it.each([
    ['pending_review', 'reprocess_version_drift'],
    ['approved', 'reprocess_version_drift'],
    ['pending_review', 'retry_admin'],
  ] as const)(
    'does not reopen the submitter review when the record is %s (reason %s)',
    async (status, reason) => {
      vi.spyOn(console, 'log').mockImplementation(() => undefined);
      const env = makeEnv();
      const rec = record({ approval: { status }, submitterReview: { revisionRound: 0, submittedAt: NOW } });
      await env.SESAP_KV.put(KV_KEYS.interview(rec.id), JSON.stringify(rec));

      await handleNotification(env, { kind: 'processed', interviewId: rec.id, queuedAt: NOW, reason });

      // An admin's reprocess is an admin matter: no token, no email, state untouched.
      const after = await stored(env, rec.id);
      expect(after.submitterReview?.tokenHash).toBeUndefined();
      expect(after.submitterReview?.submittedAt).toBe(NOW);
      expect(after.approval.status).toBe(status);
      vi.restoreAllMocks();
    },
  );
});
