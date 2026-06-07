/** @type {import('next').NextConfig} */
const IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'

const nextConfig = {
  reactStrictMode: true,
  // Native (Capacitor) build: static export bundled into the app. The web build
  // leaves this undefined and renders server components / middleware as before.
  ...(IS_NATIVE ? { output: 'export' } : {}),
  images: IS_NATIVE
    ? { unoptimized: true }
    : {
        // Guest + dashboard surfaces hot-link Unsplash via the Next optimizer.
        remotePatterns: [
          { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
      },
}

module.exports = nextConfig
