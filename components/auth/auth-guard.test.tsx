import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockGetSession = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: { getSession: mockGetSession },
  }),
}))

import { AuthGuard } from './auth-guard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthGuard', () => {
  it('redirects to /login when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<AuthGuard><div>secret</div></AuthGuard>)
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when a session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    render(<AuthGuard><div>secret</div></AuthGuard>)
    await waitFor(() => expect(screen.getByText('secret')).toBeInTheDocument())
    expect(mockPush).not.toHaveBeenCalled()
  })
})
