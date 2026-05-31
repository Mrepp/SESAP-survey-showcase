import { describe, expect, it } from 'vitest';
import app from '../../../workers/showcase/src/index';

function makeEnv(run: Ai['run']): import('../../../workers/showcase/src/bindings').Env {
  return {
    AI: { run } as Ai,
    ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } as Fetcher,
    SESAP_BUCKET: {} as R2Bucket,
    ENVIRONMENT: 'test',
  };
}

describe('showcase semantic embedding endpoint', () => {
  it('returns a query embedding from the configured Cloudflare model', async () => {
    const env = makeEnv(async (model, input) => {
      expect(model).toBe('@cf/baai/bge-small-en-v1.5');
      expect(input).toEqual({ text: ['microwave research'] });
      return { data: [[0.1, 0.2, 0.3]] };
    });

    const res = await app.fetch(
      new Request('http://showcase/api/search/embed', {
        method: 'POST',
        body: JSON.stringify({ query: ' microwave research ' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      env,
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ embedding: [0.1, 0.2, 0.3] });
  });

  it('rejects an empty query', async () => {
    const env = makeEnv(async () => ({ data: [[0.1]] }));

    const res = await app.fetch(
      new Request('http://showcase/api/search/embed', {
        method: 'POST',
        body: JSON.stringify({ query: '   ' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      env,
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Query is required' });
  });

  it('returns a controlled error when embedding generation fails', async () => {
    const env = makeEnv(async () => {
      throw new Error('AI unavailable');
    });

    const res = await app.fetch(
      new Request('http://showcase/api/search/embed', {
        method: 'POST',
        body: JSON.stringify({ query: 'research' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      env,
    );

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: 'Embedding generation failed',
      message: 'AI unavailable',
    });
  });
});
