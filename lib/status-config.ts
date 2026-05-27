// ─── AnimaPro — canonical status → visual-tone map ─────────────────────────
//
// The audit found `STATUS_CONFIG` duplicated in 5 modules (schedule,
// assignments, events, announcements, leave), each maintaining its own
// near-identical mapping of business status → Tailwind colors. This file is
// the single source of truth.
//
// The visual side is six "kinds" that map onto the CSS `--status-*` tokens:
//   pending   → amber  (waiting for action)
//   progress  → blue   (active right now)
//   success   → green  (done)
//   danger    → red    (failed / rejected)
//   neutral   → slate  (off / cancelled)
//   info      → teal   (acknowledged but not active)
//
// `tone` is `'light' | 'dark'`. Light tone is for white surfaces (marketing,
// dashboard cards on a white bg). Dark tone is the translucent fill variant
// used on dark cards (the default platform shell).
//
// Each status maps to a (kind, label) pair. The component renders both.

import type {
  AssignmentStatus,
  AttendanceStatus,
  EventStatus,
  LeaveStatus,
} from './mock-data'

// ─── Visual kinds ──────────────────────────────────────────────────────────

export type StatusKind = 'pending' | 'progress' | 'success' | 'danger' | 'neutral' | 'info'
export type StatusTone = 'light' | 'dark'

export interface StatusVisual {
  kind: StatusKind
  label: string
}

// ─── Per-domain mappings ───────────────────────────────────────────────────
//
// Inline status strings (e.g. ScheduleEntry uses a literal union, not a named
// type) get their own map. Each declaration uses `Record<StatusName, …>` so
// adding a new state to the source type triggers a TypeScript error here.

export type ScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED'

const SCHEDULE_STATUS_MAP: Record<ScheduleStatus, StatusVisual> = {
  SCHEDULED:   { kind: 'pending',  label: 'Scheduled'   },
  IN_PROGRESS: { kind: 'progress', label: 'In progress' },
  COMPLETED:   { kind: 'success',  label: 'Completed'   },
  CANCELLED:   { kind: 'neutral',  label: 'Cancelled'   },
  MISSED:      { kind: 'danger',   label: 'Missed'      },
}

const ASSIGNMENT_STATUS_MAP: Record<AssignmentStatus, StatusVisual> = {
  PENDING:     { kind: 'pending',  label: 'Pending'     },
  ACCEPTED:    { kind: 'info',     label: 'Accepted'    },
  IN_PROGRESS: { kind: 'progress', label: 'In progress' },
  COMPLETED:   { kind: 'success',  label: 'Completed'   },
  CANCELLED:   { kind: 'neutral',  label: 'Cancelled'   },
  REJECTED:    { kind: 'danger',   label: 'Rejected'    },
}

const EVENT_STATUS_MAP: Record<EventStatus, StatusVisual> = {
  PLANNED:     { kind: 'pending',  label: 'Planned'     },
  CONFIRMED:   { kind: 'info',     label: 'Confirmed'   },
  IN_PROGRESS: { kind: 'progress', label: 'Live'        },
  COMPLETED:   { kind: 'success',  label: 'Completed'   },
  CANCELLED:   { kind: 'neutral',  label: 'Cancelled'   },
}

const LEAVE_STATUS_MAP: Record<LeaveStatus, StatusVisual> = {
  PENDING:   { kind: 'pending', label: 'Pending'   },
  APPROVED:  { kind: 'success', label: 'Approved'  },
  REJECTED:  { kind: 'danger',  label: 'Rejected'  },
  CANCELLED: { kind: 'neutral', label: 'Cancelled' },
}

const ATTENDANCE_STATUS_MAP: Record<AttendanceStatus, StatusVisual> = {
  PRESENT:  { kind: 'success', label: 'Present'  },
  ABSENT:   { kind: 'danger',  label: 'Absent'   },
  LATE:     { kind: 'pending', label: 'Late'     },
  EXCUSED:  { kind: 'info',    label: 'Excused'  },
  HALF_DAY: { kind: 'neutral', label: 'Half day' },
}

// ─── Lookup helpers ────────────────────────────────────────────────────────

export type StatusDomain = 'schedule' | 'assignment' | 'event' | 'leave' | 'attendance'

/**
 * Resolve a domain-specific status string into its visual kind + display label.
 * Falls back to `neutral` + the raw status if the value isn't recognized — this
 * lets the UI keep rendering when mock data has a typo or a new status hasn't
 * been mapped yet.
 */
export function getStatusVisual(domain: StatusDomain, status: string): StatusVisual {
  const map = STATUS_MAPS[domain] as Record<string, StatusVisual | undefined>
  return map[status] ?? { kind: 'neutral', label: status }
}

const STATUS_MAPS = {
  schedule:   SCHEDULE_STATUS_MAP,
  assignment: ASSIGNMENT_STATUS_MAP,
  event:      EVENT_STATUS_MAP,
  leave:      LEAVE_STATUS_MAP,
  attendance: ATTENDANCE_STATUS_MAP,
} as const

/** Resolve from a tagged status object (used by the StatusBadge convenience prop). */
export interface DomainStatus {
  domain: StatusDomain
  value: string
}
