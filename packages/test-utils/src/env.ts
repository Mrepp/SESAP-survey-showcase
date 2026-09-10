import { createMockKVNamespace } from './kv';
import { createMockR2Bucket } from './r2';

/** Bindings every SESAP worker shares, pre-populated by {@link createMockEnv}. */
export interface BaseMockEnv {
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  ENVIRONMENT: string;
}

/**
 * Build a worker `Env` for unit tests: the storage bindings every worker has,
 * plus whatever the worker under test adds.
 *
 * ```ts
 * const env = createMockEnv<Env>({ PROCESSING_QUEUE: createMockQueue() });
 * ```
 */
export function createMockEnv<T extends Partial<BaseMockEnv>>(
  overrides: Partial<T> = {} as Partial<T>,
): T {
  return {
    SESAP_BUCKET: createMockR2Bucket(),
    SESAP_KV: createMockKVNamespace(),
    ENVIRONMENT: 'test',
    ...overrides,
  } as unknown as T;
}
