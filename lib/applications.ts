// ─── AnimaPro — Job applications store (localStorage-backed) ──────────────────
//
// The hiring "inbox" for the demo. Prospective animators submit applications on
// the public /careers page; Admins review them in the platform's Recruitment
// module. There is no backend, so applications live in localStorage (this file)
// and any attached CV/photo blob lives in IndexedDB (see lib/media-store.ts) —
// we store only the blob's record id here so the JSON envelope stays small.
//
// This mirrors the lib/task-state.ts pattern exactly: immutable updates, a
// subscribe()/emit() pub-sub so every consumer re-reads after a mutation, and
// cross-tab sync via the `storage` event. On first read against an empty store
// we seed a handful of realistic candidates so the Recruitment module is never
// empty in the demo.

'use client'

import type { UserRole } from './mock-data'

// Field roles a candidate can apply for (the level-5 staff the resort hires).
export type ApplicantRole = Extract<
  UserRole,
  'ANIMATOR' | 'ENTERTAINER' | 'LIFEGUARD' | 'KIDS_CLUB'
>

export type ApplicationStatus = 'NEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'

export interface JobApplication {
  id: string
  /** ISO timestamp the application was submitted */
  submittedAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  /** Role the candidate is applying for */
  role: ApplicantRole
  languages: string[]
  specialties: string[]
  yearsExperience: number
  /** Short cover note / pitch */
  pitch: string
  /** Hotel the candidate applied to (optional — public form can be company-wide) */
  hotelId?: string
  hotelName?: string
  /** IndexedDB record id of an optional attached CV / intro photo / video */
  cvMediaId?: string
  cvName?: string
  cvMime?: string
  status: ApplicationStatus
}

/** Fields supplied by the public apply form. id/submittedAt/status are derived. */
export type NewApplicationInput = Omit<JobApplication, 'id' | 'submittedAt' | 'status'>

const STORAGE_KEY = 'animapro:applications:v1'

// ─── Seed data ─────────────────────────────────────────────────────────────────
//
// Realistic candidates so admins can act immediately on first load. These are
// written through to localStorage on the first read of an empty store, which
// means status changes to a seed persist exactly like a real submission.

const SEED_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-seed-1',
    submittedAt: '2026-05-21T09:12:00.000Z',
    firstName: 'Sofia',
    lastName: 'Marchetti',
    email: 'sofia.marchetti@example.com',
    phone: '+39 340 118 2200',
    nationality: 'Italian',
    role: 'ANIMATOR',
    languages: ['Italian', 'English', 'Spanish'],
    specialties: ['Aqua Gym', 'Beach Volleyball', 'Dance'],
    yearsExperience: 3,
    pitch: 'Three seasons across Sardinia and Crete. I love running the pool stage and getting shy guests onto the dance floor.',
    hotelName: 'Any Red Sea resort',
    status: 'NEW',
  },
  {
    id: 'app-seed-2',
    submittedAt: '2026-05-20T14:40:00.000Z',
    firstName: 'Karim',
    lastName: 'Abdelrahman',
    email: 'karim.abdel@example.com',
    phone: '+20 100 552 8841',
    nationality: 'Egyptian',
    role: 'ENTERTAINER',
    languages: ['Arabic', 'English', 'Russian'],
    specialties: ['DJ', 'Live Hosting', 'Karaoke'],
    yearsExperience: 5,
    pitch: 'Resident DJ in Hurghada for two years. I build the evening show energy and read the crowd fast.',
    hotelName: 'Hurghada properties',
    status: 'SHORTLISTED',
  },
  {
    id: 'app-seed-3',
    submittedAt: '2026-05-19T07:05:00.000Z',
    firstName: 'Lena',
    lastName: 'Novak',
    email: 'lena.novak@example.com',
    phone: '+420 776 224 119',
    nationality: 'Czech',
    role: 'KIDS_CLUB',
    languages: ['Czech', 'English', 'German'],
    specialties: ['Mini Disco', 'Arts & Crafts', 'Face Painting'],
    yearsExperience: 2,
    pitch: 'Qualified kindergarten teacher. Parents trust me with the mini club and the kids never want to leave.',
    hotelName: 'Any Red Sea resort',
    status: 'NEW',
  },
  {
    id: 'app-seed-4',
    submittedAt: '2026-05-18T16:22:00.000Z',
    firstName: 'Diego',
    lastName: 'Fernández',
    email: 'diego.fernandez@example.com',
    phone: '+34 611 902 334',
    nationality: 'Spanish',
    role: 'LIFEGUARD',
    languages: ['Spanish', 'English'],
    specialties: ['Pool Safety', 'First Aid', 'Open Water'],
    yearsExperience: 4,
    pitch: 'Certified lifeguard and first-aid instructor. Calm under pressure, vigilant on the beach and at the pool.',
    hotelName: 'Sharm El Sheikh properties',
    status: 'NEW',
  },
  {
    id: 'app-seed-5',
    submittedAt: '2026-05-17T11:48:00.000Z',
    firstName: 'Amina',
    lastName: 'Khaled',
    email: 'amina.khaled@example.com',
    phone: '+20 122 778 0091',
    nationality: 'Egyptian',
    role: 'ANIMATOR',
    languages: ['Arabic', 'English', 'French'],
    specialties: ['Yoga', 'Stretching', 'Water Polo'],
    yearsExperience: 1,
    pitch: 'Fresh fitness graduate, full of energy. I want to grow into a team leader and learn from the best.',
    hotelName: 'Any Red Sea resort',
    status: 'REJECTED',
  },
]

// ─── Store internals ───────────────────────────────────────────────────────────

function read(): JobApplication[] {
  // Return a copy on the server so callers can never mutate the seed constant
  // (would leak across requests in any server-rendered context).
  if (typeof window === 'undefined') return [...SEED_APPLICATIONS]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      // First visit — seed the inbox so it is never empty in the demo.
      writeRaw(SEED_APPLICATIONS)
      return SEED_APPLICATIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as JobApplication[]) : []
  } catch {
    return []
  }
}

/** Persist without emitting — used by the seed path inside read(). */
function writeRaw(list: JobApplication[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage full — only ids are stored here so this is unlikely.
  }
}

function write(list: JobApplication[]): void {
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

export function getApplications(): JobApplication[] {
  return read()
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `app-${crypto.randomUUID()}`
  }
  return `app-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

// Bound free-text so a single submission can't exhaust the localStorage quota
// (the whole app shares one origin quota). Validation belongs at this boundary
// so every caller is protected, not just the careers form.
const MAX_SHORT = 120  // names, email, phone, nationality, tag entries
const MAX_PITCH = 2000
const MAX_TAGS = 20

function clampText(value: string, max: number): string {
  return value.slice(0, max)
}

function clampList(values: string[]): string[] {
  return values.slice(0, MAX_TAGS).map(v => clampText(v, MAX_SHORT))
}

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Add a new application (from the public form) to the front of the inbox. */
export function addApplication(input: NewApplicationInput): JobApplication {
  const application: JobApplication = {
    ...input,
    firstName: clampText(input.firstName, MAX_SHORT),
    lastName: clampText(input.lastName, MAX_SHORT),
    email: clampText(input.email, MAX_SHORT),
    phone: clampText(input.phone, MAX_SHORT),
    nationality: clampText(input.nationality, MAX_SHORT),
    languages: clampList(input.languages),
    specialties: clampList(input.specialties),
    yearsExperience: Math.max(0, Math.min(60, Math.floor(input.yearsExperience) || 0)),
    pitch: clampText(input.pitch, MAX_PITCH),
    cvName: input.cvName ? clampText(input.cvName, MAX_SHORT) : undefined,
    id: makeId(),
    submittedAt: new Date().toISOString(),
    status: 'NEW',
  }
  const list = read()
  write([application, ...list])
  return application
}

/** Move an application along the pipeline (shortlist / accept / reject). */
export function setApplicationStatus(id: string, status: ApplicationStatus): JobApplication[] {
  const list = read()
  const updated = list.map(a => (a.id === id ? { ...a, status } : a))
  write(updated)
  return updated
}

export function removeApplication(id: string): JobApplication[] {
  const list = read()
  const updated = list.filter(a => a.id !== id)
  write(updated)
  return updated
}

export interface ApplicationStats {
  total: number
  new: number
  shortlisted: number
  accepted: number
  rejected: number
}

export function getApplicationStats(): ApplicationStats {
  const list = read()
  return {
    total: list.length,
    new: list.filter(a => a.status === 'NEW').length,
    shortlisted: list.filter(a => a.status === 'SHORTLISTED').length,
    accepted: list.filter(a => a.status === 'ACCEPTED').length,
    rejected: list.filter(a => a.status === 'REJECTED').length,
  }
}
