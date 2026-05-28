// ─── Animipro — Guest-facing currency switcher ──────────────────────────────
//
// Prices in the system are always stored in EGP (base currency). On the guest
// surface we let the visitor choose to see prices in EGP / USD / EUR. The
// choice persists in localStorage so it survives reloads and the buy flow.
//
// The rate table is a static mock — this is a demo with no FX feed. To swap
// for a live API later, replace `RATES` with a fetched object that lands here
// on mount and re-emits.

'use client'

export type Currency = 'EGP' | 'USD' | 'EUR'

export const CURRENCIES: Currency[] = ['EGP', 'USD', 'EUR']

const STORAGE_KEY = 'animipro.guestCurrency.v1'
const DEFAULT_CURRENCY: Currency = 'EGP'

// 1 EGP → other. Mock rates for the demo — replace with live FX if needed.
const RATES: Record<Currency, number> = {
  EGP: 1,
  USD: 0.020,   // ~50 EGP per USD
  EUR: 0.019,   // ~52 EGP per EUR
}

// Step values for "nice rounding" by currency so $20 looks better than $19.84.
const ROUND_STEP: Record<Currency, number> = {
  EGP: 1,
  USD: 1,
  EUR: 1,
}

const SYMBOL: Record<Currency, string> = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€',
}

// ─── Conversion + formatting ───────────────────────────────────────────────

export function convertFromEgp(amountEgp: number, currency: Currency): number {
  const raw = amountEgp * RATES[currency]
  const step = ROUND_STEP[currency]
  return Math.round(raw / step) * step
}

/** Returns "1,500 EGP" or "$30" or "€28". */
export function formatPrice(amountEgp: number, currency: Currency): string {
  const value = convertFromEgp(amountEgp, currency)
  const fmt = new Intl.NumberFormat('en', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
  return currency === 'EGP' ? `${fmt} EGP` : `${SYMBOL[currency]}${fmt}`
}

/** Just the number with no symbol — for layouts that pair number + currency. */
export function formatPriceNumber(amountEgp: number, currency: Currency): string {
  const value = convertFromEgp(amountEgp, currency)
  return new Intl.NumberFormat('en', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
}

export function getCurrencySymbol(currency: Currency): string {
  return SYMBOL[currency]
}

// ─── Persisted store (localStorage + subscribe) ────────────────────────────

const subscribers = new Set<() => void>()

function readStored(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && (CURRENCIES as readonly string[]).includes(raw)) return raw as Currency
  } catch {
    // localStorage may throw in private-mode / disabled scenarios
  }
  return DEFAULT_CURRENCY
}

let current: Currency = readStored()

export function getCurrency(): Currency {
  return current
}

export function setCurrency(next: Currency): void {
  if (next === current) return
  current = next
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }
  subscribers.forEach(fn => { fn() })
}

export function subscribe(fn: () => void): () => void {
  subscribers.add(fn)
  return () => { subscribers.delete(fn) }
}

// Cross-tab sync: a write in another tab fires `storage`, refresh from it.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return
    const next = readStored()
    if (next !== current) {
      current = next
      subscribers.forEach(fn => { fn() })
    }
  })
}
