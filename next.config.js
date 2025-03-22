/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'static-cdn.jtvnw.net'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig;