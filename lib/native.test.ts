import { describe, it, expect, afterEach, vi } from 'vitest'

describe('IS_NATIVE', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('is true when NEXT_PUBLIC_NATIVE is "1"', async () => {
    vi.stubEnv('NEXT_PUBLIC_NATIVE', '1')
    const { IS_NATIVE } = await import('./native')
    expect(IS_NATIVE).toBe(true)
  })

  it('is false when NEXT_PUBLIC_NATIVE is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_NATIVE', '')
    const { IS_NATIVE } = await import('./native')
    expect(IS_NATIVE).toBe(false)
  })
})
