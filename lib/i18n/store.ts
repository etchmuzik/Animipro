// ─── AnimaPro — Locale store (localStorage-backed) ───────────────────────────
//
// Holds the currently selected UI language. Mirrors the lib/task-state.ts
// pattern: SSR-safe, immutable, with a subscribe()/emit() pub-sub so every
// consumer (the chrome, the marketing page, the <html dir> controller) re-reads
// after a change, and cross-tab sync via the `storage` event.
//
// We keep locale in localStorage rather than the URL because the app is a static
// export (output: 'export') with no locale routing — a client store is the
// idiomatic fit and matches every other piece of state in this codebase.

'use client'

import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

const STORAGE_KEY = 'animapro:locale:v1'

function read(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw && isLocale(raw) ? raw : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

function write(locale: Locale): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* quota — a 2-char value never trips this */
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

export function getLocale(): Locale {
  return read()
}

export function setLocale(locale: Locale): void {
  write(locale)
}
