// Tests for the guest-feedback store: seeding, immutable add with clamping,
// per-activity filtering, the average summary, and subscribe/emit.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFeedback,
  getFeedbackForActivity,
  addFeedback,
  getFeedbackSummary,
  subscribe,
  type NewFeedbackInput,
} from './feedback'

const STORAGE_KEY = 'animapro:feedback:v1'

function makeInput(overrides: Partial<NewFeedbackInput> = {}): NewFeedbackInput {
  return {
    activityId: 'a1',
    activityName: 'Aqua Gym',
    rating: 5,
    comment: 'Great!',
    guestName: 'Test Guest',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('seeding', () => {
  it('seeds feedback on first read of an empty store', () => {
    expect(getFeedback().length).toBeGreaterThan(0)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })
})

describe('addFeedback', () => {
  it('prepends an entry with id, timestamp and clamped rating', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addFeedback(makeInput({ rating: 9 }))
    expect(created.id).toMatch(/^fb-/)
    expect(created.rating).toBe(5) // clamped to max
    expect(created.createdAt).toBeTypeOf('string')
    expect(getFeedback()[0].id).toBe(created.id)
  })

  it('clamps a too-low rating up to 1 and truncates long comments', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addFeedback(makeInput({ rating: 0, comment: 'x'.repeat(900) }))
    expect(created.rating).toBe(1)
    expect(created.comment.length).toBeLessThanOrEqual(500)
  })
})

describe('getFeedbackForActivity', () => {
  it('filters by activity id', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    addFeedback(makeInput({ activityId: 'a1' }))
    addFeedback(makeInput({ activityId: 'a2' }))
    expect(getFeedbackForActivity('a1')).toHaveLength(1)
    expect(getFeedbackForActivity('a2')).toHaveLength(1)
    expect(getFeedbackForActivity('nope')).toHaveLength(0)
  })
})

describe('getFeedbackSummary', () => {
  it('returns zero average for an empty store', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    expect(getFeedbackSummary()).toEqual({ count: 0, average: 0 })
  })

  it('averages ratings to one decimal', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    addFeedback(makeInput({ rating: 5 }))
    addFeedback(makeInput({ rating: 4 }))
    addFeedback(makeInput({ rating: 4 }))
    const summary = getFeedbackSummary()
    expect(summary.count).toBe(3)
    expect(summary.average).toBeCloseTo(4.3, 1)
  })
})

describe('subscribe / emit', () => {
  it('notifies on add and stops after unsubscribe', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const listener = vi.fn()
    const unsub = subscribe(listener)
    addFeedback(makeInput())
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
    addFeedback(makeInput())
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
