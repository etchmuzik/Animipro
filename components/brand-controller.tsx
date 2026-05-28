// ─── Animipro — Brand theme applier ──────────────────────────────────────────
//
// Applies the stored white-label brand colour to the CSS custom properties on
// mount and whenever it changes, so a saved brand survives reloads and stays in
// sync across tabs. Renders nothing.

'use client'

import { useEffect } from 'react'
import { applyBrand, subscribe } from '@/lib/brand-store'

export function BrandController() {
  useEffect(() => {
    applyBrand()
    return subscribe(() => applyBrand())
  }, [])

  return null
}
