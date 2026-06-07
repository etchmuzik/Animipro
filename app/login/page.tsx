// ─── Animipro — Login page ───────────────────────────────────────────────────
// Server component shell; the form is a client child (useActionState). Invite-
// only product, so there's no public signup link — staff get accounts from an
// admin. Email + password to start.

import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = {
  title: 'Sign in — Animipro',
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Brand panel — hidden on mobile */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-teal-800)/0.9)] via-[hsl(var(--brand-teal)/0.78)] to-[hsl(var(--brand-navy-elev1)/0.9)] mix-blend-multiply" />
        <Link href="/" className="relative font-display font-extrabold text-xl tracking-tight text-white">
          Animipro
        </Link>
        <div className="relative text-white">
          <h2 className="font-display text-3xl font-extrabold leading-tight max-w-sm">
            Run the show. Watch the reviews climb.
          </h2>
          <p className="mt-3 text-white/80 max-w-sm text-sm">
            The operations platform for Egyptian resort animation teams.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Link href="/" className="font-display font-extrabold text-lg tracking-tight">Animipro</Link>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back. Enter your details to access your hotel.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-tiny text-muted-foreground text-center">
            No account? Your hotel admin invites you. Contact them, or{' '}
            <Link href="/" className="text-primary hover:underline">reach our team</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
