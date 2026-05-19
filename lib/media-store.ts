// ─── AnimaPro — Media store (IndexedDB-backed) ───────────────────────────────
//
// Proof uploads (photo / video) live in IndexedDB as Blobs. IndexedDB is the
// right choice here — localStorage caps at ~5 MB per origin and only stores
// strings (would force base64, blowing size up by ~33%). IndexedDB handles
// Blobs natively and quota is typically hundreds of MB per origin on mobile
// browsers, so even short phone-captured videos fit comfortably.
//
// We expose a tiny promise-based API on top of the raw IDB callbacks so call
// sites stay readable.

'use client'

const DB_NAME = 'animapro-media'
const DB_VERSION = 1
const STORE = 'blobs'

interface Record {
  id: string
  blob: Blob
  createdAt: string
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not available'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
  return dbPromise
}

function makeId(): string {
  // crypto.randomUUID is available in all modern PWA-capable browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'm_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * Save a Blob and return its generated ID.
 */
export async function saveBlob(blob: Blob): Promise<string> {
  const db = await openDb()
  const id = makeId()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const record: Record = { id, blob, createdAt: new Date().toISOString() }
    tx.objectStore(STORE).put(record)
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Retrieve a Blob by ID. Returns null if not found (e.g. user cleared site data).
 */
export async function getBlob(id: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => {
      const rec = req.result as Record | undefined
      resolve(rec?.blob ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

/**
 * Delete a Blob by ID. Idempotent — no error if the record doesn't exist.
 */
export async function deleteBlob(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ─── Object URL cache ────────────────────────────────────────────────────────
//
// Each <img>/<video> needs a URL.createObjectURL() to render a Blob. Those URLs
// must be revoked to free memory. We keep a small per-id cache so callers can
// re-render without hitting IDB every time.

const urlCache = new Map<string, string>()

export async function getObjectUrl(id: string): Promise<string | null> {
  if (urlCache.has(id)) return urlCache.get(id)!
  const blob = await getBlob(id)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(id, url)
  return url
}

export function revokeObjectUrl(id: string): void {
  const url = urlCache.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    urlCache.delete(id)
  }
}

export function revokeAllObjectUrls(): void {
  for (const url of urlCache.values()) URL.revokeObjectURL(url)
  urlCache.clear()
}
