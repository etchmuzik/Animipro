// ─── AnimaPro — Brand configuration (white-label) ────────────────────────────
//
// Single source of truth for everything a white-label buyer rebrands: app name,
// tagline, the primary brand colour, and contact details. The DEFAULTS reproduce
// today's AnimaPro identity so nothing changes visually out of the box.
//
// At runtime the brand-store overlays a buyer's choices on top of these defaults
// and writes the chosen colour into the theme's CSS custom properties, so the
// whole platform reskins live (see lib/brand-store.ts → applyBrand).

export interface BrandContact {
  whatsapp: string
  email: string
  offices: string
}

export interface BrandConfig {
  appName: string
  tagline: string
  /** Primary brand colour as a hex string (drives --primary / --ring / --brand-teal) */
  primaryHex: string
  contact: BrandContact
}

export const DEFAULT_BRAND: BrandConfig = {
  appName: 'AnimaPro',
  tagline: 'Resort Animation Management',
  primaryHex: '#0e7490', // the AnimaPro teal
  contact: {
    whatsapp: '+20 100 000 0000',
    email: 'sales@animapro.io',
    offices: 'Sharm El Sheikh & Hurghada',
  },
}

// Curated palette offered in the Settings → Appearance picker.
export const BRAND_PRESETS: { hex: string; name: string }[] = [
  { hex: '#0e7490', name: 'Teal' },
  { hex: '#7c3aed', name: 'Violet' },
  { hex: '#dc2626', name: 'Red' },
  { hex: '#16a34a', name: 'Green' },
  { hex: '#ea580c', name: 'Orange' },
  { hex: '#0284c7', name: 'Blue' },
  { hex: '#db2777', name: 'Pink' },
  { hex: '#ca8a04', name: 'Gold' },
]

// ─── Colour conversion ─────────────────────────────────────────────────────────
//
// The theme stores colours as space-separated HSL channels (e.g. "192 72% 32%")
// inside CSS custom properties, so a buyer's hex must be converted to that shape.

export interface Hsl {
  h: number
  s: number
  l: number
}

export function hexToHsl(hex: string): Hsl {
  // Guard against malformed/tampered values from storage — a NaN channel would
  // poison the CSS variables and silently break the whole theme.
  if (!/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) {
    return hexToHsl(DEFAULT_BRAND.primaryHex)
  }
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)); break
      case g: h = ((b - r) / delta + 2); break
      default: h = ((r - g) / delta + 4); break
    }
    h *= 60
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Format HSL as the "H S% L%" string the CSS variables expect. */
export function hslVar({ h, s, l }: Hsl): string {
  return `${h} ${s}% ${l}%`
}
