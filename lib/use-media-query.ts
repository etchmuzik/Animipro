// ─── AnimaPro — useMediaQuery hook ────────────────────────────────────────────
//
// SSR-safe matchMedia subscription. Returns `false` during SSR/initial render
// (the conservative default — "we don't know yet, assume narrow/mobile") and
// then settles to the real value on mount.
//
// Used to drive runtime values that CSS media queries can't reach — e.g.
// Recharts margin objects, or whether <details> should be open by default.

'use client'

import { useEffect, useState } from 'react'

const MQ_LISTENERS = new WeakMap<MediaQueryList, Set<(matches: boolean) => void>>()

function subscribe(mql: MediaQueryList, cb: (matches: boolean) => void): () => void {
  // Pooling subscribers per MediaQueryList lets multiple components reuse one
  // listener — small but adds up when the dashboard mounts ~6 hook calls.
  let set = MQ_LISTENERS.get(mql)
  if (!set) {
    set = new Set()
    MQ_LISTENERS.set(mql, set)
    mql.addEventListener('change', e => set!.forEach(fn => fn(e.matches)))
  }
  set.add(cb)
  return () => { set!.delete(cb) }
}

export function useMediaQuery(query: string): boolean {
  // false during SSR + first paint — components should render their MOBILE
  // layout first, then opt into a wider treatment after mount. That matches
  // the mobile-first standard.
  const [matches, setMatches] = useState<boolean>(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    return subscribe(mql, setMatches)
  }, [query])
  return matches
}

/** Common breakpoint — `md` in Tailwind is ≥ 768px. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}
