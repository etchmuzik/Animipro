// ─── Animipro — Auth server actions ──────────────────────────────────────────
'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const credsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  next: z.string().optional(),
})

export interface AuthActionState {
  error?: string
}

/** Email + password sign-in. On success, redirects to `next` (or /platform). */
export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Don't leak whether the email exists — generic message.
    return { error: 'Wrong email or password.' }
  }

  redirect(parsed.data.next || '/platform')
}

/** Sign out and return to the marketing home. */
export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
