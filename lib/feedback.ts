// ─── AnimaPro — Guest feedback store (localStorage-backed) ───────────────────
//
// Lets guests leave a 1-5 star rating + optional comment on an activity. Drives
// an average-satisfaction figure on the dashboard, reinforcing the platform's
// "lift your TripAdvisor score" value proposition. Mirrors lib/task-state.ts:
// SSR-safe, immutable, subscribe/emit + cross-tab sync.

'use client'

export interface FeedbackEntry {
  id: string
  /** Activity (or schedule entry) the feedback is about */
  activityId: string
  activityName: string
  rating: number      // 1-5
  comment: string
  guestName: string
  createdAt: string   // ISO
}

export type NewFeedbackInput = Omit<FeedbackEntry, 'id' | 'createdAt'>

const STORAGE_KEY = 'animapro:feedback:v1'

const SEED_FEEDBACK: FeedbackEntry[] = [
  { id: 'fb-seed-1', activityId: 'a1', activityName: 'Aqua Gym',     rating: 5, comment: 'Amira was amazing, so much energy!', guestName: 'Hans M.',   createdAt: '2026-05-21T10:30:00.000Z' },
  { id: 'fb-seed-2', activityId: 'a2', activityName: 'Kids Disco',   rating: 5, comment: 'My kids did not want to leave.',     guestName: 'Olga P.',   createdAt: '2026-05-21T18:05:00.000Z' },
  { id: 'fb-seed-3', activityId: 'a3', activityName: 'Beach Volleyball', rating: 4, comment: 'Great fun, would join again.',  guestName: 'Marco T.',  createdAt: '2026-05-20T16:20:00.000Z' },
  { id: 'fb-seed-4', activityId: 'a4', activityName: 'Evening Show', rating: 5, comment: 'Best animation team on the Red Sea.', guestName: 'Sophie L.', createdAt: '2026-05-20T21:40:00.000Z' },
  { id: 'fb-seed-5', activityId: 'a1', activityName: 'Aqua Gym',     rating: 4, comment: 'Good workout by the pool.',          guestName: 'Dmitri V.', createdAt: '2026-05-19T11:00:00.000Z' },
]

function read(): FeedbackEntry[] {
  if (typeof window === 'undefined') return [...SEED_FEEDBACK]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      writeRaw(SEED_FEEDBACK)
      return SEED_FEEDBACK
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : []
  } catch {
    return []
  }
}

function writeRaw(list: FeedbackEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* quota */
  }
}

function write(list: FeedbackEntry[]): void {
  writeRaw(list)
  emit()
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

type Listener = () => void
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) {
    try { l() } catch { /* swallow */ }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY) listener()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `fb-${crypto.randomUUID()}`
  return `fb-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function clampRating(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)))
}

export function getFeedback(): FeedbackEntry[] {
  return read()
}

export function getFeedbackForActivity(activityId: string): FeedbackEntry[] {
  return read().filter(f => f.activityId === activityId)
}

export function addFeedback(input: NewFeedbackInput): FeedbackEntry {
  const entry: FeedbackEntry = {
    ...input,
    rating: clampRating(input.rating),
    comment: input.comment.slice(0, 500),
    guestName: input.guestName.slice(0, 120) || 'Guest',
    activityName: input.activityName.slice(0, 120),
    id: makeId(),
    createdAt: new Date().toISOString(),
  }
  write([entry, ...read()])
  return entry
}

export interface FeedbackSummary {
  count: number
  average: number // 0 when no feedback, else 1 decimal
}

export function getFeedbackSummary(): FeedbackSummary {
  const list = read()
  if (list.length === 0) return { count: 0, average: 0 }
  const sum = list.reduce((acc, f) => acc + f.rating, 0)
  return { count: list.length, average: Math.round((sum / list.length) * 10) / 10 }
}
