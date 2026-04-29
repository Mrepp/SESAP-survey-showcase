import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== 'production';
const showcaseWorkerUrl =
  process.env.SHOWCASE_WORKER_URL ?? 'http://127.0.0.1:8790';

export default {
  // `output: 'export'` is only valid for the production build (which is what
  // gets shipped to Cloudflare's ASSETS binding). In `next dev` we leave it
  // off so that rewrites are honored, letting the dev server proxy
  // `/assets/build/*` (R2-backed data) to the showcase worker.
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  transpilePackages: ['@sesap/shared'],
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
        source: '/assets/build/:path*',
        destination: `${showcaseWorkerUrl}/assets/build/:path*`,
      },
    ];
  },
}
