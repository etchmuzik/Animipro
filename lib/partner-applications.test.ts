// Tests for the partner-applications store. Mirrors lib/applications.test.ts:
// seed init, immutable add with clamping, status transitions, subscribe/emit.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPartnerApplications,
  addPartnerApplication,
  setPartnerStatus,
  subscribe,
  type NewPartnerInput,
} from '@/lib/partner-applications'

const STORAGE_KEY = 'animapro:partner-applications:v1'

function makeInput(overrides: Partial<NewPartnerInput> = {}): NewPartnerInput {
  return {
    companyName: 'Test Agency',
    contactName: 'Test Contact',
    email: 'partner@example.com',
    phone: '+20 100 000 0000',
    country: 'Egypt',
    hotelsServed: 5,
    tier: 'STUDIO',
    pitch: 'We want to resell Animipro.',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('seed initialization', () => {
  it('seeds the inbox on first read of an empty store', () => {
    const list = getPartnerApplications()
    expect(list.length).toBeGreaterThan(0)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('does not re-seed once a store exists', () => {
    getPartnerApplications()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    expect(getPartnerApplications()).toEqual([])
  })
})

describe('addPartnerApplication', () => {
  it('prepends a new application with id, timestamp and NEW status', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addPartnerApplication(makeInput({ companyName: 'Acme Travel' }))
    expect(created.id).toMatch(/^pa-/)
    expect(created.status).toBe('NEW')
    expect(created.submittedAt).toBeTypeOf('string')
    expect(getPartnerApplications()[0].companyName).toBe('Acme Travel')
  })

  it('clamps oversized free-text and out-of-range hotelsServed', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const huge = 'x'.repeat(10_000)
    const created = addPartnerApplication(makeInput({ pitch: huge, hotelsServed: -50 }))
    expect(created.pitch.length).toBeLessThanOrEqual(2000)
    expect(created.hotelsServed).toBe(0)
  })

  it('carries an optional websiteUrl through', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const created = addPartnerApplication(makeInput({ websiteUrl: 'https://example.com' }))
    expect(created.websiteUrl).toBe('https://example.com')
  })
})

describe('setPartnerStatus', () => {
  it('updates a single application immutably', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const a = addPartnerApplication(makeInput({ companyName: 'A' }))
    const b = addPartnerApplication(makeInput({ companyName: 'B' }))
    setPartnerStatus(a.id, 'SIGNED')
    const list = getPartnerApplications()
    expect(list.find(x => x.id === a.id)?.status).toBe('SIGNED')
    expect(list.find(x => x.id === b.id)?.status).toBe('NEW')
  })
})

describe('subscribe / emit', () => {
  it('notifies on every mutation and stops after unsubscribe', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    const listener = vi.fn()
    const unsub = subscribe(listener)
    const a = addPartnerApplication(makeInput())
    setPartnerStatus(a.id, 'IN_CONVERSATION')
    expect(listener).toHaveBeenCalledTimes(2)
    unsub()
    addPartnerApplication(makeInput())
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
