// ─── AnimaPro — <html lang/dir> controller ───────────────────────────────────
//
// Keeps the document's `lang` and `dir` attributes in sync with the selected
// locale so RTL (Arabic) flips the whole layout and the Arabic web font applies
// via the [lang="ar"] CSS rule. Renders nothing; it only manages the <html>
// element. Mounted once in the root layout.

'use client'

import { useEffect } from 'react'
import { getLocale, subscribe } from '@/lib/i18n/store'
import { LOCALES } from '@/lib/i18n/locales'

export function DirController() {
  useEffect(() => {
    const apply = () => {
      const meta = LOCALES[getLocale()]
      const root = document.documentElement
      root.lang = meta.code
      root.dir = meta.dir
    }
    apply()
    return subscribe(apply)
  }, [])

  return null
}
