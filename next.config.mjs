/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, 
  images: {
    unoptimized: true, // Still necessary for Cloudflare Pages
  },
};

export default nextConfig;