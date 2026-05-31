import { describe, expect, it } from 'vitest';
import app from '../../../workers/showcase/src/index';

function createMockAiNeuronLimiter(options: { exhausted?: boolean } = {}): DurableObjectNamespace {
  const fetch = async (input: RequestInfo | URL) => {
    const path = new URL(input.toString()).pathname;
    if (path === '/reserve' && options.exhausted) {
      return new Response(JSON.stringify({
        ok: false,
        code: 'AI_BUDGET_EXCEEDED',
        error: 'Workers AI daily neuron budget exhausted',
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
    if (path === '/reserve') {
      return new Response(JSON.stringify({ ok: true, reservationId: 'res-1' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return {
    idFromName: () => ({}),
    get: () => ({ fetch }),
  } as unknown as DurableObjectNamespace;
}

function makeEnv(
  run: Ai['run'],
  options: { exhausted?: boolean } = {},
): import('../../../workers/showcase/src/bindings').Env {
  return {
    AI: { run } as Ai,
    AI_NEURON_LIMITER: createMockAiNeuronLimiter(options),
    ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } as Fetcher,
    SESAP_BUCKET: {} as R2Bucket,
    SESAP_KV: {} as KVNamespace,
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

  it('returns 429 without calling Workers AI when the neuron budget is exhausted', async () => {
    let called = false;
    const env = makeEnv(async () => {
      called = true;
      return { data: [[0.1]] };
    }, { exhausted: true });

    const res = await app.fetch(
      new Request('http://showcase/api/search/embed', {
        method: 'POST',
        body: JSON.stringify({ query: 'research' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      env,
    );

    expect(res.status).toBe(429);
    expect(called).toBe(false);
    await expect(res.json()).resolves.toEqual({
      error: 'Workers AI daily neuron budget exhausted',
    });
  });
});
