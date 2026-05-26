// Tests for the onboarding checklist store: per-application state, immutable
// toggles, explicit set, progress counting, and subscribe/emit.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getOnboarding,
  toggleOnboardingStep,
  setOnboardingStep,
  getOnboardingProgress,
  subscribe,
  ONBOARDING_STEPS,
} from './onboarding'

beforeEach(() => {
  localStorage.clear()
})

describe('getOnboarding', () => {
  it('returns an empty checklist for an unknown application', () => {
    expect(getOnboarding('nope')).toEqual({})
  })
})

describe('toggleOnboardingStep', () => {
  it('flips a step on then off, scoped to the application', () => {
    toggleOnboardingStep('app-1', 'contract')
    expect(getOnboarding('app-1').contract).toBe(true)
    toggleOnboardingStep('app-1', 'contract')
    expect(getOnboarding('app-1').contract).toBe(false)
  })

  it('keeps applications independent', () => {
    toggleOnboardingStep('app-1', 'uniform')
    expect(getOnboarding('app-1').uniform).toBe(true)
    expect(getOnboarding('app-2').uniform).toBeUndefined()
  })
})

describe('setOnboardingStep', () => {
  it('sets a step explicitly', () => {
    setOnboardingStep('app-1', 'training', true)
    expect(getOnboarding('app-1').training).toBe(true)
    setOnboardingStep('app-1', 'training', false)
    expect(getOnboarding('app-1').training).toBe(false)
  })
})

describe('getOnboardingProgress', () => {
  it('counts completed steps against the total', () => {
    const { total } = getOnboardingProgress('app-1')
    expect(total).toBe(ONBOARDING_STEPS.length)
    expect(getOnboardingProgress('app-1').done).toBe(0)

    setOnboardingStep('app-1', 'contract', true)
    setOnboardingStep('app-1', 'uniform', true)
    expect(getOnboardingProgress('app-1').done).toBe(2)
  })
})

describe('subscribe / emit', () => {
  it('notifies on mutation and stops after unsubscribe', () => {
    const listener = vi.fn()
    const unsub = subscribe(listener)
    toggleOnboardingStep('app-1', 'contract')
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
    toggleOnboardingStep('app-1', 'uniform')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
