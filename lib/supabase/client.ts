// ─── Animipro — Supabase browser client ──────────────────────────────────────
//
// For use in Client Components ('use client'). Reads the session from cookies
// the browser already holds. The anon key is safe to ship to the browser —
// Row-Level Security (see supabase/migrations/0003) is what actually protects
// the data, not key secrecy.
//
// Server code must NOT import this — use ./server.ts instead.

'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Singleton browser client. Reused across renders so we don't spin up a new
 * client (and a new auth listener) on every component mount.
 */
export function getSupabaseBrowserClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local and fill in your Supabase project keys.',
    )
  }

  client = createBrowserClient<Database>(url, anonKey)
  return client
}
