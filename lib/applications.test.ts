// Characterization tests for lib/applications.ts — pin down the hiring inbox
// behavior: seed initialization on an empty store, immutable add/status/remove
// mutations, the stats roll-up, persistence across reads, and the subscribe/emit
// notification path. Mirrors the structure of lib/task-state.test.ts.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getApplications,
  addApplication,
  setApplicationStatus,
  removeApplication,
  getApplicationStats,
  subscribe,
  EMAIL_PATTERN,
  type NewApplicationInput,
} from '@/lib/applications'

const STORAGE_KEY = 'animapro:applications:v1'

function makeInput(overrides: Partial<NewApplicationInput> = {}): NewApplicationInput {
  return {
    firstName: 'Test',
    lastName: 'Candidate',
    email: 'test.candidate@example.com',
    phone: '+20 100 000 0000',
    nationality: 'Egyptian',
    role: 'ANIMATOR',
    languages: ['English'],
    specialties: ['Dance'],
    yearsExperience: 2,
    pitch: 'Ready to work the best summer.',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('seed initialization', () => {
  it('seeds the inbox on first read of an empty store', () => {
    const apps = getApplications()
    expect(apps.length).toBeGreaterThan(0)
    // The seed is written through so it survives the next read.
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('does not re-seed once a store exists (even if emptied to [])', () => {
    getApplications() // triggers seed
    // Simulate the admin rejecting/removing everything down to an empty list.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    expect(getApplications()).toEqual([])
  })
})

describe('addApplication', () => {
  it('prepends a new application with a generated id, NEW status and timestamp', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addApplication(makeInput({ firstName: 'Sofia' }))

    expect(created.id).toMatch(/^app-/)
    expect(created.status).toBe('NEW')
    expect(created.submittedAt).toBeTypeOf('string')

    const list = getApplications()
    expect(list[0].id).toBe(created.id) // newest first
    expect(list[0].firstName).toBe('Sofia')
  })

  it('persists across a fresh read (reload survival)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addApplication(makeInput())
    const reread = getApplications().find(a => a.id === created.id)
    expect(reread).toBeDefined()
    expect(reread?.email).toBe('test.candidate@example.com')
  })

  it('carries an optional CV media reference through', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addApplication(makeInput({ cvMediaId: 'media-123', cvName: 'cv.pdf', cvMime: 'application/pdf' }))
    expect(created.cvMediaId).toBe('media-123')
    expect(getApplications()[0].cvName).toBe('cv.pdf')
  })
})

describe('setApplicationStatus', () => {
  it('moves a single application along the pipeline immutably', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const a = addApplication(makeInput({ firstName: 'A' }))
    const b = addApplication(makeInput({ firstName: 'B' }))

    setApplicationStatus(a.id, 'ACCEPTED')
    const list = getApplications()

    expect(list.find(x => x.id === a.id)?.status).toBe('ACCEPTED')
    // Untouched application keeps its status.
    expect(list.find(x => x.id === b.id)?.status).toBe('NEW')
  })

  it('is a no-op for an unknown id', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    addApplication(makeInput())
    const before = getApplications()
    setApplicationStatus('does-not-exist', 'REJECTED')
    expect(getApplications()).toHaveLength(before.length)
  })
})

describe('removeApplication', () => {
  it('removes an application by id', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const a = addApplication(makeInput({ firstName: 'A' }))
    const b = addApplication(makeInput({ firstName: 'B' }))

    removeApplication(a.id)
    const list = getApplications()
    expect(list.find(x => x.id === a.id)).toBeUndefined()
    expect(list.find(x => x.id === b.id)).toBeDefined()
  })
})

describe('getApplicationStats', () => {
  it('rolls up counts by status', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const a = addApplication(makeInput())
    const b = addApplication(makeInput())
    const c = addApplication(makeInput())
    setApplicationStatus(a.id, 'ACCEPTED')
    setApplicationStatus(b.id, 'SHORTLISTED')
    // c stays NEW

    const stats = getApplicationStats()
    expect(stats.total).toBe(3)
    expect(stats.accepted).toBe(1)
    expect(stats.shortlisted).toBe(1)
    expect(stats.new).toBe(1)
    expect(stats.rejected).toBe(0)
  })
})

describe('input bounds (quota protection)', () => {
  it('clamps oversized free-text fields before storing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const huge = 'x'.repeat(10_000)
    const created = addApplication(makeInput({ pitch: huge, firstName: huge }))
    expect(created.pitch.length).toBeLessThanOrEqual(2000)
    expect(created.firstName.length).toBeLessThanOrEqual(120)
  })

  it('caps the number of tags and normalizes years of experience', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const manyLangs = Array.from({ length: 50 }, (_, i) => `L${i}`)
    const created = addApplication(makeInput({ languages: manyLangs, yearsExperience: -5 }))
    expect(created.languages.length).toBeLessThanOrEqual(20)
    expect(created.yearsExperience).toBe(0) // negative clamped to 0
  })
})

describe('EMAIL_PATTERN', () => {
  it('accepts well-formed addresses and rejects malformed ones', () => {
    expect(EMAIL_PATTERN.test('a@b.com')).toBe(true)
    expect(EMAIL_PATTERN.test('sofia.m@resort.co.uk')).toBe(true)
    expect(EMAIL_PATTERN.test('@')).toBe(false)
    expect(EMAIL_PATTERN.test('a@')).toBe(false)
    expect(EMAIL_PATTERN.test('no-at-sign')).toBe(false)
  })
})

describe('subscribe / emit', () => {
  it('notifies same-tab listeners on every mutation', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    const a = addApplication(makeInput())
    expect(listener).toHaveBeenCalledTimes(1)

    setApplicationStatus(a.id, 'ACCEPTED')
    expect(listener).toHaveBeenCalledTimes(2)

    removeApplication(a.id)
    expect(listener).toHaveBeenCalledTimes(3)

    unsubscribe()
    addApplication(makeInput())
    expect(listener).toHaveBeenCalledTimes(3) // no longer notified
  })
})
