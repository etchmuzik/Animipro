// ─── Animipro — Guest layout (per-hotel) ───────────────────────────────────────
//
// Wrapper that hosts the guest experience for one hotel. Deliberately minimal:
// no platform Sidebar, no role/user switcher, no admin chrome. The layout file
// stays a pure pass-through — the topbar lives inside GuestShell so the hotel
// name is local state of the client tree (not duplicated here).

import type { ReactNode } from 'react'

export default function GuestLayout({ children }: { children: ReactNode }): React.ReactElement {
  return <>{children}</>
}
