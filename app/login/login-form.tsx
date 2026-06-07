// ─── Animipro — Login form (client) ──────────────────────────────────────────
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInClient } from './sign-in-client'

export function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = searchParams.get('next') ?? '/platform'

  const [error, setError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    // One client-side auth path for both web and native builds.
    // supabase.auth.signInWithPassword() (via signInClient) sets the session
    // cookie in the browser; on web, the middleware's updateSession() picks it
    // up on the next request, so server components still see the session. The
    // native (static-export) build has no server, so the client SDK is the only
    // option — unifying on it keeps a single code path and a static-export-safe
    // graph (no 'use server' modules).
    const result = await signInClient(email, password)
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(next)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-mini font-semibold uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@hotel.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-mini font-semibold uppercase tracking-wide text-muted-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-13 text-destructive font-medium" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-11 font-semibold">
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </span>
        ) : 'Sign in'}
      </Button>
    </form>
  )
}
