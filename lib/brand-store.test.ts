// Tests for the white-label brand store + hex→HSL conversion used to drive the
// theme's CSS variables.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBrand, setBrand, resetBrand, subscribe } from './brand-store'
import { DEFAULT_BRAND, hexToHsl, hslVar } from './brand'

const STORAGE_KEY = 'animapro:brand:v1'

beforeEach(() => {
  localStorage.clear()
})

describe('hexToHsl', () => {
  it('converts known hex values to HSL channels', () => {
    // #0e7490 (the Animipro teal) ≈ hsl(192, 82%, 31%)
    const teal = hexToHsl('#0e7490')
    expect(teal.h).toBeGreaterThanOrEqual(188)
    expect(teal.h).toBeLessThanOrEqual(196)
    expect(teal.s).toBeGreaterThan(50)

    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 100 })
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('supports 3-digit shorthand hex', () => {
    expect(hexToHsl('#fff')).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('formats HSL into the CSS-variable string shape', () => {
    expect(hslVar({ h: 192, s: 72, l: 32 })).toBe('192 72% 32%')
  })
})

describe('brand store', () => {
  it('returns the default brand when nothing is stored', () => {
    expect(getBrand()).toEqual(DEFAULT_BRAND)
  })

  it('persists a partial patch merged over defaults', () => {
    setBrand({ appName: 'SunClub' })
    const brand = getBrand()
    expect(brand.appName).toBe('SunClub')
    // Untouched fields keep their defaults.
    expect(brand.primaryHex).toBe(DEFAULT_BRAND.primaryHex)
    expect(brand.contact.email).toBe(DEFAULT_BRAND.contact.email)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('deep-merges nested contact patches', () => {
    setBrand({ contact: { ...getBrand().contact, whatsapp: '+20 111 222 3333' } })
    const brand = getBrand()
    expect(brand.contact.whatsapp).toBe('+20 111 222 3333')
    expect(brand.contact.email).toBe(DEFAULT_BRAND.contact.email)
  })

  it('resets back to the default brand', () => {
    setBrand({ appName: 'SunClub', primaryHex: '#dc2626' })
    resetBrand()
    expect(getBrand()).toEqual(DEFAULT_BRAND)
  })

  it('notifies subscribers on set and reset', () => {
    const listener = vi.fn()
    const unsub = subscribe(listener)
    setBrand({ appName: 'A' })
    resetBrand()
    expect(listener).toHaveBeenCalledTimes(2)
    unsub()
    setBrand({ appName: 'B' })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
