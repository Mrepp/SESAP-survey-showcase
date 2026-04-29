import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..', '..');

export default defineWorkersConfig({
  test: {
    name: 'e2e-showcase',
    include: ['showcase/**/*.e2e.test.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        main: path.resolve(repoRoot, 'workers/showcase/src/index.ts'),
        miniflare: {
          compatibilityDate: '2024-12-18',
          compatibilityFlags: ['nodejs_compat'],
          r2Buckets: ['SESAP_BUCKET'],
          bindings: { ENVIRONMENT: 'test' },
          serviceBindings: {
            ASSETS: () => new Response('not found', { status: 404 }),
          },
        },
      },
    },
  },
});
