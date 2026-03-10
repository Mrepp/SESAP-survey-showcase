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
