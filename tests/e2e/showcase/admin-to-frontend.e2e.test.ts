import { describe, it, expect, beforeEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { R2_PATHS } from '@sesap/types';

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket };

interface FrontendInterviewEntry {
  id: string;
  title: string;
  demographics: { major: string };
  analysis: { themes: { id: string; title: string }[]; quotes: { tags: string[] }[] };
}

const APPROVED_ID = 'int_approved0001';
const APPROVED_TITLE = 'Frontend Visible';
const APPROVED_TAG = 'visible_tag';

const PENDING_ID = 'int_pending00002';

async function seedBuildArtifacts() {
  const interviews: FrontendInterviewEntry[] = [
    {
      id: APPROVED_ID,
      title: APPROVED_TITLE,
      demographics: { major: 'Computer Science' },
      analysis: {
        themes: [{ id: `${APPROVED_ID}_thm_0`, title: 'Mentorship' }],
        quotes: [{ tags: [APPROVED_TAG] }],
      },
    },
  ];

  await e2eEnv.SESAP_BUCKET.put(
    R2_PATHS.buildArtifact('interviews.json'),
    JSON.stringify(interviews),
    { httpMetadata: { contentType: 'application/json' } },
  );

  await e2eEnv.SESAP_BUCKET.put(
    R2_PATHS.buildArtifact('metadata.json'),
    JSON.stringify({
      buildId: 'build_test_001',
      timestamp: '2026-01-01T00:00:00.000Z',
      interviewCount: 1,
      embeddingDimension: 8,
      categories: ['career'],
      tags: [APPROVED_TAG],
      artifactPaths: {
        vectorIndices: 'build/vector-indices.json',
        clusters: 'build/clusters.json',
        searchIndex: 'build/search-index.json',
        interviews: 'build/interviews.json',
      },
    }),
    { httpMetadata: { contentType: 'application/json' } },
  );
}

describe('admin-added interview surfaces on the frontend', () => {
  beforeEach(async () => {
    for (const name of ['interviews.json', 'metadata.json']) {
      await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.buildArtifact(name));
    }
    await seedBuildArtifacts();
  });

  it('serves interviews.json via /assets/build/ with the approved interview', async () => {
    const res = await SELF.fetch('http://showcase/assets/build/interviews.json');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const interviews = (await res.json()) as FrontendInterviewEntry[];
    const ids = interviews.map((i) => i.id);
    expect(ids).toContain(APPROVED_ID);
    expect(ids).not.toContain(PENDING_ID);
    const entry = interviews.find((i) => i.id === APPROVED_ID)!;
    expect(entry.title).toBe(APPROVED_TITLE);
    expect(entry.analysis.quotes[0].tags).toContain(APPROVED_TAG);
  });

  it('exposes the approved tag through metadata.json so theme filtering works', async () => {
    const res = await SELF.fetch('http://showcase/assets/build/metadata.json');
    expect(res.status).toBe(200);

    const metadata = (await res.json()) as { tags: string[]; interviewCount: number };
    expect(metadata.tags).toContain(APPROVED_TAG);
    expect(metadata.interviewCount).toBe(1);
  });

  it('returns 404 for an artifact that was never built', async () => {
    const res = await SELF.fetch('http://showcase/assets/build/missing.json');
    expect(res.status).toBe(404);
  });
});
