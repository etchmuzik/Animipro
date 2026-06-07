// ─── Animipro — Auth resolution (client-side) ────────────────────────────────
//
// Browser-SDK twin of lib/auth.ts's getCurrentUser(). Used by the native
// (bundled) build, which has no server to read cookies. Reads the session the
// browser already holds and maps the Supabase profile → AppUser, identically to
// the server resolver so PlatformShell behaves the same in both builds.

'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AppUser } from '@/lib/roles'
import type { UserRole } from '@/lib/mock-data'

export interface AuthedUser extends AppUser {
  email: string
}

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

  // Derive initials if the profile didn't store them.
  const initials =
    profile.initials ||
    profile.full_name
      .split(' ')
      .map((p: string) => p[0])
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
