import { describe, it, expect } from 'vitest'
import { deriveInitials, mapProfileToAppUser } from './auth-shared'

describe('deriveInitials', () => {
  it('uses stored initials when present', () => {
    expect(deriveInitials('SD', 'Sam Doe', 'sam@hotel.com')).toBe('SD')
  })

  it('derives from the full name when no stored initials', () => {
    expect(deriveInitials(null, 'Lee Park', 'lee@hotel.com')).toBe('LP')
  })

  it('takes at most the first two name parts', () => {
    expect(deriveInitials('', 'Mary Jane Watson', 'mj@hotel.com')).toBe('MJ')
  })

  it('uppercases derived initials', () => {
    expect(deriveInitials(null, 'ana bekele', 'a@b.com')).toBe('AB')
  })

  it('falls back to the email initial when full name is empty', () => {
    expect(deriveInitials('', '', 'omar@hotel.com')).toBe('O')
  })

  it('falls back to the email initial when full name is null', () => {
    expect(deriveInitials(null, null, 'nadia@hotel.com')).toBe('N')
  })

  it('does not throw when full name is null (defensive)', () => {
    expect(() => deriveInitials(null, null, undefined)).not.toThrow()
  })

  it("returns '?' when there is no name and no email", () => {
    expect(deriveInitials(null, null, undefined)).toBe('?')
    expect(deriveInitials('', '', '')).toBe('?')
  })
})

describe('mapProfileToAppUser', () => {
  const fullProfile = {
    id: 'u1',
    full_name: 'Sam Doe',
    initials: 'SD',
    role: 'ANIMATION_CHIEF',
    hotel_id: 'h1',
    company_id: 'c1',
    team_id: 't1',
  }

  it('maps a complete profile to an AuthedUser', () => {
    expect(mapProfileToAppUser(fullProfile, 'sam@hotel.com')).toEqual({
      id: 'u1',
      name: 'Sam Doe',
      initials: 'SD',
      role: 'ANIMATION_CHIEF',
      hotelId: 'h1',
      companyId: 'c1',
      teamId: 't1',
      email: 'sam@hotel.com',
    })
  })

  it('derives initials and normalizes nulls', () => {
    const result = mapProfileToAppUser(
      {
        id: 'u2',
        full_name: 'Lee Park',
        initials: null,
        role: 'ANIMATOR',
        hotel_id: null,
        company_id: null,
        team_id: null,
      },
      'lee@hotel.com',
    )
    expect(result.initials).toBe('LP')
    expect(result.hotelId).toBe('')
    expect(result.companyId).toBe('')
    expect(result.teamId).toBeUndefined()
    expect(result.email).toBe('lee@hotel.com')
  })

  it('falls back name to email then "User" when full_name is empty', () => {
    expect(mapProfileToAppUser({ ...fullProfile, full_name: '' }, 'x@y.com').name).toBe('x@y.com')
    expect(mapProfileToAppUser({ ...fullProfile, full_name: '' }, undefined).name).toBe('User')
  })

  it('normalizes a missing email to an empty string', () => {
    expect(mapProfileToAppUser(fullProfile, undefined).email).toBe('')
  })
})
