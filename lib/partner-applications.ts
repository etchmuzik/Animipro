// ─── AnimaPro — Partner applications store (localStorage-backed) ──────────────
//
// The reseller-programme inbox. Mirrors lib/applications.ts exactly: localStorage
// store + immutable updates + subscribe/emit pub-sub + cross-tab sync + seed data
// on first read. Partners apply via /partners and the deal team reviews them
// (review UI is a follow-up — for now applications are persisted and visible in
// devtools / future admin module).

'use client'

export type PartnerTier = 'STUDIO' | 'COUNTRY' | 'SOURCE'
export type PartnerStatus = 'NEW' | 'IN_CONVERSATION' | 'SIGNED' | 'DECLINED'

export interface PartnerApplication {
  id: string
  submittedAt: string
  companyName: string
  contactName: string
  email: string
  phone: string
  country: string
  /** Self-described scale: number of resort/hotel clients today */
  hotelsServed: number
  tier: PartnerTier
  pitch: string
  websiteUrl?: string
  status: PartnerStatus
}

export type NewPartnerInput = Omit<PartnerApplication, 'id' | 'submittedAt' | 'status'>

const STORAGE_KEY = 'animapro:partner-applications:v1'

const SEED_PARTNERS: PartnerApplication[] = [
  {
    id: 'pa-seed-1',
    submittedAt: '2026-05-22T09:00:00.000Z',
    companyName: 'Red Sea Digital',
    contactName: 'Mahmoud Selim',
    email: 'mahmoud@redseadigital.eg',
    phone: '+20 100 555 4400',
    country: 'Egypt',
    hotelsServed: 12,
    tier: 'COUNTRY',
    pitch: 'We already run marketing and IT for 12 resorts across Sharm and Hurghada. Country licence would let us bundle AnimaPro into our existing GM-tier contracts.',
    websiteUrl: 'https://redseadigital.eg',
    status: 'IN_CONVERSATION',
  },
  {
    id: 'pa-seed-2',
    submittedAt: '2026-05-20T16:30:00.000Z',
    companyName: 'Adriatic Hospitality Tech',
    contactName: 'Marija Horvat',
    email: 'marija@adriatichospitalitytech.com',
    phone: '+385 91 220 1188',
    country: 'Croatia',
    hotelsServed: 6,
    tier: 'STUDIO',
    pitch: 'Looking to launch animation management for the Croatian coast next summer season. The Italian language support is the deciding factor for us.',
    status: 'NEW',
  },
]

// ─── Store internals ───────────────────────────────────────────────────────────

function read(): PartnerApplication[] {
  if (typeof window === 'undefined') return [...SEED_PARTNERS]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      writeRaw(SEED_PARTNERS)
      return SEED_PARTNERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PartnerApplication[]) : []
  } catch {
    return []
  }
}

function writeRaw(list: PartnerApplication[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* quota — only ids stored here */
  }
}

function write(list: PartnerApplication[]): void {
  writeRaw(list)
  emit()
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

type Listener = () => void
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) {
    try { l() } catch { /* swallow */ }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY) listener()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `pa-${crypto.randomUUID()}`
  return `pa-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

const MAX_SHORT = 120
const MAX_PITCH = 2000

function clamp(value: string, max: number): string {
  return value.slice(0, max)
}

export function getPartnerApplications(): PartnerApplication[] {
  return read()
}

export function addPartnerApplication(input: NewPartnerInput): PartnerApplication {
  const application: PartnerApplication = {
    ...input,
    companyName: clamp(input.companyName, MAX_SHORT),
    contactName: clamp(input.contactName, MAX_SHORT),
    email: clamp(input.email, MAX_SHORT),
    phone: clamp(input.phone, MAX_SHORT),
    country: clamp(input.country, MAX_SHORT),
    hotelsServed: Math.max(0, Math.min(10_000, Math.floor(input.hotelsServed) || 0)),
    pitch: clamp(input.pitch, MAX_PITCH),
    websiteUrl: input.websiteUrl ? clamp(input.websiteUrl, MAX_SHORT) : undefined,
    id: makeId(),
    submittedAt: new Date().toISOString(),
    status: 'NEW',
  }
  write([application, ...read()])
  return application
}

export function setPartnerStatus(id: string, status: PartnerStatus): PartnerApplication[] {
  const list = read()
  const updated = list.map(a => (a.id === id ? { ...a, status } : a))
  write(updated)
  return updated
}
