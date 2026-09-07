import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== 'production';
const intakeWorkerUrl = process.env.INTAKE_WORKER_URL ?? 'http://127.0.0.1:8791';

export default {
  // `output: 'export'` is only valid for the production build — the one shipped
  // to the worker's ASSETS binding. In `next dev` it is left off so rewrites
  // are honored and /api/* proxies to the worker.
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  transpilePackages: [
    '@sesap/core',
    '@sesap/types',
    '@sesap/design-system',
    '@sesap/analysis-editor',
    '@sesap/ui-media',
  ],
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${intakeWorkerUrl}/api/:path*`,
      },
    ];
  },
};
