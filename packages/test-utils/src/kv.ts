import { vi } from 'vitest';

interface StoredValue {
  value: string;
  metadata?: unknown;
  /** Epoch millis after which the entry is invisible, or `undefined` for no expiry. */
  expiresAt?: number;
}

export interface MockKVOptions {
  /** Initial contents, keyed exactly as the code under test will read them. */
  seed?: Record<string, string>;
  /** Clock used to evaluate `expirationTtl` / `expiration`. Defaults to `Date.now`. */
  now?: () => number;
}

export interface MockKVNamespace extends KVNamespace {
  /** Direct access to the backing map — handy for asserting on writes. */
  readonly store: Map<string, string>;
}

/**
 * In-memory `KVNamespace` good enough for unit tests: real prefix listing with
 * cursor pagination, and TTL support so expiry paths can be exercised against
 * an injected clock rather than a sleep.
 */
export function createMockKVNamespace(options: MockKVOptions = {}): MockKVNamespace {
  const now = options.now ?? Date.now;
  const entries = new Map<string, StoredValue>();

  for (const [key, value] of Object.entries(options.seed ?? {})) {
    entries.set(key, { value });
  }

  const live = (key: string): StoredValue | undefined => {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== undefined && entry.expiresAt <= now()) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  };

  const liveKeys = (): string[] => {
    for (const key of [...entries.keys()]) live(key);
    return [...entries.keys()].sort();
  };

  const mock = {
    get: vi.fn(async (key: string, type?: unknown) => {
      const entry = live(key);
      if (!entry) return null;
      const format = typeof type === 'string' ? type : (type as { type?: string })?.type;
      return format === 'json' ? JSON.parse(entry.value) : entry.value;
    }),

    getWithMetadata: vi.fn(async (key: string) => {
      const entry = live(key);
      if (!entry) return { value: null, metadata: null };
      return { value: entry.value, metadata: entry.metadata ?? null };
    }),

    put: vi.fn(
      async (
        key: string,
        value: string,
        putOptions?: { expirationTtl?: number; expiration?: number; metadata?: unknown },
      ) => {
        let expiresAt: number | undefined;
        if (putOptions?.expirationTtl !== undefined) {
          expiresAt = now() + putOptions.expirationTtl * 1000;
        } else if (putOptions?.expiration !== undefined) {
          expiresAt = putOptions.expiration * 1000;
        }
        entries.set(key, { value, metadata: putOptions?.metadata, expiresAt });
      },
    ),

    delete: vi.fn(async (key: string) => {
      entries.delete(key);
    }),

    list: vi.fn(
      async (listOptions?: { prefix?: string; limit?: number; cursor?: string }) => {
        const prefix = listOptions?.prefix ?? '';
        const limit = listOptions?.limit ?? 1000;
        const offset = listOptions?.cursor ? Number(listOptions.cursor) : 0;

        const matching = liveKeys().filter((key) => key.startsWith(prefix));
        const page = matching.slice(offset, offset + limit);
        const nextOffset = offset + page.length;
        const complete = nextOffset >= matching.length;

        return {
          keys: page.map((name) => ({ name })),
          list_complete: complete,
          ...(complete ? {} : { cursor: String(nextOffset) }),
        };
      },
    ),
  };

  Object.defineProperty(mock, 'store', {
    get: () => new Map([...entries].map(([key, entry]) => [key, entry.value])),
  });

  return mock as unknown as MockKVNamespace;
}
