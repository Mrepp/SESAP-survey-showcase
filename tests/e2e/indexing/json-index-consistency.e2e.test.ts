import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { R2_PATHS } from '@sesap/types';
import type {
  BuildMetadata,
  VectorIndices,
  SearchIndex,
} from '@sesap/types';
import { makeSampleInterview } from '../fixtures/sample-interview';
import { seedApprovedInterview, clearAll, getJson } from '../helpers/seed';

vi.mock('../../../workers/indexing/src/services/category-embedding-service', async () => {
  const { fakeGenerateCategoryEmbeddings } = await import('../helpers/mock-ai');
  return {
    generateCategoryEmbeddings: async (_env: unknown, interviews: any) => fakeGenerateCategoryEmbeddings(interviews),
  };
});

interface E2eEnv {
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
}

const e2eEnv = env as unknown as E2eEnv;

interface InterviewIndexEntry {
  id: string;
  title: string;
  demographics: { college: string; major: string };
  metadata: { interviewDate: string; interviewer: string };
  analysis: { themes: { id: string }[]; quotes: { tags: string[] }[] };
  transcript?: unknown;
}

describe('reviewed JSON ⟷ generated indexes consistency', () => {
  beforeEach(async () => {
    await clearAll(e2eEnv);
  });

  it('every approved interview is faithfully reflected in all build artifacts', async () => {
    const a = makeSampleInterview({
      id: 'int_aaaa1111',
      title: 'Alex',
      tags: ['career', 'mentorship', 'internship'],
      category: 'career',
    });
    const b = makeSampleInterview({
      id: 'int_bbbb2222',
      title: 'Brooke',
      major: 'Biology',
      tags: ['research', 'mentorship'],
      category: 'research',
      themes: [
        { id: 'int_bbbb2222_thm_0', title: 'Lab discovery', description: 'Found research group early.' },
      ],
    });
    await seedApprovedInterview(e2eEnv, a);
    await seedApprovedInterview(e2eEnv, b);

    const res = await SELF.fetch('http://indexing/api/build', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; interviewCount: number };
    expect(body.success).toBe(true);
    expect(body.interviewCount).toBe(2);

    const interviews = await getJson<InterviewIndexEntry[]>(
      e2eEnv.SESAP_BUCKET,
      R2_PATHS.buildArtifact('interviews.json'),
    );
    expect(interviews).not.toBeNull();
    expect(interviews!.map((i) => i.id).sort()).toEqual([a.id, b.id]);

    for (const source of [a, b]) {
      const entry = interviews!.find((i) => i.id === source.id)!;
      expect(entry.title).toBe(source.title);
      expect(entry.demographics).toEqual(source.demographics);
      expect(entry.metadata).toEqual(source.metadata);
      expect(entry.analysis.themes.map((t) => t.id)).toEqual(source.analysis!.themes.map((t) => t.id));
      expect(entry.analysis.quotes[0].tags).toEqual(source.analysis!.quotes[0].tags);
      expect(entry.transcript).toBeUndefined();
    }

    const vectors = await getJson<VectorIndices>(e2eEnv.SESAP_BUCKET, R2_PATHS.buildArtifact('vector-indices.json'));
    expect(vectors).not.toBeNull();
    const summaryIds = vectors!.summary.map((v) => v.id).sort();
    expect(summaryIds).toEqual([a.id, b.id]);

    const search = await getJson<SearchIndex>(e2eEnv.SESAP_BUCKET, R2_PATHS.buildArtifact('search-index.json'));
    expect(search).not.toBeNull();
    const searchInterviewIds = new Set(search!.documents.map((d) => d.interviewId));
    expect(searchInterviewIds.has(a.id)).toBe(true);
    expect(searchInterviewIds.has(b.id)).toBe(true);

    const metadata = await getJson<BuildMetadata>(e2eEnv.SESAP_BUCKET, R2_PATHS.buildArtifact('metadata.json'));
    expect(metadata).not.toBeNull();
    expect(metadata!.interviewCount).toBe(2);

    const allSourceTags = new Set<string>();
    for (const src of [a, b]) for (const q of src.analysis!.quotes) for (const t of q.tags) allSourceTags.add(t);
    for (const tag of allSourceTags) expect(metadata!.tags).toContain(tag);
  });

  it('mutating source JSON propagates into rebuilt indexes', async () => {
    const original = makeSampleInterview({
      id: 'int_cccc3333',
      tags: ['original_tag'],
      themes: [{ id: 'int_cccc3333_thm_0', title: 'Original theme', description: 'Original.' }],
    });
    await seedApprovedInterview(e2eEnv, original);

    const r1 = await SELF.fetch('http://indexing/api/build', { method: 'POST' });
    expect(r1.status).toBe(200);

    const meta1 = await getJson<BuildMetadata>(e2eEnv.SESAP_BUCKET, R2_PATHS.buildArtifact('metadata.json'));
    expect(meta1!.tags).toContain('original_tag');

    const mutated = makeSampleInterview({
      id: 'int_cccc3333',
      tags: ['new_tag'],
      themes: [{ id: 'int_cccc3333_thm_replaced', title: 'Replaced theme', description: 'Different.' }],
    });
    await seedApprovedInterview(e2eEnv, mutated);

    const r2 = await SELF.fetch('http://indexing/api/build', { method: 'POST' });
    expect(r2.status).toBe(200);

    const meta2 = await getJson<BuildMetadata>(e2eEnv.SESAP_BUCKET, R2_PATHS.buildArtifact('metadata.json'));
    expect(meta2!.tags).toContain('new_tag');
    expect(meta2!.tags).not.toContain('original_tag');

    const interviews2 = await getJson<InterviewIndexEntry[]>(
      e2eEnv.SESAP_BUCKET,
      R2_PATHS.buildArtifact('interviews.json'),
    );
    const themeIds = interviews2![0].analysis.themes.map((t) => t.id);
    expect(themeIds).toContain('int_cccc3333_thm_replaced');
    expect(themeIds).not.toContain('int_cccc3333_thm_0');
  });
});
