// ─── Animipro — Platform entry (native build) ────────────────────────────────
//
// Client twin of page.tsx's server path. Used only in the native (static-export)
// build. <AuthGuard> ensures a session exists; then we resolve the AppUser
// client-side and render the same PlatformShell the web build uses.

'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { PlatformShell } from './platform-shell'
import { getCurrentUserClient, type AuthedUser } from '@/lib/auth-client'

function PlatformNativeInner() {
  const [user, setUser] = useState<AuthedUser | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let active = true
    getCurrentUserClient().then((u) => {
      if (!active) return
      setUser(u)
      setResolved(true)
    })
    return () => { active = false }
  }, [])

  if (!resolved) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // AuthGuard guarantees a session, but the profile row could be missing.
  if (!user) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground p-6 text-center">
        <p className="text-13 text-muted-foreground">
          Your account has no profile yet. Contact your administrator.
        </p>
      </div>
    )
  }

  return (
    <PlatformShell
      initialUser={user}
      canSwitchUser={user.role === 'SUPER_ADMIN'}
    />
  )
}

export function PlatformNative() {
  return (
    <AuthGuard>
      <PlatformNativeInner />
    </AuthGuard>
  )
}
