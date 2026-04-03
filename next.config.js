/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  cacheComponents: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
};

module.exports = nextConfig;
