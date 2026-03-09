import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  output: 'export',
  trailingSlash: true,
  transpilePackages: ['@sesap/shared'],
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Rewrites only apply in next dev (not with output: 'export'); keep for local dev proxy
  async rewrites() {
    return [
      { source: '/assets/build/:path*', destination: 'http://localhost:8790/assets/build/:path*' },
    ];
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
}
