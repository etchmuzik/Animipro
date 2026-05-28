// ─── Animipro — Animator task state (localStorage-backed) ────────────────────
//
// Persists per-task runtime state (started_at, completed_at, list of proof
// media references) for the three actionable card types in the app:
//   - 'schedule'    → a ScheduleEntry the animator is responsible for
//   - 'assignment'  → an Assignment task assigned to the animator
//   - 'event'       → an EventItem the animator is on the crew for
//
// The mock-data layer remains immutable; this file layers per-user runtime
// state on top of it. Media blobs themselves live in IndexedDB (see
// lib/media-store.ts) and we store only their record IDs here so the JSON
// envelope stays tiny.

'use client'

export type TaskKind = 'schedule' | 'assignment' | 'event'

export interface ProofRef {
  /** IndexedDB record ID returned by mediaStore.saveBlob() */
  mediaId: string
  /** MIME type — used to decide whether to render an <img> or a <video> */
  mime: string
  /** Original filename (best-effort) */
  name: string
  /** Bytes (so the card can show "2.4 MB" without re-opening the blob) */
  size: number
  /** ISO timestamp the proof was attached */
  uploadedAt: string
}

export interface TaskState {
  startedAt?: string   // ISO
  completedAt?: string // ISO
  proofs: ProofRef[]
}

const STORAGE_KEY = 'animapro:task-state:v1'

type Store = Record<string, TaskState>

function makeKey(kind: TaskKind, id: string): string {
  return `${kind}:${id}`
}

function read(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function write(store: Store): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage full — proofs would never trip this since we only store IDs
  }
  // Notify same-tab listeners (storage event only fires cross-tab)
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
  // Also listen to cross-tab changes so multiple PWA windows stay in sync
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

export function getTaskState(kind: TaskKind, id: string): TaskState {
  const key = makeKey(kind, id)
  const entry = read()[key]
  return entry ?? { proofs: [] }
}

export function startTask(kind: TaskKind, id: string): TaskState {
  const store = read()
  const key = makeKey(kind, id)
  const current = store[key] ?? { proofs: [] }
  // Idempotent — never overwrite an existing startedAt
  if (current.startedAt) return current
  const updated: TaskState = { ...current, startedAt: new Date().toISOString() }
  store[key] = updated
  write(store)
  return updated
}

export function completeTask(kind: TaskKind, id: string): TaskState {
  const store = read()
  const key = makeKey(kind, id)
  const current = store[key] ?? { proofs: [] }
  // Auto-start if the animator skipped Start and tapped Complete directly
  const startedAt = current.startedAt ?? new Date().toISOString()
  const updated: TaskState = { ...current, startedAt, completedAt: new Date().toISOString() }
  store[key] = updated
  write(store)
  return updated
}

export function resetTask(kind: TaskKind, id: string): TaskState {
  const store = read()
  const key = makeKey(kind, id)
  const proofs = store[key]?.proofs ?? []
  // Reset only timestamps — keep proofs (deleting media is a separate action)
  const updated: TaskState = { proofs }
  store[key] = updated
  write(store)
  return updated
}

export function addProof(kind: TaskKind, id: string, proof: ProofRef): TaskState {
  const store = read()
  const key = makeKey(kind, id)
  const current = store[key] ?? { proofs: [] }
  const updated: TaskState = { ...current, proofs: [...current.proofs, proof] }
  store[key] = updated
  write(store)
  return updated
}

export function removeProof(kind: TaskKind, id: string, mediaId: string): TaskState {
  const store = read()
  const key = makeKey(kind, id)
  const current = store[key] ?? { proofs: [] }
  const updated: TaskState = { ...current, proofs: current.proofs.filter(p => p.mediaId !== mediaId) }
  store[key] = updated
  write(store)
  return updated
}

/**
 * Compute the "effective" status of a card by overlaying our local state on
 * top of the mock data's original status. Local IN_PROGRESS / COMPLETED win.
 */
export function effectiveStatus<T extends string>(
  kind: TaskKind,
  id: string,
  originalStatus: T,
): T | 'IN_PROGRESS' | 'COMPLETED' {
  const state = getTaskState(kind, id)
  if (state.completedAt) return 'COMPLETED'
  if (state.startedAt)   return 'IN_PROGRESS'
  return originalStatus
}
