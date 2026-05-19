// Tests for lib/roles.ts authority helpers. isFieldStaff in particular gates
// whether the reminder banner restricts items to the current user, so it needs
// to stay correct as roles are added.

import { describe, it, expect } from 'vitest'
import { isFieldStaff, canAccess, getAllowedSections, getPermissions } from '@/lib/roles'
import type { UserRole } from '@/lib/mock-data'

describe('isFieldStaff', () => {
  const fieldRoles: UserRole[] = ['ANIMATOR', 'ENTERTAINER', 'LIFEGUARD', 'KIDS_CLUB']
  const managerRoles: UserRole[] = ['SUPER_ADMIN', 'HOTEL_ADMIN', 'ANIMATION_CHIEF', 'TEAM_LEADER']

  it.each(fieldRoles)('treats %s as field staff', role => {
    expect(isFieldStaff(role)).toBe(true)
  })

  it.each(managerRoles)('treats %s as a manager (not field staff)', role => {
    expect(isFieldStaff(role)).toBe(false)
  })
})

describe('canAccess (level-based gating)', () => {
  it('lets the lowest role into everyone-sections', () => {
    expect(canAccess('ANIMATOR', 'dashboard')).toBe(true)
    expect(canAccess('ANIMATOR', 'schedule')).toBe(true)
  })

  it('blocks the lowest role from manager-only sections', () => {
    expect(canAccess('ANIMATOR', 'team')).toBe(false)
    expect(canAccess('ANIMATOR', 'settings')).toBe(false)
  })

  it('lets the highest role into everything', () => {
    expect(canAccess('SUPER_ADMIN', 'settings')).toBe(true)
    expect(canAccess('SUPER_ADMIN', 'reports')).toBe(true)
  })
})

describe('getAllowedSections', () => {
  it('returns more sections for higher authority', () => {
    const animator = getAllowedSections('ANIMATOR')
    const admin = getAllowedSections('SUPER_ADMIN')
    expect(admin.length).toBeGreaterThan(animator.length)
    expect(animator).toContain('dashboard')
    expect(animator).not.toContain('settings')
  })
})

describe('getPermissions', () => {
  it('grants manager capabilities to the chief but not the animator', () => {
    expect(getPermissions('ANIMATION_CHIEF').canManageTeam).toBe(true)
    expect(getPermissions('ANIMATOR').canManageTeam).toBe(false)
  })

  it('reserves all-hotel management for the super admin', () => {
    expect(getPermissions('SUPER_ADMIN').canManageAllHotels).toBe(true)
    expect(getPermissions('HOTEL_ADMIN').canManageAllHotels).toBe(false)
  })
})
