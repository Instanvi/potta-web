/** Upstream payroll/expense API (no trailing slash). Browser calls go via /payroll-proxy. */
const payrollApiBase = (
  process.env.PAYROLL_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_PAYROLL_API_URL ||
  'https://api.spend.instanvi.com/api/'
).replace(/\/+$/, '');

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
  serverExternalPackages: ['@react-pdf/renderer'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/payroll-proxy/:path*',
        destination: `${payrollApiBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
