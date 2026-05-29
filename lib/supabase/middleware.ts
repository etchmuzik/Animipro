// ─── Animipro — Supabase session refresh (middleware helper) ─────────────────
//
// Supabase access tokens are short-lived. Without a refresh on each request,
// a user's session silently expires mid-use. This runs in Next middleware to
// refresh the token and rewrite the auth cookies on the response.
//
// It also does a light auth gate for /platform: unauthenticated users are
// bounced to /login. The /guest surface stays public (guests have no account).

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // If env isn't configured yet, don't crash the whole app — just pass through.
  if (!url || !anonKey) return response

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: getUser() (not getSession()) — it revalidates the token with the
  // Supabase auth server, which is what actually refreshes it.
  const { data: { user } } = await supabase.auth.getUser()

  // Auth gate: /platform requires a session. /guest, marketing, /login are open.
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/platform')
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', path)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
