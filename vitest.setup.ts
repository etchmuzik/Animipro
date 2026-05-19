// Test setup: provide a real IndexedDB implementation (jsdom has none) and
// reset all browser-storage state between tests so each spec starts clean.
import 'fake-indexeddb/auto'
import { afterEach, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'

beforeEach(() => {
  // Fresh IndexedDB per test — drops any DBs opened by a prior test.
  globalThis.indexedDB = new IDBFactory()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})
