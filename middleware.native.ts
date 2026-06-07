// ─── Animipro — middleware stub for native (static-export) builds ────────────
// This file is swapped in by scripts/build-native.js before `next build` runs
// with NEXT_PUBLIC_NATIVE=1. An empty matcher means Next.js does not attempt
// to bundle or execute middleware in the static export.
// The client-side <AuthGuard> performs route gating in the native app instead.

import { type NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(_request: NextRequest) {
  // No-op: middleware is skipped in the static-export native build.
}

export const config = {
  matcher: [], // empty → middleware is never invoked
}
