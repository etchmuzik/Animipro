// ─── Animipro — Login form (client) ──────────────────────────────────────────
'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn, type AuthActionState } from './actions'

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/platform'
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signIn,
    {},
  )

  return (
    <form action={formAction} className="space-y-4">
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

      {state.error && (
        <p className="text-13 text-destructive font-medium" role="alert">
          {state.error}
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
