/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName : '',
  images: {
    unoptimized: true,
  },
  turbopack: {},
  webpack: (config: { resolve: { alias: Record<string, boolean | string>; fallback?: Record<string, boolean> } }, { isServer }: { isServer: boolean }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };

    // Fix for @xenova/transformers in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;