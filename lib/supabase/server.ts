// ─── Animipro — Supabase server client ───────────────────────────────────────
//
// For Server Components, Route Handlers, and Server Actions. Unlike the browser
// client, the server has no ambient cookies — we wire Next's cookie store in so
// Supabase can read the session and refresh it.
//
// Two flavors:
//   • createServerClient()  — RLS-scoped to the logged-in user (default; safe).
//   • createServiceClient() — bypasses RLS via the service-role key. ONLY for
//     trusted server-side operations (ticket inserts, payment reconciliation,
//     scans). NEVER import into client code; the key is server-only.

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

/** RLS-scoped client bound to the current request's auth cookie. */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // setAll throws in Server Components (read-only cookies). The
          // middleware refresh path handles writing; safe to ignore here.
        }
      },
    },
  })
}

/**
 * Service-role client — bypasses Row-Level Security. Use ONLY in trusted server
 * code that must act across tenants or write rows clients can't (ticket sales,
 * payment webhooks, door scans). The service key must never reach the browser.
 */
export function getSupabaseServiceClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase keys.`,
    )
  }
  return value
}
