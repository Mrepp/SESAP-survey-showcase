import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== 'production';
const adminWorkerUrl = process.env.ADMIN_WORKER_URL ?? 'http://127.0.0.1:8787';

export default {
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  transpilePackages: ['@sesap/shared', '@sesap/types'],
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
        destination: `${adminWorkerUrl}/api/:path*`,
      },
    ];
  },
};
