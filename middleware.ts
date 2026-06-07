// ─── Animipro — Next.js middleware ───────────────────────────────────────────
// Refreshes the Supabase session on every matched request and gates /platform
// behind auth. Delegates to lib/supabase/middleware.ts.
//
// The native (static-export) build has no server, so middleware cannot run —
// the client <AuthGuard> performs the gate instead. For the native build,
// scripts/build-native.js replaces this file with middleware.native.ts (which
// exports an empty matcher) before calling `next build`, preventing Next from
// attempting to bundle middleware into the static export.

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Run on everything except static assets + image optimizer. This keeps the
  // session fresh app-wide while skipping files that never need auth.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
