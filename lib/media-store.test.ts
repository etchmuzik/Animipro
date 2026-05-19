// Characterization tests for lib/media-store.ts — pin down the IndexedDB proof
// round-trip verified in the browser (save → reload → re-read → render) plus
// edge cases: missing-id null, delete idempotency, and object-URL caching.
//
// media-store caches its DB connection in a module-scoped `dbPromise`, so each
// test re-imports the module fresh (vi.resetModules) to bind to the per-test
// fake-indexeddb instance created in vitest.setup.ts.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

type MediaStore = typeof import('@/lib/media-store')

async function freshStore(): Promise<MediaStore> {
  vi.resetModules()
  return import('@/lib/media-store')
}

beforeEach(() => {
  // jsdom has no real object-URL impl. Spy ONLY the two static methods on the
  // real URL class — replacing the whole global would break `new URL()`, which
  // fake-indexeddb relies on internally.
  let counter = 0
  // jsdom may not define these at all — ensure they exist before spying.
  if (typeof URL.createObjectURL !== 'function') {
    ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = () => ''
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = () => {}
  }
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:mock/${counter++}`)
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('saveBlob / getBlob round-trip', () => {
  // NOTE: fake-indexeddb under jsdom does not preserve Blob instances through
  // structured clone (it returns a plain object), so byte/type fidelity is NOT
  // asserted here — that round-trip was verified against a real browser's
  // IndexedDB (image/png, correct bytes). These tests cover the store's own
  // contract: a saved record is retrievable by its returned id, and unknown
  // ids resolve to null.
  it('saves a blob and makes it retrievable by the returned id', async () => {
    const store = await freshStore()
    const blob = new Blob(['proof-bytes'], { type: 'image/png' })
    const id = await store.saveBlob(blob)
    expect(id).toBeTypeOf('string')

    const got = await store.getBlob(id)
    expect(got).not.toBeNull()
  })

  it('generates unique ids for separate saves', async () => {
    const store = await freshStore()
    const id1 = await store.saveBlob(new Blob(['a']))
    const id2 = await store.saveBlob(new Blob(['b']))
    expect(id1).not.toBe(id2)
  })
})

describe('getBlob', () => {
  it('returns null for an unknown id (e.g. user cleared site data)', async () => {
    const store = await freshStore()
    expect(await store.getBlob('does-not-exist')).toBeNull()
  })
})

describe('deleteBlob', () => {
  it('removes a stored blob', async () => {
    const store = await freshStore()
    const id = await store.saveBlob(new Blob(['x'], { type: 'video/mp4' }))
    await store.deleteBlob(id)
    expect(await store.getBlob(id)).toBeNull()
  })

  it('is idempotent — deleting a missing id does not throw', async () => {
    const store = await freshStore()
    await expect(store.deleteBlob('missing')).resolves.toBeUndefined()
  })
})

describe('getObjectUrl caching', () => {
  it('creates a URL once and reuses it for the same id', async () => {
    const store = await freshStore()
    const id = await store.saveBlob(new Blob(['x'], { type: 'image/png' }))

    const url1 = await store.getObjectUrl(id)
    const url2 = await store.getObjectUrl(id)
    expect(url1).toBe(url2)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('returns null when the blob is missing', async () => {
    const store = await freshStore()
    expect(await store.getObjectUrl('nope')).toBeNull()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('revokeObjectUrl frees the cache so the next call recreates', async () => {
    const store = await freshStore()
    const id = await store.saveBlob(new Blob(['x'], { type: 'image/png' }))

    await store.getObjectUrl(id)
    store.revokeObjectUrl(id)
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce()

    await store.getObjectUrl(id)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
  })
})
