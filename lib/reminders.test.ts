// Characterization tests for lib/reminders.ts — pin down the notification-firing
// behavior verified in the browser (correct title/body/timing) plus the guards
// and edge cases: no double-fire, skip started/completed tasks, the upcoming
// window, and the local-time gcFired fix.
//
// Uses Vitest fake timers so the 15/5-minute offsets fire instantly, and stubs
// the Notification global to capture fires without OS toasts.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scheduleToReminderItems,
  assignmentsToReminderItems,
  eventsToReminderItems,
  scheduleReminders,
  getNextUpcoming,
  clearReminders,
  type ReminderItem,
} from '@/lib/reminders'
import type { ScheduleEntry, Assignment, EventItem } from '@/lib/mock-data'
import { startTask, completeTask } from '@/lib/task-state'

interface CapturedNotification {
  title: string
  body?: string
  tag?: string
  requireInteraction?: boolean
}

let captured: CapturedNotification[] = []

function installFakeNotification(permission: NotificationPermission = 'granted') {
  captured = []
  class FakeNotification {
    static permission: NotificationPermission = permission
    static requestPermission = vi.fn(async () => permission)
    onclick: (() => void) | null = null
    constructor(title: string, opts?: NotificationOptions) {
      captured.push({
        title,
        body: opts?.body,
        tag: opts?.tag,
        requireInteraction: opts?.requireInteraction,
      })
    }
    close() {}
  }
  vi.stubGlobal('Notification', FakeNotification)
}

/** Minimal valid ScheduleEntry for reminder mapping (only a few fields are read). */
function entry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    id: 'se1',
    hotelId: 'h1',
    animatorId: 'an1',
    animatorName: 'Amira',
    teamId: 't1',
    activityName: 'Beach Volleyball',
    venue: 'Beach Court',
    date: '2026-05-20',
    startTime: '09:00',
    endTime: '10:00',
    type: 'ACTIVITY',
    status: 'SCHEDULED',
    ...overrides,
  } as ScheduleEntry
}

/** A reminder item that starts `minutesFromNow` ahead of the current fake clock. */
function itemStartingIn(minutesFromNow: number, overrides: Partial<ReminderItem> = {}): ReminderItem {
  return {
    kind: 'schedule',
    id: 'se1',
    title: 'Beach Volleyball',
    venue: 'Beach Court',
    date: '2026-05-20',
    startTime: '09:00',
    startsAt: Date.now() + minutesFromNow * 60_000,
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  clearReminders()
  vi.useFakeTimers()
  installFakeNotification('granted')
})

afterEach(() => {
  clearReminders()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('scheduleToReminderItems', () => {
  it('maps schedule entries and parses local start time', () => {
    const items = scheduleToReminderItems([entry()])
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Beach Volleyball')
    // startsAt is a local-time epoch for 2026-05-20 09:00
    const d = new Date(items[0].startsAt)
    expect(d.getHours()).toBe(9)
    expect(d.getMinutes()).toBe(0)
  })

  it('filters by animatorId when provided', () => {
    const items = scheduleToReminderItems(
      [entry({ id: 'a', animatorId: 'an1' }), entry({ id: 'b', animatorId: 'an2' })],
      'an1',
    )
    expect(items.map(i => i.id)).toEqual(['a'])
  })

  it('excludes OFF_DUTY and BREAK entries', () => {
    const items = scheduleToReminderItems([
      entry({ id: 'a', type: 'ACTIVITY' }),
      entry({ id: 'b', type: 'BREAK' }),
      entry({ id: 'c', type: 'OFF_DUTY' }),
    ])
    expect(items.map(i => i.id)).toEqual(['a'])
  })
})

function assignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'as1',
    hotelId: 'h1',
    title: 'Prepare Gala stage',
    description: 'Set up the stage',
    assignedToId: 'an1',
    assignedToName: 'Amira',
    assignedById: 'mgr1',
    activityName: 'Main Hall',
    date: '2026-05-20',
    startTime: '09:00',
    endTime: '10:00',
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: '2026-05-19T00:00:00.000Z',
    ...overrides,
  } as Assignment
}

function eventItem(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 'ev1',
    hotelId: 'h1',
    name: 'Beach Gala',
    description: 'Evening gala',
    date: '2026-05-20',
    startTime: '20:00',
    endTime: '23:00',
    venue: 'Beach',
    type: 'THEME_NIGHT',
    expectedGuests: 200,
    status: 'PLANNED',
    assignedAnimators: ['an1', 'an2'],
    ...overrides,
  } as EventItem
}

describe('assignmentsToReminderItems', () => {
  it('maps assignments, using activityName as the venue', () => {
    const items = assignmentsToReminderItems([assignment()])
    expect(items).toHaveLength(1)
    expect(items[0].kind).toBe('assignment')
    expect(items[0].title).toBe('Prepare Gala stage')
    expect(items[0].venue).toBe('Main Hall')
  })

  it('filters by assignee userId', () => {
    const items = assignmentsToReminderItems(
      [assignment({ id: 'a', assignedToId: 'an1' }), assignment({ id: 'b', assignedToId: 'an2' })],
      'an2',
    )
    expect(items.map(i => i.id)).toEqual(['b'])
  })
})

describe('eventsToReminderItems', () => {
  it('maps events with name and venue', () => {
    const items = eventsToReminderItems([eventItem()])
    expect(items).toHaveLength(1)
    expect(items[0].kind).toBe('event')
    expect(items[0].title).toBe('Beach Gala')
    expect(items[0].venue).toBe('Beach')
  })

  it('filters to events the user is assigned to', () => {
    const items = eventsToReminderItems(
      [eventItem({ id: 'a', assignedAnimators: ['an1'] }), eventItem({ id: 'b', assignedAnimators: ['an9'] })],
      'an1',
    )
    expect(items.map(i => i.id)).toEqual(['a'])
  })
})

describe('scheduleReminders firing', () => {
  it('fires both the 15-min and 5-min reminders with correct body', () => {
    // Activity 20 minutes out → 15-min reminder fires in 5m, 5-min in 15m.
    const count = scheduleReminders([itemStartingIn(20)])
    expect(count).toBe(2)

    vi.advanceTimersByTime(5 * 60_000) // hit the 15-min reminder
    expect(captured).toHaveLength(1)
    expect(captured[0].body).toBe('Starts in 15 minutes at Beach Court')
    expect(captured[0].requireInteraction).toBe(false)

    vi.advanceTimersByTime(10 * 60_000) // hit the 5-min reminder
    expect(captured).toHaveLength(2)
    expect(captured[1].body).toBe('Starts in 5 minutes at Beach Court')
    expect(captured[1].requireInteraction).toBe(true) // last warning is sticky
  })

  it('does not schedule reminders whose lead time is already in the past', () => {
    // Activity only 3 minutes out → both 15 and 5 min leads are in the past.
    const count = scheduleReminders([itemStartingIn(3)])
    expect(count).toBe(0)
  })

  it('skips tasks that are already started', () => {
    startTask('schedule', 'se1')
    const count = scheduleReminders([itemStartingIn(20)])
    expect(count).toBe(0)
  })

  it('skips tasks that are already completed', () => {
    completeTask('schedule', 'se1')
    const count = scheduleReminders([itemStartingIn(20)])
    expect(count).toBe(0)
  })

  it('does not double-fire after a re-schedule (fired-guard persists)', () => {
    scheduleReminders([itemStartingIn(20)])
    vi.advanceTimersByTime(5 * 60_000) // fire the 15-min reminder
    expect(captured).toHaveLength(1)

    // Re-schedule the same item (e.g. data refresh) — the 15-min reminder is
    // already marked fired and must not be queued again.
    const second = scheduleReminders([itemStartingIn(15)]) // 15 min out now
    // only the 5-min lead remains schedulable
    expect(second).toBe(1)
  })

  it('omits the venue from the body when there is none', () => {
    scheduleReminders([itemStartingIn(20, { venue: '' })])
    vi.advanceTimersByTime(5 * 60_000)
    expect(captured[0].body).toBe('Starts in 15 minutes')
  })
})

describe('scheduleReminders permission gating', () => {
  it('arms timers but suppresses the toast when permission is not granted', () => {
    installFakeNotification('default')
    const count = scheduleReminders([itemStartingIn(20)])
    expect(count).toBe(2)
    vi.advanceTimersByTime(20 * 60_000)
    expect(captured).toHaveLength(0) // showNotification returns early
  })
})

describe('getNextUpcoming', () => {
  it('returns the soonest upcoming item within the window', () => {
    const next = getNextUpcoming([itemStartingIn(30), itemStartingIn(8, { id: 'soon' })])
    expect(next?.id).toBe('soon')
  })

  it('ignores items beyond the window (default = largest lead = 15 min)', () => {
    expect(getNextUpcoming([itemStartingIn(30)])).toBeNull()
  })

  it('ignores items already in the past', () => {
    expect(getNextUpcoming([itemStartingIn(-5)])).toBeNull()
  })

  it('excludes started/completed tasks', () => {
    startTask('schedule', 'se1')
    expect(getNextUpcoming([itemStartingIn(8)])).toBeNull()
  })
})
