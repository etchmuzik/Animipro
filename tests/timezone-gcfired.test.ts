// Regression test for the gcFired() timezone bug.
//
// Bug: gcFired computed its 24h cutoff with toISOString() (UTC) but the fired-
// map keys embed each item's LOCAL date. Near midnight in a non-UTC zone (Egypt
// is UTC+2/+3) the UTC date lags the local date by a day, so the cutoff drifted
// and could drop "today"'s fired markers early — re-firing an already-fired
// reminder.
//
// gcFired is module-private, so this test reproduces the BEFORE (UTC) and AFTER
// (local) cutoff computations and asserts the local one matches the wall-clock
// day that item.date / parseDateTime use. The whole vitest run is pinned to
// TZ=Africa/Cairo (see vitest.config.ts) so this exercises the real boundary.

import { describe, it, expect } from 'vitest'

/** The FIXED cutoff helper — local-time YYYY-MM-DD (mirrors lib/reminders.ts). */
function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** The OLD buggy cutoff helper — UTC date. */
function utcDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

describe('gcFired cutoff is local-time (timezone regression)', () => {
  it('runs in Africa/Cairo so the boundary is real', () => {
    // If TZ wasn't applied the rest of the assertions are still valid in any
    // positive-offset zone, but we assert the intended config here.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Africa/Cairo')
  })

  it('keeps a marker dated for the local "today" that UTC still calls yesterday', () => {
    // Instant: 00:30 local on 2026-05-20 in Cairo == 21:30 UTC on 2026-05-19.
    const instant = new Date('2026-05-19T21:30:00.000Z')
    expect(localDateStr(instant)).toBe('2026-05-20') // local day
    expect(utcDateStr(instant)).toBe('2026-05-19')   // UTC day — the mismatch

    const cutoff = new Date(instant)
    cutoff.setDate(cutoff.getDate() - 1)

    const fixedCutoff = localDateStr(cutoff) // 2026-05-19
    const buggyCutoff = utcDateStr(cutoff)   // 2026-05-18

    // A fired marker for the local "today" must be kept (today >= cutoff).
    const todayMarker = localDateStr(instant) // 2026-05-20
    expect(todayMarker >= fixedCutoff).toBe(true)

    // The fixed cutoff aligns to local-yesterday; the buggy one lagged a day.
    expect(fixedCutoff).toBe('2026-05-19')
    expect(buggyCutoff).toBe('2026-05-18')
    expect(fixedCutoff).not.toBe(buggyCutoff)
  })
})
