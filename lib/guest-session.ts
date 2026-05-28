// ─── Animipro — Guest session id (client-only) ────────────────────────────────
//
// Tags every ticket a guest buys with an opaque per-device id so the "My
// tickets" view can filter the shared sales store down to "tickets I bought
// from this browser". There is no server, no auth — just a UUID written to
// localStorage on first visit.
//
// The sellerUserId field of a guest sale becomes `guest:<sessionId>` (see
// components/guest/buy-sheet.tsx). The staff sales-panel + door scanner
// continue to work unchanged because they don't care about that prefix.

const STORAGE_KEY = 'animapro:guest-session:v1'

/** Lazily generated UUID. SSR-safe — returns empty string off the client. */
export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing && existing.length > 0) return existing
    const id = makeId()
    window.localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    // localStorage blocked (private mode, etc.) — fall back to an ephemeral id.
    // Tickets bought in this state won't be filterable on next visit, but the
    // purchase itself still succeeds.
    return makeId()
  }
}

/** Stable seller user-id used in sellTicket() for guest self-purchases. */
export function guestSellerUserId(): string {
  const sid = getGuestSessionId()
  return sid ? `guest:${sid}` : 'guest:anon'
}

/** True if a sellerUserId was written by the guest-self-purchase flow. */
export function isGuestSale(sellerUserId: string): boolean {
  return sellerUserId.startsWith('guest:')
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
