// ─── Animipro — Client auth guard (native build) ─────────────────────────────
//
// The native (static-export) build has no middleware to gate /platform. This
// component resolves the Supabase session in the browser, redirects to /login
// when absent, and renders its children once authenticated. A brief loading
// state avoids flashing the login screen for already-authed users.

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type GuardState = 'checking' | 'authed' | 'redirecting'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<GuardState>('checking')

  useEffect(() => {
    let active = true
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!active) return
        if (session) {
          setState('authed')
        } else {
          setState('redirecting')
          router.push('/login')
        }
      })
      .catch(() => {
        // Session check failed (e.g. network/token error). Fail safe: treat as
        // unauthenticated and send the user to login rather than hang on the spinner.
        if (!active) return
        setState('redirecting')
        router.push('/login')
      })
    return () => { active = false }
  }, [router])

  if (state === 'authed') return <>{children}</>

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
}
