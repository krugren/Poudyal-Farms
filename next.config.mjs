/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Google profile photos for imported reviews
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security + caching headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // Public content API
        source: '/api/content/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        // SSE streams must never be cached
        source: '/api/:path*/stream',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, no-transform' },
          { key: 'X-Accel-Buffering', value: 'no' },
        ],
      },
      {
        // Uploaded gallery images — 1-year immutable cache
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Admin API — never cache, never index
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },

  // Externalize native modules for serverless
  serverExternalPackages: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;