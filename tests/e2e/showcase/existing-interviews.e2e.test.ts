import { describe, it, expect, beforeEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { R2_PATHS } from '@sesap/types';
import { makeSampleInterview } from '../fixtures/sample-interview';

const e2eEnv = env as unknown as { SESAP_BUCKET: R2Bucket };

describe('existing interviews keep rendering after recent changes', () => {
  beforeEach(async () => {
    for (const name of ['interviews.json', 'metadata.json']) {
      await e2eEnv.SESAP_BUCKET.delete(R2_PATHS.buildArtifact(name));
    }
  });

  it('serves an interviews.json shape that the showcase UI still parses', async () => {
    const a = makeSampleInterview({ id: 'int_existing0a01', title: 'Existing A' });
    const b = makeSampleInterview({ id: 'int_existing0b02', title: 'Existing B' });

    const interviews = [a, b].map((i) => ({
      id: i.id,
      title: i.title,
      demographics: i.demographics,
      metadata: i.metadata,
      analysis: i.analysis,
    }));

    await e2eEnv.SESAP_BUCKET.put(
      R2_PATHS.buildArtifact('interviews.json'),
      JSON.stringify(interviews),
      { httpMetadata: { contentType: 'application/json' } },
    );

    const res = await SELF.fetch('http://showcase/assets/build/interviews.json');
    expect(res.status).toBe(200);
    const data = (await res.json()) as Array<{ id: string; title: string; analysis: unknown }>;

    for (const entry of data) {
      expect(entry.id).toBeDefined();
      expect(entry.title).toBeDefined();
      expect(entry.analysis).toBeDefined();
    }
    expect(data.map((e) => e.id).sort()).toEqual([a.id, b.id]);
  });

  it('tolerates older JSON missing optional fields (interviewURL, video)', async () => {
    const interview = makeSampleInterview({ id: 'int_legacy00001' });
    delete (interview.metadata as Record<string, unknown>).interviewURL;

    await e2eEnv.SESAP_BUCKET.put(
      R2_PATHS.buildArtifact('interviews.json'),
      JSON.stringify([
        {
          id: interview.id,
          title: interview.title,
          demographics: interview.demographics,
          metadata: interview.metadata,
          analysis: interview.analysis,
        },
      ]),
      { httpMetadata: { contentType: 'application/json' } },
    );

    const res = await SELF.fetch('http://showcase/assets/build/interviews.json');
    expect(res.status).toBe(200);
    const data = (await res.json()) as Array<{ id: string; metadata: Record<string, unknown> }>;
    expect(data[0].metadata.interviewURL).toBeUndefined();
    expect(data[0].metadata.interviewer).toBe('Test Interviewer');
  });
});
