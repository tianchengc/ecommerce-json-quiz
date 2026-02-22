import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Note: Supported in dev, but can have quirks in next-on-pages production
  images: {
    unoptimized: true, // Necessary if not using a custom Cloudflare image loader
  },
};

// Initialize Cloudflare dev platform only when running locally
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;