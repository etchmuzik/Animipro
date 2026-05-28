// ─── Animipro — mobile-hygiene smoke test ─────────────────────────────────────
//
// Enforces rule #2 of MOBILE.md: every Tailwind grid declared with a wider
// breakpoint (`md:` / `lg:` / `xl:` / `2xl:`) must ALSO declare a mobile base
// on the same line. Without a base, the grid silently collapses to 1 column
// on mobile via Tailwind's default — which IS often fine, but the absence of
// an explicit base means nobody considered the mobile layout. This test
// forces the consideration. If you DID consider it and want 1-column on
// mobile, declare `grid-cols-1` explicitly.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['components', 'app']
const EXTENSIONS = new Set(['.tsx', '.jsx'])

// A grid declaration is offending if it contains a `md:`+ breakpoint
// `:grid-cols-N` AND does NOT contain a bare `grid-cols-N` (the mobile base).
// `sm:` (≥640px) is excluded — Tailwind's default at <640px is already
// 1-column, so `sm:grid-cols-2` correctly stays single-column on phone.
const WIDER_GRID = /\b(?:md|lg|xl|2xl):grid-cols-(?:\d+|\[)/
const BASE_GRID  = /(?<![:-])\bgrid-cols-(?:\d+|\[)/

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'out' || entry === 'tests') continue
      walk(full, acc)
    } else if (EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) {
      acc.push(full)
    }
  }
  return acc
}

describe('mobile hygiene — grid declarations have a mobile base', () => {
  const files = SCAN_DIRS.flatMap(d => walk(join(ROOT, d)))

  it('every md:/lg:/xl: grid-cols on a line also has a bare grid-cols on that line', () => {
    const offenders: { file: string; line: number; text: string }[] = []
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      src.split('\n').forEach((line, idx) => {
        if (WIDER_GRID.test(line) && !BASE_GRID.test(line)) {
          offenders.push({
            file: relative(ROOT, file),
            line: idx + 1,
            text: line.trim().slice(0, 160),
          })
        }
      })
    }

    if (offenders.length > 0) {
      const msg = offenders.map(o => `  ${o.file}:${o.line} — ${o.text}`).join('\n')
      throw new Error(
        `Found ${offenders.length} grid declaration(s) with no mobile base.\n` +
        `Add an explicit grid-cols-N before the md:/lg: variant. See MOBILE.md rule #2.\n${msg}`,
      )
    }
    expect(offenders).toEqual([])
  })
})
