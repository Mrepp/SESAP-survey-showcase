import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createExecutionContext,
  createMessageBatch,
  env,
  getQueueResult,
} from 'cloudflare:test';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { InterviewRecord, NotificationMessage } from '@sesap/types';
import worker from '../../../workers/intake/src/index';

/**
 * The `queue()` export itself — batching, ack and retry — driven through a real
 * `MessageBatch` on the `interview-notifications` consumer this suite declares.
 * `intake-flow.e2e.test.ts` calls `handleNotification` directly, which leaves
 * everything between the queue and that function untested.
 */

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket; SESAP_KV: KVNamespace };
const QUEUE = 'interview-notifications';
const EMAIL = 'beaver@oregonstate.edu';
const NOW = '2026-01-01T00:00:00.000Z';

/** With no EMAIL binding and no catcher the mailer logs, so read the log. */
let logged: string[] = [];

beforeEach(async () => {
  logged = [];
  vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
    logged.push(String(line));
  });

  for (const prefix of ['interview:', 'intake:']) {
    const listed = await e2eEnv.SESAP_KV.list({ prefix });
    for (const key of listed.keys) await e2eEnv.SESAP_KV.delete(key.name);
  }
});

afterEach(() => vi.restoreAllMocks());

function record(overrides: Partial<InterviewRecord> = {}): InterviewRecord {
  return {
    id: 'int_queue00000001',
    title: 'Alumni interview',
    demographics: {},
    metadata: { interviewDate: '2026-01-01' },
    source: 'audio',
    origin: 'self_service',
    submitter: { email: EMAIL, name: 'Casey Beaver', verifiedAt: NOW },
    submitterReview: { revisionRound: 0 },
    processing: { status: 'completed', completedAt: NOW },
    approval: { status: 'pending_submitter_review' },
    artifacts: { transcript: true, analysis: true, embeddings: false },
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

async function put(value: InterviewRecord): Promise<InterviewRecord> {
  await e2eEnv.SESAP_KV.put(KV_KEYS.interview(value.id), JSON.stringify(value));
  await e2eEnv.SESAP_BUCKET.put(R2_PATHS.transcript(value.id), 'I studied computer science.');
  return value;
}

async function deliver(...bodies: NotificationMessage[]) {
  const batch = createMessageBatch<NotificationMessage>(
    QUEUE,
    bodies.map((body, index) => ({
      id: `msg-${index}`,
      timestamp: new Date(NOW),
      attempts: 1,
      body,
    })),
  );
  const ctx = createExecutionContext();
  // The worker's queue() takes (batch, env); ctx is only for getQueueResult().
  await worker.queue(batch, env as never);
  return getQueueResult(batch, ctx);
}

describe('intake queue() consumer', () => {
  it('acks a processed notification and mints the review link it mails', async () => {
    const stored = await put(record());

    const result = await deliver({ kind: 'processed', interviewId: stored.id, queuedAt: NOW });

    expect(result.retryBatch.retry).toBeFalsy();
    expect(result.explicitAcks).toContain('msg-0');

    const after = JSON.parse((await e2eEnv.SESAP_KV.get(KV_KEYS.interview(stored.id)))!) as InterviewRecord;
    expect(after.submitterReview?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(logged.join('\n')).toContain('http://localhost:8891/review/');
  });

  it('points an approval at the showcase, not at a route intake does not serve', async () => {
    const stored = await put(
      record({ id: 'int_queue00000002', approval: { status: 'approved', reviewedAt: NOW } }),
    );

    const result = await deliver({ kind: 'approved', interviewId: stored.id, queuedAt: NOW });

    expect(result.explicitAcks).toContain('msg-0');
    expect(logged.join('\n')).toContain(
      `http://localhost:8890/interviews/view/?id=${stored.id}`,
    );
  });

  it('acks without mailing when the interview has no submitter', async () => {
    const stored = await put(
      record({ id: 'int_queue00000003', origin: 'admin', submitter: undefined }),
    );

    const result = await deliver({ kind: 'processed', interviewId: stored.id, queuedAt: NOW });

    expect(result.explicitAcks).toContain('msg-0');
    expect(logged.join('\n')).not.toContain('/review/');
  });

  it('retries the message whose interview is missing, and acks the rest of the batch', async () => {
    const stored = await put(record({ id: 'int_queue00000004' }));

    const result = await deliver(
      { kind: 'processed', interviewId: 'int_doesnotexist0', queuedAt: NOW },
      { kind: 'processed', interviewId: stored.id, queuedAt: NOW },
    );

    expect(result.retryMessages.map((message: { msgId: string }) => message.msgId)).toEqual([
      'msg-0',
    ]);
    expect(result.explicitAcks).toContain('msg-1');
  });
});
