// ─── AnimaPro — minimal service worker ────────────────────────────────────────
//
// Lightweight, dependency-free SW. Caches the app shell on install so the
// landing + platform routes load offline after a first visit, and serves
// stale-while-revalidate for everything else. Bump CACHE_VERSION to invalidate.
//
// Intentionally NOT next-pwa / workbox: those fight with Next 16 + Turbopack +
// `output: 'export'` and reference build-hashed asset paths that go stale on
// every deploy. This file is hand-rolled and stable across deploys.

const CACHE_VERSION = 'animapro-v1'
const APP_SHELL = [
  '/',
  '/platform',
  '/guest',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/favicon.ico',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // Allow individual shell URLs to fail (e.g. first visit while offline)
      // without aborting the whole install.
      .then(cache => Promise.allSettled(APP_SHELL.map(u => cache.add(u))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.open(CACHE_VERSION).then(async cache => {
      const cached = await cache.match(req)
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            cache.put(req, res.clone())
          }
          return res
        })
        .catch(() => cached) // offline → cache fallback (may be missing)
      // Stale-while-revalidate: serve cache immediately, refresh in background.
      return cached || network
    })
  )
})
