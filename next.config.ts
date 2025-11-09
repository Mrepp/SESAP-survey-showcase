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
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

module.exports = nextConfig;