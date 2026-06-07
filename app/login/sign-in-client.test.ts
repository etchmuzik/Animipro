import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}))

import { signInClient, signOutClient } from './sign-in-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signInClient', () => {
  it('rejects an invalid email before calling Supabase', async () => {
    const result = await signInClient('not-an-email', 'secret123')
    expect(result.error).toBeTruthy()
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('rejects a too-short password before calling Supabase', async () => {
    const result = await signInClient('a@b.com', '123')
    expect(result.error).toBeTruthy()
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('returns a generic error when credentials are wrong', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const result = await signInClient('a@b.com', 'secret123')
    expect(result.error).toBe('Wrong email or password.')
  })

  it('returns success (no error) on valid sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const result = await signInClient('a@b.com', 'secret123')
    expect(result.error).toBeUndefined()
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' })
  })
})

describe('signOutClient', () => {
  it('calls supabase signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    await signOutClient()
    expect(mockSignOut).toHaveBeenCalled()
  })
})
