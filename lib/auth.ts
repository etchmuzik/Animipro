// ─── Animipro — Auth resolution (server-side) ────────────────────────────────
//
// Bridges Supabase Auth → the app's AppUser shape (lib/roles.ts). The platform
// shell already speaks AppUser, so resolving the authenticated user into that
// shape means the shell barely changes — we just feed it a real user instead of
// a DEMO_USERS pick.

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { AppUser } from '@/lib/roles'
import type { UserRole } from '@/lib/mock-data'

export interface AuthedUser extends AppUser {
  email: string
}

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

  // Derive initials if the profile didn't store them.
  const initials =
    profile.initials ||
    profile.full_name
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    (user.email?.[0]?.toUpperCase() ?? '?')

  return {
    id: profile.id,
    name: profile.full_name || (user.email ?? 'User'),
    initials,
    role: profile.role as UserRole,
    hotelId: profile.hotel_id ?? '',
    companyId: profile.company_id ?? '',
    teamId: profile.team_id ?? undefined,
    email: user.email ?? '',
  }
}
