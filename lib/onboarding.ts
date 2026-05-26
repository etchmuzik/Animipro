// ─── AnimaPro — Onboarding checklist store (localStorage-backed) ─────────────
//
// Bridges Recruitment → Team: once an application is ACCEPTED, the new hire gets
// an onboarding checklist (contract, uniform, training, system access, added to
// team). State is keyed by the application id. Mirrors lib/task-state.ts: SSR-
// safe, immutable, subscribe/emit + cross-tab sync.

'use client'

export type OnboardingStepId =
  | 'contract'
  | 'uniform'
  | 'training'
  | 'systemAccess'
  | 'addedToTeam'

export const ONBOARDING_STEPS: { id: OnboardingStepId; label: string }[] = [
  { id: 'contract',     label: 'Contract signed' },
  { id: 'uniform',      label: 'Uniform issued' },
  { id: 'training',     label: 'Induction training booked' },
  { id: 'systemAccess', label: 'System access granted' },
  { id: 'addedToTeam',  label: 'Added to a team' },
]

/** Per-hire checklist: which step ids are done. Keyed by application id. */
export type OnboardingState = Partial<Record<OnboardingStepId, boolean>>

type Store = Record<string, OnboardingState>

const STORAGE_KEY = 'animapro:onboarding:v1'

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
    /* quota */
  }
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

export function getOnboarding(applicationId: string): OnboardingState {
  return read()[applicationId] ?? {}
}

export function toggleOnboardingStep(applicationId: string, step: OnboardingStepId): OnboardingState {
  const store = read()
  const current = store[applicationId] ?? {}
  const updated: OnboardingState = { ...current, [step]: !current[step] }
  write({ ...store, [applicationId]: updated })
  return updated
}

export function setOnboardingStep(
  applicationId: string,
  step: OnboardingStepId,
  done: boolean,
): OnboardingState {
  const store = read()
  const current = store[applicationId] ?? {}
  const updated: OnboardingState = { ...current, [step]: done }
  write({ ...store, [applicationId]: updated })
  return updated
}

/** Completed step count + total, for a progress indicator. */
export function getOnboardingProgress(applicationId: string): { done: number; total: number } {
  const state = getOnboarding(applicationId)
  const done = ONBOARDING_STEPS.filter(s => state[s.id]).length
  return { done, total: ONBOARDING_STEPS.length }
}
