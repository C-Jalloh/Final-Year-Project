import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Conditionally import bundle analyzer
let withBundleAnalyzer = null;
if (process.env.ANALYZE === 'true') {
  try {
    withBundleAnalyzer = (await import('@next/bundle-analyzer')).default;
  } catch (error) {
    console.warn('Bundle analyzer not available, skipping...');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-easy-crop'],
  },
  webpack: (config, { dev }) => {
    // Ensure @ alias points to the src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '.'),
    }

    // Optimize bundle splitting
    if (!dev) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        cropper: {
          test: /[\\/]node_modules[\\/]react-easy-crop[\\/]/,
          name: 'cropper',
          chunks: 'all',
          priority: 10,
        },
      };
    }

    return config
  },
}

export default (process.env.ANALYZE === 'true' && withBundleAnalyzer) ? withBundleAnalyzer()(nextConfig) : nextConfig;
