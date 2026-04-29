import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..', '..');

export default defineWorkersConfig({
  test: {
    name: 'e2e-indexing',
    include: ['indexing/**/*.e2e.test.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        main: path.resolve(repoRoot, 'workers/indexing/src/index.ts'),
        miniflare: {
          compatibilityDate: '2024-12-18',
          compatibilityFlags: ['nodejs_compat'],
          r2Buckets: ['SESAP_BUCKET'],
          kvNamespaces: ['SESAP_KV'],
          bindings: { ENVIRONMENT: 'test' },
        },
      },
    },
  },
});
