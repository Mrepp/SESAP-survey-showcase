import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { R2_PATHS } from '@sesap/types';
import { makeSampleInterview } from '../fixtures/sample-interview';
import { seedApprovedInterview, clearAll } from '../helpers/seed';

vi.mock('../../../workers/indexing/src/services/category-embedding-service', async () => {
  const { fakeGenerateCategoryEmbeddings } = await import('../helpers/mock-ai');
  return {
    generateCategoryEmbeddings: async (_env: unknown, interviews: any) => fakeGenerateCategoryEmbeddings(interviews),
  };
});

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket; SESAP_KV: KVNamespace };

const ARTIFACTS = [
  'vector-indices.json',
  'clusters.json',
  'search-index.json',
  'interviews.json',
  'metadata.json',
];

describe('build pipeline writes all expected artifacts', () => {
  beforeEach(async () => {
    await clearAll(e2eEnv);
  });

  it('refuses to build with no approved interviews', async () => {
    const res = await SELF.fetch('http://indexing/api/build', { method: 'POST' });
    expect(res.status).toBe(400);
  });

  it('produces every build artifact and includes a newly approved interview', async () => {
    const existing = makeSampleInterview({ id: 'int_existing0001' });
    await seedApprovedInterview(e2eEnv, existing);

    const newcomer = makeSampleInterview({
      id: 'int_newcomer002',
      title: 'Newly Added',
      tags: ['fresh_tag'],
    });
    await seedApprovedInterview(e2eEnv, newcomer);

    const res = await SELF.fetch('http://indexing/api/build', { method: 'POST' });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; interviewCount: number };
    expect(body.success).toBe(true);
    expect(body.interviewCount).toBe(2);

    for (const name of ARTIFACTS) {
      const obj = await e2eEnv.SESAP_BUCKET.head(R2_PATHS.buildArtifact(name));
      expect(obj, `${name} should exist in R2`).not.toBeNull();
    }

    const interviewsObj = await e2eEnv.SESAP_BUCKET.get(R2_PATHS.buildArtifact('interviews.json'));
    const interviews = (await interviewsObj!.json()) as { id: string; title: string }[];
    expect(interviews.map((i) => i.id)).toContain(newcomer.id);
    expect(interviews.map((i) => i.id)).toContain(existing.id);
    expect(interviews.find((i) => i.id === newcomer.id)?.title).toBe('Newly Added');
  });
});
