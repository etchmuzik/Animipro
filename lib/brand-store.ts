// ─── Animipro — Brand store (localStorage-backed, white-label runtime) ────────
//
// Overlays a buyer's brand choices on top of DEFAULT_BRAND and applies the
// chosen primary colour to the live theme by rewriting the CSS custom properties
// the whole platform already reads (--primary, --ring, --brand-teal, etc.).
// Mirrors the lib/task-state.ts store pattern: SSR-safe, immutable, subscribe/
// emit + cross-tab sync. Changing the brand reskins the running app instantly.

'use client'

import { DEFAULT_BRAND, hexToHsl, hslVar, type BrandConfig } from './brand'

const STORAGE_KEY = 'animapro:brand:v1'

function read(): BrandConfig {
  if (typeof window === 'undefined') return DEFAULT_BRAND
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_BRAND
    const parsed = JSON.parse(raw)
    // Merge over defaults so a partial/older stored shape can't drop fields.
    return {
      ...DEFAULT_BRAND,
      ...parsed,
      contact: { ...DEFAULT_BRAND.contact, ...(parsed?.contact ?? {}) },
    }
  } catch {
    return DEFAULT_BRAND
  }
}

function write(config: BrandConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* quota — config is tiny */
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

// ─── Theme application ─────────────────────────────────────────────────────────

/**
 * Push the brand's primary colour into the CSS custom properties the platform
 * theme reads. Every component using `hsl(var(--primary))`, `--ring`, or
 * `--brand-teal` reskins immediately. Idempotent and safe to call on mount.
 */
export function applyBrand(config: BrandConfig = read()): void {
  if (typeof document === 'undefined') return
  const hsl = hslVar(hexToHsl(config.primaryHex))
  const root = document.documentElement
  root.style.setProperty('--primary', hsl)
  root.style.setProperty('--ring', hsl)
  root.style.setProperty('--brand-teal', hsl)
  root.style.setProperty('--sidebar-ring', hsl)
  root.style.setProperty('--chart-1', hsl)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getBrand(): BrandConfig {
  return read()
}

export function setBrand(patch: Partial<BrandConfig>): BrandConfig {
  const current = read()
  const next: BrandConfig = {
    ...current,
    ...patch,
    contact: { ...current.contact, ...(patch.contact ?? {}) },
  }
  write(next)
  applyBrand(next)
  return next
}

export function resetBrand(): BrandConfig {
  write(DEFAULT_BRAND)
  applyBrand(DEFAULT_BRAND)
  return DEFAULT_BRAND
}
