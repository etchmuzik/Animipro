// ─── AnimaPro — Role & Permission System ─────────────────────────────────────

import type { UserRole } from './mock-data'

// ─── Role metadata ─────────────────────────────────────────────────────────

export interface RoleMeta {
  role: UserRole
  label: string
  description: string
  color: string        // Tailwind bg color token (arbitrary)
  textColor: string    // Tailwind text color token
  level: number        // 1 = highest authority
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full platform access. Manages all companies & hotels.',
    color: 'bg-rose-600',
    textColor: 'text-rose-600',
    level: 1,
  },
  HOTEL_ADMIN: {
    role: 'HOTEL_ADMIN',
    label: 'Hotel Admin',
    description: 'Hotel GM / HR. Full access within their hotel(s).',
    color: 'bg-violet-600',
    textColor: 'text-violet-600',
    level: 2,
  },
  ANIMATION_CHIEF: {
    role: 'ANIMATION_CHIEF',
    label: 'Animation Chief',
    description: 'Chef d\'animation. Manages all animation teams & schedules.',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    level: 3,
  },
  TEAM_LEADER: {
    role: 'TEAM_LEADER',
    label: 'Team Leader',
    description: 'Senior animator. Manages one team\'s schedule & assignments.',
    color: 'bg-teal-600',
    textColor: 'text-teal-600',
    level: 4,
  },
  ANIMATOR: {
    role: 'ANIMATOR',
    label: 'Animator',
    description: 'Regular animator. Views own schedule, submits leave.',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    level: 5,
  },
  ENTERTAINER: {
    role: 'ENTERTAINER',
    label: 'Entertainer',
    description: 'DJ, musician or performer. Views show schedule.',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    level: 5,
  },
  LIFEGUARD: {
    role: 'LIFEGUARD',
    label: 'Lifeguard',
    description: 'Pool & beach lifeguard. Views duty schedule.',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    level: 5,
  },
  KIDS_CLUB: {
    role: 'KIDS_CLUB',
    label: 'Kids Club',
    description: 'Mini club staff. Manages kids activities.',
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
    level: 5,
  },
}

// ─── Section permissions ────────────────────────────────────────────────────

export type Section =
  | 'dashboard'
  | 'team'
  | 'schedule'
  | 'activities'
  | 'assignments'
  | 'events'
  | 'announcements'
  | 'leave'
  | 'reports'
  | 'performance'
  | 'settings'

/**
 * Map each section to the minimum role level required to see it.
 * level 1 = SUPER_ADMIN (highest) … level 5 = ANIMATOR etc. (lowest)
 * ALL roles at or above (<=) the listed level can access.
 */
const SECTION_MIN_LEVEL: Record<Section, number> = {
  dashboard:     5, // everyone
  schedule:      5, // everyone sees their schedule
  announcements: 5, // everyone reads announcements
  leave:         5, // everyone can submit/view leave
  assignments:   5, // everyone sees their tasks
  activities:    4, // team leaders+
  events:        4, // team leaders+
  team:          3, // animation chief+
  reports:       3, // animation chief+
  performance:   3, // animation chief+
  settings:      2, // hotel admin+
}

export function canAccess(role: UserRole, section: Section): boolean {
  const userLevel = ROLE_META[role].level
  const required  = SECTION_MIN_LEVEL[section]
  return userLevel <= required
}

export function getAllowedSections(role: UserRole): Section[] {
  return (Object.keys(SECTION_MIN_LEVEL) as Section[]).filter(s => canAccess(role, s))
}

// ─── Permission flags ────────────────────────────────────────────────────────

export interface Permissions {
  canManageTeam:       boolean  // add/edit/remove animators
  canPublishSchedule:  boolean  // publish/archive schedules
  canApproveLeave:     boolean  // approve or reject leave requests
  canManageActivities: boolean  // create/edit activities
  canViewReports:      boolean  // access analytics & reports
  canReviewPerformance: boolean // submit performance reviews
  canManageEvents:     boolean  // create/edit events
  canPostAnnouncements: boolean // create announcements
  canSwitchHotel:      boolean  // switch between hotels in picker
  canManageAllHotels:  boolean  // super admin / company-level admin
  canEditSettings:     boolean  // hotel settings
  canAssignTasks:      boolean  // create & assign tasks
}

export function getPermissions(role: UserRole): Permissions {
  const level = ROLE_META[role].level
  return {
    canManageTeam:        level <= 3,
    canPublishSchedule:   level <= 3,
    canApproveLeave:      level <= 3,
    canManageActivities:  level <= 3,
    canViewReports:       level <= 3,
    canReviewPerformance: level <= 3,
    canManageEvents:      level <= 4,
    canPostAnnouncements: level <= 4,
    canSwitchHotel:       level <= 2,  // admin+ can switch hotels
    canManageAllHotels:   level <= 1,
    canEditSettings:      level <= 2,
    canAssignTasks:       level <= 4,
  }
}

/**
 * Field staff are the lowest-authority roles (level 5): the animators,
 * entertainers, lifeguards and kids-club staff who run activities. They see
 * only their OWN scheduled items, whereas managers (level <= 4) see everything.
 * Centralising this here keeps the rule correct when new field roles are added.
 */
export function isFieldStaff(role: UserRole): boolean {
  return ROLE_META[role].level >= 5
}

// ─── Simulated session users (one per role for demo) ─────────────────────────

export interface AppUser {
  id: string
  name: string
  initials: string
  role: UserRole
  hotelId: string    // primary hotel
  companyId: string
  teamId?: string    // for role = TEAM_LEADER, ANIMATOR etc.
  teamName?: string
}

export const DEMO_USERS: AppUser[] = [
  {
    id: 'su1',
    name: 'Platform Admin',
    initials: 'PA',
    role: 'SUPER_ADMIN',
    companyId: 'co1',
    hotelId: 'h1',
  },
  {
    id: 'su2',
    name: 'Hany Naguib',
    initials: 'HN',
    role: 'HOTEL_ADMIN',
    companyId: 'co1',
    hotelId: 'h1',
  },
  {
    id: 'su3',
    name: 'Youssef El-Sayed',
    initials: 'YE',
    role: 'ANIMATION_CHIEF',
    companyId: 'co1',
    hotelId: 'h1',
  },
  {
    id: 'su4',
    name: 'Marco Rossi',
    initials: 'MR',
    role: 'TEAM_LEADER',
    companyId: 'co1',
    hotelId: 'h1',
    teamId: 't1',
    teamName: 'Beach Squad',
  },
  {
    id: 'su5',
    name: 'Amira Hassan',
    initials: 'AH',
    role: 'ANIMATOR',
    companyId: 'co1',
    hotelId: 'h1',
    teamId: 't2',
    teamName: 'Pool Stars',
  },
  {
    id: 'su6',
    name: 'DJ Karim',
    initials: 'DK',
    role: 'ENTERTAINER',
    companyId: 'co1',
    hotelId: 'h1',
    teamId: 't3',
    teamName: 'Evening Shows',
  },
  {
    id: 'su7',
    name: 'Lena Fischer',
    initials: 'LF',
    role: 'KIDS_CLUB',
    companyId: 'co1',
    hotelId: 'h1',
    teamId: 't4',
    teamName: 'Mini Club',
  },
  {
    id: 'su8',
    name: 'Karim Mansour',
    initials: 'KM',
    role: 'LIFEGUARD',
    companyId: 'co1',
    hotelId: 'h1',
    teamId: 't2',
    teamName: 'Pool Stars',
  },
]
