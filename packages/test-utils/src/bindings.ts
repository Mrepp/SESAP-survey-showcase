import { vi } from 'vitest';

export interface MockQueue<T> extends Queue<T> {
  /** Every message passed to `send`, in order. */
  readonly sent: T[];
}

/** Queue producer that records what was enqueued instead of delivering it. */
export function createMockQueue<T>(): MockQueue<T> {
  const sent: T[] = [];
  const mock = {
    send: vi.fn(async (message: T) => {
      sent.push(message);
    }),
    sendBatch: vi.fn(async (messages: Iterable<{ body: T }>) => {
      for (const message of messages) sent.push(message.body);
    }),
  };
  return Object.assign(mock, { sent }) as unknown as MockQueue<T>;
}

/**
 * Service binding stub. Defaults to `200 stub`; pass a handler to script
 * per-request behavior.
 */
export function createMockFetcher(
  handler: (request: Request) => Response | Promise<Response> = () =>
    new Response('stub', { status: 200 }),
): Fetcher {
  return {
    fetch: vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      handler(input instanceof Request ? input : new Request(String(input), init)),
    ),
  } as unknown as Fetcher;
}

/** Convenience for a service binding that always answers with the same JSON. */
export function createJsonFetcher(body: unknown, status = 200): Fetcher {
  return createMockFetcher(
    () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
}

export interface MockAiNeuronLimiterOptions {
  /** When true, `/reserve` answers 429 AI_BUDGET_EXCEEDED. */
  exhausted?: boolean;
}

/**
 * Durable Object namespace standing in for `AiNeuronLimiter`. Only `/reserve`
 * differentiates behavior; every other path acknowledges with `{ ok: true }`.
 */
export function createMockAiNeuronLimiter(
  options: MockAiNeuronLimiterOptions = {},
): DurableObjectNamespace {
  let reservations = 0;

  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });

    const path = new URL(input.toString()).pathname;

    if (path === '/reserve') {
      if (options.exhausted) {
        return json(
          {
            ok: false,
            code: 'AI_BUDGET_EXCEEDED',
            error: 'Workers AI daily neuron budget exhausted',
            details: { remainingNeurons: 0 },
          },
          429,
        );
      }
      reservations += 1;
      return json({ ok: true, reservationId: `res-${reservations}`, estimatedNeurons: 1 });
    }

    return json({ ok: true });
  });

  return {
    idFromName: vi.fn(() => ({})),
    idFromString: vi.fn(() => ({})),
    newUniqueId: vi.fn(() => ({})),
    get: vi.fn(() => ({ fetch })),
  } as unknown as DurableObjectNamespace;
}

export type AiModelHandler = (input: Record<string, unknown>) => unknown;

/**
 * Workers AI binding that dispatches on model id. Unlisted models resolve to
 * `{}`, matching how the real binding shrugs at an unknown response shape.
 */
export function createMockAi(handlers: Record<string, AiModelHandler>): Ai {
  return {
    run: vi.fn(async (model: string, input: Record<string, unknown> = {}) => {
      const handler = handlers[model];
      return handler ? handler(input) : {};
    }),
  } as unknown as Ai;
}

interface MockDurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  list<T = unknown>(options?: { prefix?: string }): Promise<Map<string, T>>;
  transaction<T>(closure: (txn: MockDurableObjectStorage) => Promise<T>): Promise<T>;
  setAlarm(scheduledTime: number | Date): Promise<void>;
  getAlarm(): Promise<number | null>;
  /** Test seam: the raw backing map. */
  readonly store: Map<string, unknown>;
}

/** In-memory `DurableObjectState.storage`, enough for classes that use the KV-style API. */
export function createMockDurableObjectStorage(): MockDurableObjectStorage {
  const store = new Map<string, unknown>();
  let alarm: number | null = null;
  const storage: MockDurableObjectStorage = {
    store,
    async get<T>(key: string) {
      return store.get(key) as T | undefined;
    },
    async put<T>(key: string, value: T) {
      store.set(key, value);
    },
    async delete(key: string) {
      return store.delete(key);
    },
    async deleteAll() {
      store.clear();
    },
    async list<T>(options?: { prefix?: string }) {
      const result = new Map<string, T>();
      for (const [key, value] of store) {
        if (!options?.prefix || key.startsWith(options.prefix)) result.set(key, value as T);
      }
      return result;
    },
    async transaction<T>(closure: (txn: MockDurableObjectStorage) => Promise<T>) {
      return closure(storage);
    },
    async setAlarm(scheduledTime: number | Date) {
      alarm = typeof scheduledTime === 'number' ? scheduledTime : scheduledTime.getTime();
    },
    async getAlarm() {
      return alarm;
    },
  };
  return storage;
}

export interface MockDurableObjectInstance {
  fetch(request: Request): Promise<Response>;
}

/**
 * A `DurableObjectNamespace` that routes each name to one in-memory instance
 * built by `factory`, so a worker service can be exercised against the real
 * Durable Object class without workerd.
 */
export function createMockDurableObjectNamespace(
  factory: (name: string, state: { storage: MockDurableObjectStorage }) => MockDurableObjectInstance,
): DurableObjectNamespace & { instances: Map<string, MockDurableObjectInstance> } {
  const instances = new Map<string, MockDurableObjectInstance>();

  const instanceFor = (name: string) => {
    let instance = instances.get(name);
    if (!instance) {
      instance = factory(name, { storage: createMockDurableObjectStorage() });
      instances.set(name, instance);
    }
    return instance;
  };

  const namespace = {
    instances,
    idFromName: vi.fn((name: string) => ({ name, toString: () => name })),
    idFromString: vi.fn((id: string) => ({ name: id, toString: () => id })),
    newUniqueId: vi.fn(() => ({ name: crypto.randomUUID(), toString: () => 'unique' })),
    get: vi.fn((id: { name: string }) => ({
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        instanceFor(id.name).fetch(input instanceof Request ? input : new Request(String(input), init)),
    })),
  };

  return namespace as unknown as DurableObjectNamespace & {
    instances: Map<string, MockDurableObjectInstance>;
  };
}

export interface MockRateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
  /** Calls so far, per key. */
  readonly counts: Map<string, number>;
}

/** Cloudflare Rate Limiting binding: allows `limit` calls per key, then refuses. */
export function createMockRateLimit(limit: number): MockRateLimitBinding {
  const counts = new Map<string, number>();
  return {
    counts,
    async limit({ key }) {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return { success: next <= limit };
    },
  };
}
