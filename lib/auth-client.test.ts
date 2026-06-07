import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the browser client module before importing the SUT.
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('./supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { getCurrentUserClient } from './auth-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCurrentUserClient', () => {
  it('returns null when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await getCurrentUserClient()
    expect(result).toBeNull()
  })

  it('returns null when the profile row is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } })
    mockSingle.mockResolvedValue({ data: null })
    const result = await getCurrentUserClient()
    expect(result).toBeNull()
  })

  it('maps the profile to an AppUser with stored initials', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'sam@hotel.com' } } })
    mockSingle.mockResolvedValue({
      data: {
        id: 'u1', full_name: 'Sam Doe', initials: 'SD',
        role: 'ANIMATION_CHIEF', hotel_id: 'h1', company_id: 'c1', team_id: 't1',
      },
    })
    const result = await getCurrentUserClient()
    expect(result).toEqual({
      id: 'u1', name: 'Sam Doe', initials: 'SD', role: 'ANIMATION_CHIEF',
      hotelId: 'h1', companyId: 'c1', teamId: 't1', email: 'sam@hotel.com',
    })
  })

  it('derives initials from the full name when not stored', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2', email: 'lee@hotel.com' } } })
    mockSingle.mockResolvedValue({
      data: {
        id: 'u2', full_name: 'Lee Park', initials: null,
        role: 'ANIMATOR', hotel_id: 'h2', company_id: 'c2', team_id: null,
      },
    })
    const result = await getCurrentUserClient()
    expect(result?.initials).toBe('LP')
    expect(result?.teamId).toBeUndefined()
  })
})
