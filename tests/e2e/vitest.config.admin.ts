import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..', '..');

export default defineWorkersConfig({
  test: {
    name: 'e2e-admin',
    include: ['admin/**/*.e2e.test.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        main: path.resolve(repoRoot, 'workers/admin/src/index.ts'),
        miniflare: {
          compatibilityDate: '2024-12-18',
          compatibilityFlags: ['nodejs_compat'],
          r2Buckets: ['SESAP_BUCKET'],
          kvNamespaces: ['SESAP_KV'],
          queueProducers: { PROCESSING_QUEUE: 'interview-processing' },
          queueConsumers: { 'interview-processing': { maxBatchSize: 1 } },
          bindings: {
            ENVIRONMENT: 'development',
            SHOWCASE_URL: 'http://localhost:8790',
          },
          serviceBindings: {
            PROCESSING_WORKER: () => new Response('stub', { status: 200 }),
            INDEXING_WORKER: () =>
              new Response(
                JSON.stringify({
                  success: true,
                  buildId: 'build_test_stub',
                  interviewCount: 1,
                  artifacts: {},
                  timestamp: '2026-01-01T00:00:00.000Z',
                }),
                { headers: { 'content-type': 'application/json' } },
              ),
          },
        },
      },
    },
  },
});
