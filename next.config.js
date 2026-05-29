/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `output: 'export'` was removed when the app gained a real Supabase
  // backend (auth + DB need a server). Marketing routes (/, /careers, /partners)
  // stay statically optimized via `export const dynamic = 'force-static'` in each
  // page; the app routes (/platform, /guest) render dynamically. See
  // BUSINESS-ROADMAP.md Phase 0.
  reactStrictMode: true,
  images: {
    // Guest + dashboard surfaces hot-link Unsplash. Allow it through the Next
    // image optimizer (replaces the old `unoptimized: true` static-export hack).
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
