// ─── Animipro — Platform entry (server component) ────────────────────────────
//
// Resolves the authenticated user server-side, then hands it to the client
// shell. This is the seam that turns "pick any role from a dropdown" into "you
// are who the database says you are."
//
// DEV/MIGRATION FALLBACK: while the Supabase backend is not yet configured
// (no NEXT_PUBLIC_SUPABASE_URL), we fall back to a demo user so the live demo
// keeps working mid-migration. Once env is set, real auth + the middleware gate
// take over and this fallback is never reached (middleware redirects to /login
// before this renders for an unauthenticated user).

import { PlatformShell } from './platform-shell'
import { getCurrentUser } from '@/lib/auth'
import { DEMO_USERS, type AppUser } from '@/lib/roles'
import { IS_NATIVE } from '@/lib/native'
import { PlatformNative } from './platform-native'

const SUPABASE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const DEMO_FALLBACK_USER: AppUser =
  DEMO_USERS.find(u => u.role === 'ANIMATION_CHIEF') ?? DEMO_USERS[0]

export default async function PlatformPage() {
  // Native (bundled) build: resolve the user client-side. No server work runs.
  if (IS_NATIVE) {
    return <PlatformNative />
  }

  // Real path: authenticated user from Supabase.
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    // Middleware already redirects unauthenticated users to /login, so `user`
    // is normally non-null here. Guard anyway.
    if (user) {
      return (
        <PlatformShell
          initialUser={user}
          canSwitchUser={user.role === 'SUPER_ADMIN'}
        />
      )
    }
  }

  // Migration fallback: backend not configured yet → keep the demo alive.
  return (
    <PlatformShell initialUser={DEMO_FALLBACK_USER} canSwitchUser />
  )
}
