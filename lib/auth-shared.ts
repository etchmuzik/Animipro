// ─── Animipro — Shared auth mapping ──────────────────────────────────────────
//
// The Supabase-profile → AppUser mapping, shared by the server resolver
// (lib/auth.ts, getCurrentUser) and the client resolver (lib/auth-client.ts,
// getCurrentUserClient) so the two can never drift. This module has NO
// 'use server'/'use client' directive and imports no SDK, so both sides can
// import it freely (and the native static export stays clean).

import type { AppUser } from '@/lib/roles'
import type { UserRole } from '@/lib/mock-data'

export interface AuthedUser extends AppUser {
  email: string
}

/** The columns both resolvers select from the `profiles` table. */
export interface ProfileRow {
  id: string
  full_name: string | null
  initials: string | null
  role: string
  hotel_id: string | null
  company_id: string | null
  team_id: string | null
}

/**
 * Resolve a user's initials. Prefers stored initials, then derives from the
 * full name (first letter of up to the first two words, uppercased), then the
 * email's first letter, then '?'. Null-safe: a null/empty full name never
 * throws (defensive — the DB enforces NOT NULL DEFAULT '').
 */
export function deriveInitials(
  stored: string | null,
  fullName: string | null | undefined,
  emailFallback: string | undefined,
): string {
  return (
    stored ||
    (fullName
      ?.split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '') ||
    (emailFallback?.[0]?.toUpperCase() ?? '?')
  )
}

/**
 * Map a `profiles` row (+ the auth email) to the app's AuthedUser shape.
 * Behavior is identical on server and client — both call this.
 */
export function mapProfileToAppUser(
  profile: ProfileRow,
  email: string | undefined,
): AuthedUser {
  return {
    id: profile.id,
    name: profile.full_name || (email ?? 'User'),
    initials: deriveInitials(profile.initials, profile.full_name, email),
    role: profile.role as UserRole,
    hotelId: profile.hotel_id ?? '',
    companyId: profile.company_id ?? '',
    teamId: profile.team_id ?? undefined,
    email: email ?? '',
  }
}
