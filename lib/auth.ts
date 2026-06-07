// ─── Animipro — Auth resolution (server-side) ────────────────────────────────
//
// Bridges Supabase Auth → the app's AppUser shape (lib/roles.ts). The platform
// shell already speaks AppUser, so resolving the authenticated user into that
// shape means the shell barely changes — we just feed it a real user instead of
// a DEMO_USERS pick.

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { mapProfileToAppUser, type AuthedUser } from '@/lib/auth-shared'

// Re-exported for existing importers; the canonical definition lives in
// lib/auth-shared.ts (shared with the client resolver).
export type { AuthedUser }

/**
 * Returns the authenticated user as an AppUser, or null if not signed in.
 * Reads the profile row (role, hotel, company, name) created by the signup
 * trigger. Call from Server Components / Route Handlers.
 */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = await getSupabaseServerClient()

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
