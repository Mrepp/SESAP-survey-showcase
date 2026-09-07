import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

export default defineConfig({
  plugins: [
    cloudflareTest({
      main: path.resolve(repoRoot, 'workers/intake/src/index.ts'),
      miniflare: {
        compatibilityDate: '2024-12-18',
        compatibilityFlags: ['nodejs_compat'],
        r2Buckets: ['SESAP_BUCKET'],
        kvNamespaces: ['SESAP_KV'],
        queueProducers: { PROCESSING_QUEUE: 'interview-processing' },
        queueConsumers: { 'interview-notifications': { maxBatchSize: 1 } },
        durableObjects: { INTAKE_VERIFY: 'IntakeVerificationGuard' },
        bindings: {
          ENVIRONMENT: 'development',
          INTAKE_URL: 'http://localhost:8791',
          SHOWCASE_URL: 'http://localhost:8790',
          ALLOWED_EMAIL_DOMAIN: 'oregonstate.edu',
          EMAIL_FROM: 'sesap@example.edu',
          MEDIA_RETENTION_DAYS: '365',
          INTAKE_SESSION_SECRET: 'e2e-session-secret',
        },
        serviceBindings: {
          // The static export is not built in CI; every asset request 404s,
          // which is fine because these tests only exercise /api/*.
          ASSETS: () => new Response('not built', { status: 404 }),
        },
      },
    }),
  ],
  test: {
    name: 'e2e-intake',
    include: ['intake/**/*.e2e.test.ts'],
  },
});
