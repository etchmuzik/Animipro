// Characterization tests for lib/task-state.ts — pin down the runtime-verified
// behavior (Start/Complete + reload persistence) and the edge cases that are
// hard to exercise by hand: idempotency, immutability, the status overlay, and
// the subscribe/emit notification path.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTaskState,
  startTask,
  completeTask,
  resetTask,
  addProof,
  removeProof,
  effectiveStatus,
  subscribe,
  type ProofRef,
} from '@/lib/task-state'

const STORAGE_KEY = 'animapro:task-state:v1'

function makeProof(overrides: Partial<ProofRef> = {}): ProofRef {
  return {
    mediaId: 'm1',
    mime: 'image/png',
    name: 'photo.png',
    size: 1234,
    uploadedAt: '2026-05-20T08:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('getTaskState', () => {
  it('returns an empty proofs array for an unknown task', () => {
    expect(getTaskState('schedule', 'nope')).toEqual({ proofs: [] })
  })

  it('reads back persisted state from localStorage (reload survival)', () => {
    startTask('schedule', 'se3')
    // Simulate a fresh module read — getTaskState always re-reads localStorage.
    const state = getTaskState('schedule', 'se3')
    expect(state.startedAt).toBeTypeOf('string')
    expect(state.completedAt).toBeUndefined()
  })

  it('namespaces by kind and id', () => {
    startTask('schedule', 'x')
    expect(getTaskState('assignment', 'x').startedAt).toBeUndefined()
    expect(getTaskState('schedule', 'x').startedAt).toBeTypeOf('string')
  })
})

describe('startTask', () => {
  it('records startedAt and persists to localStorage', () => {
    const before = Date.now()
    const state = startTask('event', 'ev1')
    const ts = new Date(state.startedAt!).getTime()
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(localStorage.getItem(STORAGE_KEY)).toContain('event:ev1')
  })

  it('is idempotent — never overwrites an existing startedAt', () => {
    const first = startTask('schedule', 'se1')
    const second = startTask('schedule', 'se1')
    expect(second.startedAt).toBe(first.startedAt)
  })
})

describe('completeTask', () => {
  it('records completedAt and keeps the existing startedAt', () => {
    const started = startTask('schedule', 'se1')
    const done = completeTask('schedule', 'se1')
    expect(done.startedAt).toBe(started.startedAt)
    expect(done.completedAt).toBeTypeOf('string')
  })

  it('auto-starts when completing a task that was never started', () => {
    const done = completeTask('assignment', 'a1')
    expect(done.startedAt).toBeTypeOf('string')
    expect(done.completedAt).toBeTypeOf('string')
  })
})

describe('resetTask', () => {
  it('clears timestamps but preserves proofs', () => {
    startTask('schedule', 'se1')
    addProof('schedule', 'se1', makeProof())
    const reset = resetTask('schedule', 'se1')
    expect(reset.startedAt).toBeUndefined()
    expect(reset.completedAt).toBeUndefined()
    expect(reset.proofs).toHaveLength(1)
  })
})

describe('addProof / removeProof', () => {
  it('appends proofs immutably', () => {
    const s1 = addProof('schedule', 'se1', makeProof({ mediaId: 'a' }))
    const s2 = addProof('schedule', 'se1', makeProof({ mediaId: 'b' }))
    expect(s1.proofs.map(p => p.mediaId)).toEqual(['a'])
    expect(s2.proofs.map(p => p.mediaId)).toEqual(['a', 'b'])
    // s1 reference was not mutated by the second add
    expect(s1.proofs).toHaveLength(1)
  })

  it('removes a proof by mediaId and leaves the rest', () => {
    addProof('schedule', 'se1', makeProof({ mediaId: 'a' }))
    addProof('schedule', 'se1', makeProof({ mediaId: 'b' }))
    const after = removeProof('schedule', 'se1', 'a')
    expect(after.proofs.map(p => p.mediaId)).toEqual(['b'])
  })

  it('removing a non-existent proof is a no-op', () => {
    addProof('schedule', 'se1', makeProof({ mediaId: 'a' }))
    const after = removeProof('schedule', 'se1', 'zzz')
    expect(after.proofs.map(p => p.mediaId)).toEqual(['a'])
  })
})

describe('effectiveStatus overlay', () => {
  it('returns the original status when nothing is started', () => {
    expect(effectiveStatus('schedule', 'se1', 'SCHEDULED')).toBe('SCHEDULED')
  })

  it('returns IN_PROGRESS once started', () => {
    startTask('schedule', 'se1')
    expect(effectiveStatus('schedule', 'se1', 'SCHEDULED')).toBe('IN_PROGRESS')
  })

  it('returns COMPLETED once completed, overriding IN_PROGRESS', () => {
    completeTask('schedule', 'se1')
    expect(effectiveStatus('schedule', 'se1', 'SCHEDULED')).toBe('COMPLETED')
  })
})

describe('subscribe', () => {
  it('notifies same-tab listeners on every mutation', () => {
    const listener = vi.fn()
    const unsub = subscribe(listener)
    startTask('schedule', 'se1')
    completeTask('schedule', 'se1')
    expect(listener).toHaveBeenCalledTimes(2)
    unsub()
    startTask('schedule', 'se2')
    expect(listener).toHaveBeenCalledTimes(2) // no further calls after unsubscribe
  })

  it('survives a throwing listener without breaking other listeners', () => {
    const bad = vi.fn(() => { throw new Error('boom') })
    const good = vi.fn()
    subscribe(bad)
    subscribe(good)
    startTask('schedule', 'se1')
    expect(good).toHaveBeenCalledOnce()
  })
})
