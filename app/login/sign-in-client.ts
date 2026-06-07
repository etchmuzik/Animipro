// ─── Animipro — Client auth ──────────────────────────────────────────────────
//
// The single auth path for both web and native builds. Uses the Supabase
// browser SDK to sign in/out client-side, which keeps the module graph
// static-export-safe (no 'use server' modules — required for the native
// Capacitor build). Zod-validates inputs and returns a generic error;
// navigation is left to the caller.

'use client'

import { z } from 'zod'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const credsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export interface ClientAuthResult {
  error?: string
}

export async function signInClient(email: string, password: string): Promise<ClientAuthResult> {
  const parsed = credsSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Don't leak whether the email exists — generic message.
    return { error: 'Wrong email or password.' }
  }

  return {}
}

export async function signOutClient(): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  await supabase.auth.signOut()
}
