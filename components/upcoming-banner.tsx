// ─── Animipro — In-app "upcoming activity" banner ───────────────────────────
//
// Renders a thin sticky banner near the top of the platform shell when the
// next reminder item is within the configured lead-time window. Tap-dismiss
// per-item via localStorage.
//
// Also acts as the bootstrap for the reminder scheduler: it computes the
// reminder set on mount (and whenever user/hotel/data changes) and registers
// the timers via lib/reminders.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, BellRing, X, MapPin, Loader2 } from 'lucide-react'
import {
  ASSIGNMENTS,
  EVENTS,
  SCHEDULE_ENTRIES,
  type Assignment,
  type EventItem,
  type ScheduleEntry,
} from '@/lib/mock-data'
import {
  assignmentsToReminderItems,
  eventsToReminderItems,
  getNextUpcoming,
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  scheduleReminders,
  scheduleToReminderItems,
  type ReminderItem,
} from '@/lib/reminders'
import { subscribe as subscribeTaskState } from '@/lib/task-state'
import { isFieldStaff, type AppUser } from '@/lib/roles'

const DISMISS_KEY = 'animapro:upcoming-dismissed:v1'
const PERMISSION_PROMPT_KEY = 'animapro:notif-prompt-shown:v1'

function readDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function writeDismissed(s: Set<string>): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(DISMISS_KEY, JSON.stringify([...s])) } catch { /* */ }
}

function fmtTimeLeft(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60_000))
  if (mins <= 0) return 'now'
  if (mins === 1) return '1 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function UpcomingBanner({ currentUser, hotelId }: { currentUser: AppUser; hotelId: string }) {
  const [now, setNow] = useState(() => Date.now())
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissed())
  const [, forceTaskTick] = useState(0)
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window === 'undefined' ? 'default' : notificationPermission())
  const [requesting, setRequesting] = useState(false)

  // Tick once a minute so "starts in 12 min" updates without re-mounting
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  // Re-render when task state changes (someone started a task — drop its reminder)
  useEffect(() => {
    return subscribeTaskState(() => forceTaskTick(n => n + 1))
  }, [])

  // Build the set of reminder items for THIS user at THIS hotel
  const items = useMemo<ReminderItem[]>(() => {
    const schedule: ScheduleEntry[]  = SCHEDULE_ENTRIES.filter(e => e.hotelId === hotelId)
    const assigns: Assignment[]      = ASSIGNMENTS.filter(a => a.hotelId === hotelId)
    const events: EventItem[]        = EVENTS.filter(e => e.hotelId === hotelId)
    // Field staff see only their own items; managers (level <= 4) see everything.
    const userId = isFieldStaff(currentUser.role) ? currentUser.id : undefined
    return [
      ...scheduleToReminderItems(schedule, userId),
      ...assignmentsToReminderItems(assigns, userId),
      ...eventsToReminderItems(events, userId),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, currentUser.role, hotelId])

  // Schedule timers whenever items, permission, or task state changes
  useEffect(() => {
    if (permission !== 'granted') return
    scheduleReminders(items)
    // Re-schedule when local task state changes so a freshly-started task drops its reminder
    return subscribeTaskState(() => scheduleReminders(items))
  }, [items, permission])

  // Auto-prompt for permission once per browser, after a short delay so the
  // animator can see what the app is first.
  useEffect(() => {
    if (!notificationsSupported()) return
    if (permission !== 'default') return
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(PERMISSION_PROMPT_KEY)) return
    const t = window.setTimeout(async () => {
      window.localStorage.setItem(PERMISSION_PROMPT_KEY, '1')
      setRequesting(true)
      const result = await requestNotificationPermission()
      setPermission(result)
      setRequesting(false)
    }, 4000)
    return () => window.clearTimeout(t)
  }, [permission])

  async function handleEnableClick(): Promise<void> {
    setRequesting(true)
    const result = await requestNotificationPermission()
    setPermission(result)
    setRequesting(false)
  }

  function handleDismiss(key: string): void {
    const next = new Set(dismissed)
    next.add(key)
    setDismissed(next)
    writeDismissed(next)
  }

  // Find the next non-dismissed upcoming item
  const next = getNextUpcoming(items)
  const nextKey = next ? `${next.kind}:${next.id}:${next.date}` : null
  const showBanner = next && nextKey && !dismissed.has(nextKey)

  // Show "enable notifications" prompt only when no banner is in the way
  const showPermissionPrompt = notificationsSupported() && permission === 'default' && !showBanner

  if (showBanner && next && nextKey) {
    const minsLeft = next.startsAt - now
    return (
      <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground text-xs font-semibold px-3 sm:px-4 py-2 shrink-0 flex items-center gap-2 sm:gap-3 border-b border-primary/30">
        <BellRing className="w-3.5 h-3.5 shrink-0 animate-pulse" />
        <span className="shrink-0">In {fmtTimeLeft(minsLeft)}:</span>
        <span className="truncate flex-1">
          <span className="font-bold">{next.title}</span>
          {next.venue && (
            <span className="ml-2 inline-flex items-center gap-0.5 opacity-90 font-normal">
              <MapPin className="w-2.5 h-2.5 inline" />
              {next.venue}
            </span>
          )}
        </span>
        <span className="hidden sm:inline opacity-80 font-normal">{next.startTime}</span>
        <button
          type="button"
          onClick={() => handleDismiss(nextKey)}
          className="shrink-0 w-5 h-5 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="Dismiss reminder"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  if (showPermissionPrompt) {
    return (
      <div className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-mini font-medium px-3 sm:px-4 py-1.5 shrink-0 flex items-center gap-2 border-b border-amber-500/20">
        <AlarmClock className="w-3 h-3 shrink-0" />
        <span className="flex-1 truncate">Enable activity reminders to get a notification before each shift.</span>
        <button
          type="button"
          onClick={handleEnableClick}
          disabled={requesting}
          className="shrink-0 px-2 py-0.5 rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors text-micro disabled:opacity-50 inline-flex items-center gap-1"
        >
          {requesting && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
          Enable
        </button>
      </div>
    )
  }

  return null
}
