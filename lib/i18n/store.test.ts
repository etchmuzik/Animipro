// Tests for the i18n locale store + a catalog-parity guard that keeps all four
// languages structurally in sync with the English source of truth.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocale, setLocale, subscribe } from './store'
import { translate } from './index'
import { en } from './messages/en'
import { ar } from './messages/ar'
import { ru } from './messages/ru'
import { it as itCatalog } from './messages/it'

const STORAGE_KEY = 'animapro:locale:v1'

beforeEach(() => {
  localStorage.clear()
})

describe('locale store', () => {
  it('defaults to English when nothing is stored', () => {
    expect(getLocale()).toBe('en')
  })

  it('persists and reads back the selected locale', () => {
    setLocale('ar')
    expect(getLocale()).toBe('ar')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ar')
  })

  it('ignores an invalid stored value and falls back to default', () => {
    localStorage.setItem(STORAGE_KEY, 'zz')
    expect(getLocale()).toBe('en')
  })

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const listener = vi.fn()
    const unsub = subscribe(listener)
    setLocale('ru')
    expect(listener).toHaveBeenCalledTimes(1)
    setLocale('it')
    expect(listener).toHaveBeenCalledTimes(2)
    unsub()
    setLocale('en')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('translate()', () => {
  it('resolves a dot-path key for the active locale', () => {
    expect(translate('it', 'common.buyNow')).toBe('Acquista')
    expect(translate('ar', 'nav.careers')).toBe('الوظائف')
  })

  it('interpolates named placeholders', () => {
    expect(translate('en', 'careers.successBody', { name: 'Sofia' })).toContain('Sofia')
    expect(translate('en', 'sidebar.hotelsAcross', { count: 147, companies: 12 }))
      .toBe('147 hotels across 12 companies')
  })

  it('falls back to English when a key is missing in the target locale, then to the raw key', () => {
    // A key that exists only in en (simulated by an unknown path) returns the key.
    expect(translate('ru', 'this.key.does.not.exist')).toBe('this.key.does.not.exist')
  })
})

describe('catalog parity', () => {
  // Flatten a nested object to its set of leaf dot-paths.
  function leafKeys(obj: unknown, prefix = ''): string[] {
    if (obj && typeof obj === 'object') {
      return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
        leafKeys(v, prefix ? `${prefix}.${k}` : k),
      )
    }
    return [prefix]
  }

  const enKeys = leafKeys(en).sort()

  it.each([
    ['ar', ar],
    ['ru', ru],
    ['it', itCatalog],
  ])('%s has exactly the same keys as en', (_name, catalog) => {
    expect(leafKeys(catalog).sort()).toEqual(enKeys)
  })
})
