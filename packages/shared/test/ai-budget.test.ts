import { describe, expect, it, vi } from 'vitest';
import { KV_KEYS } from '@sesap/types';
import {
  AiNeuronLimiter,
  estimateEmbeddingNeurons,
  estimateLlmNeurons,
  estimateTextTokens,
  estimateWhisperNeurons,
  runWithAiBudget,
  WORKERS_AI_MODELS,
} from '../src/ai-budget';

class MockStorage {
  store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async put<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async list<T>(options?: { prefix?: string }): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    for (const [key, value] of this.store.entries()) {
      if (!options?.prefix || key.startsWith(options.prefix)) {
        result.set(key, value as T);
      }
    }
    return result;
  }

  async transaction<T>(closure: (txn: MockStorage) => Promise<T>): Promise<T> {
    return closure(this);
  }
}

class MockKV {
  store = new Map<string, string>();

  constructor(maxNeurons?: number) {
    if (maxNeurons !== undefined) {
      this.store.set(KV_KEYS.aiNeuronsDailyMax, String(maxNeurons));
    }
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

function createLimiter(maxNeurons = 1000) {
  const storage = new MockStorage();
  const kv = new MockKV(maxNeurons);
  const limiter = new AiNeuronLimiter(
    { storage },
    { SESAP_KV: kv },
  );
  return { limiter, storage, kv };
}

async function post(limiter: AiNeuronLimiter, path: string, body: unknown): Promise<Response> {
  return limiter.fetch(new Request(`https://limiter${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }));
}

describe('Workers AI neuron estimators', () => {
  it('uses the 4 chars per token convention', () => {
    expect(estimateTextTokens('12345678')).toBe(2);
    expect(estimateTextTokens(['1234', '12345'])).toBe(3);
  });

  it('estimates LLM input and reserved output neurons', () => {
    const neurons = estimateLlmNeurons({
      kind: 'llm',
      model: WORKERS_AI_MODELS.llm,
      messages: [{ content: 'a'.repeat(4000) }],
      maxTokens: 1000,
    });
    expect(neurons).toBe(100);
  });

  it('estimates embedding neurons from input text tokens', () => {
    const neurons = estimateEmbeddingNeurons({
      kind: 'embedding',
      model: WORKERS_AI_MODELS.embedding,
      text: 'a'.repeat(4000),
    });
    expect(neurons).toBe(2);
  });

  it('estimates Whisper neurons from exact duration or byte fallback', () => {
    expect(estimateWhisperNeurons({
      kind: 'whisper',
      model: WORKERS_AI_MODELS.whisper,
      audioByteLength: 1,
      durationSeconds: 120,
    })).toBe(94);

    expect(estimateWhisperNeurons({
      kind: 'whisper',
      model: WORKERS_AI_MODELS.whisper,
      audioByteLength: 480_000,
    })).toBe(47);
  });
});

describe('AiNeuronLimiter', () => {
  it('reserves and consumes neurons under the daily max', async () => {
    const { limiter, kv } = createLimiter(100);

    const reserve = await post(limiter, '/reserve', { model: 'test', neurons: 40 });
    expect(reserve.status).toBe(200);
    const { reservationId } = await reserve.json() as { reservationId: string };

    const consume = await post(limiter, '/consume', { reservationId });
    expect(consume.status).toBe(200);
    const snapshot = JSON.parse(kv.store.get(KV_KEYS.aiNeuronsDailyUsage(new Date().toISOString().slice(0, 10))) ?? '{}');
    expect(snapshot.consumedNeurons).toBe(40);
    expect(snapshot.reservedNeurons).toBe(0);
  });

  it('rejects reservations that would exceed the cap', async () => {
    const { limiter } = createLimiter(50);

    const first = await post(limiter, '/reserve', { model: 'test', neurons: 40 });
    expect(first.status).toBe(200);

    const second = await post(limiter, '/reserve', { model: 'test', neurons: 11 });
    expect(second.status).toBe(429);
  });

  it('refunds reserved neurons on release', async () => {
    const { limiter } = createLimiter(50);
    const reserve = await post(limiter, '/reserve', { model: 'test', neurons: 40 });
    const { reservationId } = await reserve.json() as { reservationId: string };

    const release = await post(limiter, '/release', { reservationId });
    expect(release.status).toBe(200);

    const second = await post(limiter, '/reserve', { model: 'test', neurons: 50 });
    expect(second.status).toBe(200);
  });

  it('resets usage on a UTC date change', async () => {
    const { limiter, storage } = createLimiter(50);
    await storage.put('state', {
      date: '2000-01-01',
      maxNeurons: 50,
      reservedNeurons: 0,
      consumedNeurons: 50,
      updatedAt: '2000-01-01T00:00:00.000Z',
    });

    const reserve = await post(limiter, '/reserve', { model: 'test', neurons: 50 });
    expect(reserve.status).toBe(200);
  });

  it('reads an updated max from KV on each reservation', async () => {
    const { limiter, kv } = createLimiter(50);
    kv.store.set(KV_KEYS.aiNeuronsDailyMax, '100');

    const reserve = await post(limiter, '/reserve', { model: 'test', neurons: 75 });
    expect(reserve.status).toBe(200);
  });

  it('fails when the max is missing from KV', async () => {
    const storage = new MockStorage();
    const kv = new MockKV();
    const limiter = new AiNeuronLimiter({ storage }, { SESAP_KV: kv });

    const reserve = await post(limiter, '/reserve', { model: 'test', neurons: 1 });
    expect(reserve.status).toBe(503);
  });
});

describe('runWithAiBudget', () => {
  it('does not call AI when reservation fails', async () => {
    const limiter = {
      idFromName: () => ({}),
      get: () => ({
        fetch: async () => new Response(JSON.stringify({
          ok: false,
          code: 'AI_BUDGET_EXCEEDED',
          error: 'budget exhausted',
        }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      }),
    };
    const run = vi.fn(async () => 'result');

    await expect(runWithAiBudget(
      { SESAP_KV: new MockKV(100), AI_NEURON_LIMITER: limiter },
      {
        model: WORKERS_AI_MODELS.embedding,
        estimate: { kind: 'embedding', model: WORKERS_AI_MODELS.embedding, text: 'query' },
      },
      run,
    )).rejects.toThrow('budget exhausted');

    expect(run).not.toHaveBeenCalled();
  });

  it('releases a reservation when AI fails', async () => {
    const calls: string[] = [];
    const limiter = {
      idFromName: () => ({}),
      get: () => ({
        fetch: async (input: RequestInfo | URL) => {
          const path = new URL(input.toString()).pathname;
          calls.push(path);
          if (path === '/reserve') {
            return new Response(JSON.stringify({ ok: true, reservationId: 'res-1' }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        },
      }),
    };

    await expect(runWithAiBudget(
      { SESAP_KV: new MockKV(100), AI_NEURON_LIMITER: limiter },
      {
        model: WORKERS_AI_MODELS.embedding,
        estimate: { kind: 'embedding', model: WORKERS_AI_MODELS.embedding, text: 'query' },
      },
      async () => {
        throw new Error('AI failed');
      },
    )).rejects.toThrow('AI failed');

    expect(calls).toEqual(['/reserve', '/release']);
  });
});
