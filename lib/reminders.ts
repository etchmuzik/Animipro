// ─── Animipro — Reminder scheduling ─────────────────────────────────────────
//
// Schedules browser notifications X minutes before each upcoming activity.
//
// IMPLEMENTATION NOTE: Because this app is a static-export Next.js site with
// no backend, we rely on CLIENT-SIDE setTimeout-based scheduling. This means
// reminders only fire while the PWA / browser tab is running. When the user
// installs the PWA on their phone home screen and keeps it open in the
// background, modern browsers (Android Chrome, iOS 16.4+ Safari) will keep
// the notifications firing for some time. For true offline reminders we'd
// need a server-side cron + web-push subscription — out of scope for v1.
//
// The intent is "5 + 15 minute warning while the animator is on shift" which
// the in-tab setTimeout approach handles well.

'use client'

import type { ScheduleEntry, Assignment, EventItem } from './mock-data'
import { getTaskState } from './task-state'

const REMINDER_MINUTES_DEFAULT = [15, 5] as const

const FIRED_KEY = 'animapro:reminders-fired:v1'
const SETTINGS_KEY = 'animapro:reminder-settings:v1'

// ─── Permission ──────────────────────────────────────────────────────────────

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface ReminderSettings {
  /** Minutes-before to fire. Sorted descending so the earlier reminder fires first. */
  leadMinutes: number[]
}

export function getReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') return { leadMinutes: [...REMINDER_MINUTES_DEFAULT] }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { leadMinutes: [...REMINDER_MINUTES_DEFAULT] }
    const parsed = JSON.parse(raw) as ReminderSettings
    if (!Array.isArray(parsed.leadMinutes) || parsed.leadMinutes.length === 0) {
      return { leadMinutes: [...REMINDER_MINUTES_DEFAULT] }
    }
    return { leadMinutes: parsed.leadMinutes.slice().sort((a, b) => b - a) }
  } catch {
    return { leadMinutes: [...REMINDER_MINUTES_DEFAULT] }
  }
}

export function setReminderSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// ─── Fired tracker ───────────────────────────────────────────────────────────
//
// We persist which reminders have already fired today so that re-mounting the
// scheduler (page navigation, reload) doesn't double-fire notifications.

interface FiredMap { [key: string]: true }

function readFired(): FiredMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(FIRED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeFired(map: FiredMap): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FIRED_KEY, JSON.stringify(map))
  } catch { /* swallow */ }
}

function firedKey(kind: string, id: string, leadMinutes: number, date: string): string {
  return `${kind}:${id}:${leadMinutes}:${date}`
}

/**
 * Format a Date as a local-time YYYY-MM-DD string. The fired-map keys embed the
 * item's local `date` field (see parseDateTime), so the GC cutoff must also be
 * computed in local time — using toISOString() here would compare a local date
 * against a UTC date and, near midnight in non-UTC zones (e.g. Egypt UTC+2/+3),
 * could drop today's fired markers early and re-fire a reminder.
 */
function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Drop fired entries older than 24h to keep the map from growing forever. */
function gcFired(): void {
  const map = readFired()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 1)
  const cutoffStr = localDateStr(cutoff)
  const next: FiredMap = {}
  for (const k of Object.keys(map)) {
    const date = k.split(':')[3]
    if (date && date >= cutoffStr) next[k] = true
  }
  writeFired(next)
}

// ─── Reminder items ──────────────────────────────────────────────────────────

export interface ReminderItem {
  kind: 'schedule' | 'assignment' | 'event'
  id: string
  title: string
  venue: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:MM
  /** ms epoch */
  startsAt: number
}

function parseDateTime(date: string, time: string): number {
  // Build a local-time Date so notifications align with the animator's wall clock.
  // Format expected: date "2026-05-20", time "09:00".
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0).getTime()
}

export function scheduleToReminderItems(entries: ScheduleEntry[], animatorId?: string): ReminderItem[] {
  return entries
    .filter(e => !animatorId || e.animatorId === animatorId)
    .filter(e => e.type !== 'OFF_DUTY' && e.type !== 'BREAK')
    .map(e => ({
      kind: 'schedule' as const,
      id: e.id,
      title: e.activityName ?? e.type,
      venue: e.venue,
      date: e.date,
      startTime: e.startTime,
      startsAt: parseDateTime(e.date, e.startTime),
    }))
}

export function assignmentsToReminderItems(items: Assignment[], userId?: string): ReminderItem[] {
  return items
    .filter(a => !userId || a.assignedToId === userId)
    .map(a => ({
      kind: 'assignment' as const,
      id: a.id,
      title: a.title,
      venue: a.activityName ?? '',
      date: a.date,
      startTime: a.startTime,
      startsAt: parseDateTime(a.date, a.startTime),
    }))
}

export function eventsToReminderItems(events: EventItem[], userId?: string): ReminderItem[] {
  return events
    .filter(e => !userId || e.assignedAnimators.includes(userId))
    .map(e => ({
      kind: 'event' as const,
      id: e.id,
      title: e.name,
      venue: e.venue,
      date: e.date,
      startTime: e.startTime,
      startsAt: parseDateTime(e.date, e.startTime),
    }))
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

let activeTimers: ReturnType<typeof setTimeout>[] = []

/** Cancel any pending timers. Safe to call repeatedly. */
export function clearReminders(): void {
  for (const t of activeTimers) clearTimeout(t)
  activeTimers = []
}

/**
 * Schedule notifications for the given items. Replaces any previously
 * scheduled timers so it's safe to call after data changes.
 *
 * Returns the number of timers actually scheduled (i.e. in the future and
 * not already fired today).
 */
export function scheduleReminders(items: ReminderItem[]): number {
  clearReminders()
  gcFired()

  const settings = getReminderSettings()
  const now = Date.now()
  const fired = readFired()
  let scheduled = 0

  for (const item of items) {
    // Skip already-started or completed tasks — no need to remind.
    const state = getTaskState(item.kind, item.id)
    if (state.startedAt || state.completedAt) continue

    for (const lead of settings.leadMinutes) {
      const fireAt = item.startsAt - lead * 60_000
      if (fireAt <= now) continue                    // already in the past
      if (fireAt - now > 12 * 60 * 60_000) continue  // too far out — re-schedule on next mount

      const key = firedKey(item.kind, item.id, lead, item.date)
      if (fired[key]) continue

      const timer = setTimeout(() => {
        showNotification(item, lead)
        const map = readFired()
        map[key] = true
        writeFired(map)
      }, fireAt - now)

      activeTimers.push(timer)
      scheduled++
    }
  }

  return scheduled
}

function showNotification(item: ReminderItem, leadMinutes: number): void {
  if (notificationPermission() !== 'granted') return

  const minsLabel = leadMinutes === 1 ? '1 minute' : `${leadMinutes} minutes`
  const body = item.venue
    ? `Starts in ${minsLabel} at ${item.venue}`
    : `Starts in ${minsLabel}`

  try {
    const n = new Notification(item.title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `${item.kind}:${item.id}:${leadMinutes}`,
      requireInteraction: leadMinutes <= 5, // last warning is sticky
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* ignore: some browsers throw if the page is hidden — service worker
       handles that case but our static export doesn't push a custom SW. */
  }
}

// ─── Upcoming window helper (for in-app banner) ──────────────────────────────

/**
 * Returns the next reminder item whose start time is within `windowMinutes`
 * (defaults to the largest configured lead time). Null if nothing is upcoming.
 *
 * Excludes items already started or completed.
 */
export function getNextUpcoming(items: ReminderItem[], windowMinutes?: number): ReminderItem | null {
  const settings = getReminderSettings()
  const win = windowMinutes ?? Math.max(...settings.leadMinutes)
  const now = Date.now()
  const cutoff = now + win * 60_000
  const candidates = items.filter(it => {
    const state = getTaskState(it.kind, it.id)
    if (state.startedAt || state.completedAt) return false
    return it.startsAt > now && it.startsAt <= cutoff
  })
  candidates.sort((a, b) => a.startsAt - b.startsAt)
  return candidates[0] ?? null
}
