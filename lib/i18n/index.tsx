// ─── AnimaPro — i18n hook + translator ───────────────────────────────────────
//
// Dependency-free i18n for a static-export app. `useTranslation()` reads the
// locale store, subscribes for live re-render on language change, and returns a
// `t(key, vars?)` that resolves a dot-path key (e.g. 'hero.titleAccent'),
// interpolates {placeholders}, and falls back to English then the raw key.

'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { getLocale, subscribe } from './store'
import { LOCALES, type Locale } from './locales'
import { en } from './messages/en'
import { ar } from './messages/ar'
import { ru } from './messages/ru'
import { it } from './messages/it'

const CATALOGS: Record<Locale, unknown> = { en, ar, ru, it }

type Vars = Record<string, string | number>

/** Resolve a dot-path against a catalog object; returns undefined if absent. */
function lookup(catalog: unknown, key: string): string | undefined {
  const parts = key.split('.')
  let node: unknown = catalog
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/** Translate a key for an explicit locale (used by both the hook and SSR). */
export function translate(locale: Locale, key: string, vars?: Vars): string {
  const hit = lookup(CATALOGS[locale], key) ?? lookup(CATALOGS.en, key)
  return hit !== undefined ? interpolate(hit, vars) : key
}

export interface Translation {
  t: (key: string, vars?: Vars) => string
  locale: Locale
  dir: 'ltr' | 'rtl'
}

/**
 * Reactive translation hook. Re-renders the calling component whenever the
 * locale changes (via useSyncExternalStore over the locale store).
 */
export function useTranslation(): Translation {
  const locale = useSyncExternalStore(subscribe, getLocale, () => 'en' as Locale)
  const t = useCallback(
    (key: string, vars?: Vars) => translate(locale, key, vars),
    [locale],
  )
  return { t, locale, dir: LOCALES[locale].dir }
}
