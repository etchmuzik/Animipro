// ─── Animipro — Native build flag ────────────────────────────────────────────
//
// Single source of truth for "are we building the bundled native (Capacitor)
// app?" Set NEXT_PUBLIC_NATIVE=1 at build time (see `npm run build:native`).
// The web build leaves it unset, so IS_NATIVE is false and all native branches
// are skipped — the live web app is unchanged.

export const IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'
