// ─── Animipro — Auth resolution (client-side) ────────────────────────────────
//
// Browser-SDK twin of lib/auth.ts's getCurrentUser(). Used by the native
// (bundled) build, which has no server to read cookies. Reads the session the
// browser already holds and maps the Supabase profile → AppUser, identically to
// the server resolver so PlatformShell behaves the same in both builds.

'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { mapProfileToAppUser, type AuthedUser } from '@/lib/auth-shared'

// Re-exported for existing importers; the canonical definition lives in
// lib/auth-shared.ts (shared with the server resolver).
export type { AuthedUser }

export async function getCurrentUserClient(): Promise<AuthedUser | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, initials, role, hotel_id, company_id, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return mapProfileToAppUser(profile, user.email)
}
