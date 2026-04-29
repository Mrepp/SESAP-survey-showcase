import { describe, it, expect, beforeEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { Interview, InterviewRecord } from '@sesap/types';
import { makeSampleInterview, makeEmbeddings } from '../fixtures/sample-interview';

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket; SESAP_KV: KVNamespace };

async function clearAll() {
  const listRaw = await e2eEnv.SESAP_KV.get(KV_KEYS.interviewsList);
  const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
  for (const id of ids) {
    await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.transcript(id));
    await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.analysis(id));
    await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.embeddings(id));
    await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.interview(id));
    await e2eEnv.SESAP_KV.delete(KV_KEYS.interview(id));
  }
  await e2eEnv.SESAP_KV.delete(KV_KEYS.interviewsList);
  await e2eEnv.SESAP_KV.delete(KV_KEYS.buildDirty);
}

async function seedPostProcessing(interview: Interview): Promise<void> {
  await e2eEnv.SESAP_BUCKET.put(R2_PATHS.transcript(interview.id), interview.transcript.rawText);
  await e2eEnv.SESAP_BUCKET.put(R2_PATHS.analysis(interview.id), JSON.stringify(interview.analysis));
  await e2eEnv.SESAP_BUCKET.put(
    R2_PATHS.embeddings(interview.id),
    JSON.stringify(makeEmbeddings(interview)),
  );

  const record: InterviewRecord = {
    id: interview.id,
    title: interview.title,
    demographics: interview.demographics,
    metadata: interview.metadata,
    processing: { status: 'completed', completedAt: interview.updatedAt },
    approval: { status: 'pending_review' },
    artifacts: { transcript: true, analysis: true, embeddings: true },
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
  await e2eEnv.SESAP_KV.put(KV_KEYS.interview(interview.id), JSON.stringify(record));

  const listRaw = await e2eEnv.SESAP_KV.get(KV_KEYS.interviewsList);
  const list: string[] = listRaw ? JSON.parse(listRaw) : [];
  if (!list.includes(interview.id)) list.push(interview.id);
  await e2eEnv.SESAP_KV.put(KV_KEYS.interviewsList, JSON.stringify(list));
}

describe('admin approval pushes a complete Interview to R2', () => {
  beforeEach(async () => {
    await clearAll();
  });

  it('writes a fully-populated Interview JSON to interview_repository on approve', async () => {
    const interview = makeSampleInterview({ id: 'int_approve0001' });
    await seedPostProcessing(interview);

    const res = await SELF.fetch(`http://admin/api/interviews/${interview.id}/approve`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: InterviewRecord };
    expect(body.success).toBe(true);
    expect(body.data.approval.status).toBe('approved');

    const obj = await e2eEnv.SESAP_BUCKET.get(R2_PATHS.interview(interview.id));
    expect(obj).not.toBeNull();
    const stored = (await obj!.json()) as Interview;

    for (const field of [
      'id',
      'title',
      'demographics',
      'transcript',
      'metadata',
      'analysis',
      'embeddings',
      'createdAt',
      'updatedAt',
    ] as const) {
      expect(stored[field], `missing required field ${field}`).toBeDefined();
    }
    expect(stored.id).toBe(interview.id);
    expect(stored.transcript.rawText).toBe(interview.transcript.rawText);
    expect(stored.analysis?.themes.length).toBeGreaterThan(0);
    expect(stored.embeddings?.vectors.length).toBeGreaterThan(0);

    const dirtyRaw = await e2eEnv.SESAP_KV.get(KV_KEYS.buildDirty);
    expect(dirtyRaw).not.toBeNull();
    const dirty = JSON.parse(dirtyRaw!) as { isDirty: boolean; lastChangeType: string };
    expect(dirty.isDirty).toBe(true);
    expect(dirty.lastChangeType).toBe('approve');
  });

  it('refuses to approve when analysis artifact is missing', async () => {
    const interview = makeSampleInterview({ id: 'int_noanalysis01' });
    await e2eEnv.SESAP_BUCKET.put(R2_PATHS.transcript(interview.id), interview.transcript.rawText);

    const record: InterviewRecord = {
      id: interview.id,
      title: interview.title,
      demographics: interview.demographics,
      metadata: interview.metadata,
      processing: { status: 'completed' },
      approval: { status: 'pending_review' },
      artifacts: { transcript: true, analysis: false, embeddings: false },
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
    await e2eEnv.SESAP_KV.put(KV_KEYS.interview(interview.id), JSON.stringify(record));
    await e2eEnv.SESAP_KV.put(KV_KEYS.interviewsList, JSON.stringify([interview.id]));

    const res = await SELF.fetch(`http://admin/api/interviews/${interview.id}/approve`, {
      method: 'POST',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);

    const repo = await e2eEnv.SESAP_BUCKET.head(R2_PATHS.interview(interview.id));
    expect(repo).toBeNull();
  });
});
