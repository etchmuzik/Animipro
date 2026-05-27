// ─── AnimaPro — Club ticket sales (Sharm-style) ─────────────────────────────
//
// Hotels in Sharm resell tickets to local nightclubs (Pacha, Hard Rock,
// Naama Bay venues, etc.) to their guests. This file owns:
//   - the immutable Club + ClubNight catalog (mock seed)
//   - the runtime Ticket store (localStorage-backed, same pattern as
//     lib/task-state.ts)
//   - sell / scan / refund / report helpers
//
// QR strategy:
//   - Each ticket carries an opaque UUID `qrId`.
//   - The QR payload is the URL `<origin>/platform?scan=<qrId>` so that
//     scanning with any phone camera deep-links into the platform's scan tab.
//   - A short HMAC-style "check" code is appended (`qrId.check`) so basic
//     tamper of a printed/photographed ticket is detectable without server.
//
// Door scanner role validates by feeding the URL or just the qrId into the
// scan flow — the lookup is local.

'use client'

import type { HotelCity } from './mock-data'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ClubMood = 'BEACH' | 'NIGHTCLUB' | 'LOUNGE' | 'OPEN_AIR' | 'CULTURAL'

export interface Club {
  id: string
  name: string
  city: HotelCity
  area: string                // e.g. "Naama Bay", "Soho Square"
  mood: ClubMood
  capacity: number
  /** Tailwind gradient `from-…-via-…-to-…` for the card hero. */
  gradient: string
  /** One-line vibe. */
  tagline: string
  /** "From X EGP" entry — display price; per-night may override. */
  priceFrom: number
  /** Minimum age — most Sharm clubs are 18+ or 21+. */
  minAge: 18 | 21
}

export interface ClubNight {
  id: string
  clubId: string
  /** YYYY-MM-DD */
  date: string
  /** HH:MM */
  doorsOpen: string
  doorsClose: string
  /** "Headliner / theme" — used as the marketing line on the ticket. */
  theme: string
  pricePerTicket: number      // EGP
  capacity: number
  /** Number of tickets reserved by the hotel for resale. */
  hotelAllocation: number
}

export type TicketStatus = 'ACTIVE' | 'SCANNED' | 'REFUNDED'

export interface Ticket {
  id: string                  // record id (== qrId)
  qrId: string                // UUID encoded into the QR
  check: string               // short HMAC-ish tamper check (4 chars)
  clubNightId: string
  guestName: string
  guestRoom?: string          // optional room number
  guestCount: number          // 1 ticket can cover N guests (table reservations)
  pricePaid: number           // EGP total
  paymentMethod: PaymentMethod
  sellerUserId: string
  sellerName: string
  hotelId: string
  soldAt: string              // ISO
  status: TicketStatus
  scannedAt?: string          // ISO
  scannedByUserId?: string
  scannedByName?: string
  refundedAt?: string
  refundReason?: string
}

export type PaymentMethod = 'CASH' | 'CARD' | 'ROOM_CHARGE' | 'WALLET'

// ─── Seed data (immutable) ──────────────────────────────────────────────────

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const dayAfter = new Date(today)
dayAfter.setDate(dayAfter.getDate() + 2)
const ymd = (d: Date): string => d.toISOString().split('T')[0]

export const CLUBS: Club[] = [
  {
    id: 'club-pacha',
    name: 'Pacha Sharm',
    city: 'SHARM_EL_SHEIKH',
    area: 'Naama Bay',
    mood: 'NIGHTCLUB',
    capacity: 1200,
    gradient: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    tagline: 'Sharm’s biggest dance floor. Open-air rooftop, international DJs every weekend.',
    priceFrom: 600,
    minAge: 21,
  },
  {
    id: 'club-soho',
    name: 'Soho Square Lounge',
    city: 'SHARM_EL_SHEIKH',
    area: 'Soho Square, Sharks Bay',
    mood: 'LOUNGE',
    capacity: 600,
    gradient: 'from-amber-400 via-rose-500 to-pink-600',
    tagline: 'Live bands, shisha, the famous dancing fountain. Mixed crowd, dress smart.',
    priceFrom: 350,
    minAge: 18,
  },
  {
    id: 'club-hardrock',
    name: 'Hard Rock Cafe Sharm',
    city: 'SHARM_EL_SHEIKH',
    area: 'Naama Bay Boulevard',
    mood: 'NIGHTCLUB',
    capacity: 800,
    gradient: 'from-rose-500 via-red-600 to-orange-700',
    tagline: 'Burgers, rock & pop covers, then DJ sets till 4am.',
    priceFrom: 450,
    minAge: 18,
  },
  {
    id: 'club-bedouin',
    name: 'Bedouin Stars Dinner',
    city: 'SHARM_EL_SHEIKH',
    area: 'Desert, 25 min from Naama Bay',
    mood: 'CULTURAL',
    capacity: 200,
    gradient: 'from-amber-600 via-orange-700 to-rose-900',
    tagline: 'Traditional dinner under the stars, camel ride, telescope astronomy session.',
    priceFrom: 950,
    minAge: 18,
  },
]

export const CLUB_NIGHTS: ClubNight[] = [
  // Pacha
  { id: 'cn-pacha-1',    clubId: 'club-pacha',    date: ymd(today),     doorsOpen: '23:00', doorsClose: '04:00', theme: 'House Beats — DJ Karim',        pricePerTicket:  700, capacity: 1200, hotelAllocation: 60 },
  { id: 'cn-pacha-2',    clubId: 'club-pacha',    date: ymd(tomorrow),  doorsOpen: '23:00', doorsClose: '04:00', theme: 'Ladies Night — free entry F',   pricePerTicket:  600, capacity: 1200, hotelAllocation: 80 },
  { id: 'cn-pacha-3',    clubId: 'club-pacha',    date: ymd(dayAfter),  doorsOpen: '23:00', doorsClose: '04:00', theme: 'Pacha Anniversary Special',     pricePerTicket:  900, capacity: 1200, hotelAllocation: 40 },
  // Soho
  { id: 'cn-soho-1',     clubId: 'club-soho',     date: ymd(today),     doorsOpen: '20:00', doorsClose: '01:00', theme: 'Latin Live Band + dance show',  pricePerTicket:  400, capacity:  600, hotelAllocation: 30 },
  { id: 'cn-soho-2',     clubId: 'club-soho',     date: ymd(tomorrow),  doorsOpen: '20:00', doorsClose: '01:00', theme: 'Acoustic & Shisha',             pricePerTicket:  350, capacity:  600, hotelAllocation: 30 },
  // Hard Rock
  { id: 'cn-hardrock-1', clubId: 'club-hardrock', date: ymd(today),     doorsOpen: '22:00', doorsClose: '04:00', theme: 'Rock Classics Night',           pricePerTicket:  500, capacity:  800, hotelAllocation: 40 },
  { id: 'cn-hardrock-2', clubId: 'club-hardrock', date: ymd(dayAfter),  doorsOpen: '22:00', doorsClose: '04:00', theme: '90s Throwback',                 pricePerTicket:  450, capacity:  800, hotelAllocation: 50 },
  // Bedouin
  { id: 'cn-bedouin-1',  clubId: 'club-bedouin',  date: ymd(today),     doorsOpen: '19:30', doorsClose: '23:30', theme: 'Stars & Tea',                   pricePerTicket: 1100, capacity:  200, hotelAllocation: 20 },
  { id: 'cn-bedouin-2',  clubId: 'club-bedouin',  date: ymd(tomorrow),  doorsOpen: '19:30', doorsClose: '23:30', theme: 'Full-Moon Bedouin Feast',       pricePerTicket: 1250, capacity:  200, hotelAllocation: 25 },
]

// ─── Lookups ────────────────────────────────────────────────────────────────

export function getClub(clubId: string): Club | undefined {
  return CLUBS.find(c => c.id === clubId)
}

export function getClubNight(nightId: string): ClubNight | undefined {
  return CLUB_NIGHTS.find(n => n.id === nightId)
}

export function getNightsForClub(clubId: string): ClubNight[] {
  return CLUB_NIGHTS
    .filter(n => n.clubId === clubId)
    .sort((a, b) => (a.date + a.doorsOpen).localeCompare(b.date + b.doorsOpen))
}

export function getUpcomingNights(fromDate?: string): ClubNight[] {
  const cutoff = fromDate ?? ymd(today)
  return CLUB_NIGHTS
    .filter(n => n.date >= cutoff)
    .sort((a, b) => (a.date + a.doorsOpen).localeCompare(b.date + b.doorsOpen))
}

// ─── Runtime ticket store ──────────────────────────────────────────────────
//
// Tickets are persisted client-side in localStorage. Same pattern as
// lib/task-state.ts — single key, JSON envelope, pub/sub for reactive UIs.

const STORAGE_KEY = 'animapro:tickets:v1'

interface TicketStore {
  tickets: Ticket[]
}

function read(): TicketStore {
  if (typeof window === 'undefined') return { tickets: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tickets: [] }
    const parsed = JSON.parse(raw) as TicketStore
    if (!parsed || !Array.isArray(parsed.tickets)) return { tickets: [] }
    return parsed
  } catch {
    return { tickets: [] }
  }
}

function write(store: TicketStore): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch { /* swallow — quota issues are rare for small JSON */ }
  emit()
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

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

// ─── ID / check helpers ────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 24)
  }
  return 't_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * Tiny tamper check derived from the ticket id — not cryptographically
 * secure, just enough that a guest can't trivially type in a random ID and
 * get a valid scan. For real anti-forgery use a server-side HMAC.
 */
function makeCheck(qrId: string): string {
  let h = 0
  for (let i = 0; i < qrId.length; i++) {
    h = ((h << 5) - h + qrId.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36).slice(0, 4).padStart(4, '0')
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface SellTicketInput {
  clubNightId: string
  guestName: string
  guestRoom?: string
  guestCount: number
  pricePaid: number
  paymentMethod: PaymentMethod
  sellerUserId: string
  sellerName: string
  hotelId: string
}

export function sellTicket(input: SellTicketInput): Ticket {
  const qrId = makeId()
  const ticket: Ticket = {
    id: qrId,
    qrId,
    check: makeCheck(qrId),
    clubNightId: input.clubNightId,
    guestName: input.guestName.trim(),
    guestRoom: input.guestRoom?.trim() || undefined,
    guestCount: Math.max(1, Math.min(20, Math.floor(input.guestCount))),
    pricePaid: Math.max(0, Math.round(input.pricePaid)),
    paymentMethod: input.paymentMethod,
    sellerUserId: input.sellerUserId,
    sellerName: input.sellerName,
    hotelId: input.hotelId,
    soldAt: new Date().toISOString(),
    status: 'ACTIVE',
  }
  const store = read()
  store.tickets.push(ticket)
  write(store)
  return ticket
}

export function getTicket(qrId: string): Ticket | undefined {
  return read().tickets.find(t => t.qrId === qrId)
}

export function listTickets(filter?: { hotelId?: string; sellerUserId?: string; clubNightId?: string; status?: TicketStatus }): Ticket[] {
  const all = read().tickets
  return all.filter(t => {
    if (filter?.hotelId && t.hotelId !== filter.hotelId) return false
    if (filter?.sellerUserId && t.sellerUserId !== filter.sellerUserId) return false
    if (filter?.clubNightId && t.clubNightId !== filter.clubNightId) return false
    if (filter?.status && t.status !== filter.status) return false
    return true
  })
}

export interface ScanResult {
  outcome: 'OK' | 'NOT_FOUND' | 'ALREADY_SCANNED' | 'REFUNDED' | 'TAMPERED'
  ticket?: Ticket
  message: string
}

export interface ScanContext {
  scannerUserId: string
  scannerName: string
}

/**
 * Validate + mark a ticket as scanned. The input may be the raw qrId or a
 * scan URL (`https://…/platform?scan=<qrId>` or `<qrId>.<check>`).
 */
export function scanTicket(rawInput: string, ctx: ScanContext): ScanResult {
  const parsed = parseQrPayload(rawInput)
  if (!parsed) {
    return { outcome: 'NOT_FOUND', message: 'Unrecognised ticket code.' }
  }
  const ticket = getTicket(parsed.qrId)
  if (!ticket) {
    return { outcome: 'NOT_FOUND', message: 'No such ticket. Was it issued on a different device?' }
  }
  if (parsed.check && parsed.check !== ticket.check) {
    return { outcome: 'TAMPERED', ticket, message: 'Tamper check failed — refuse entry.' }
  }
  if (ticket.status === 'REFUNDED') {
    return { outcome: 'REFUNDED', ticket, message: 'Ticket was refunded — refuse entry.' }
  }
  if (ticket.status === 'SCANNED') {
    return { outcome: 'ALREADY_SCANNED', ticket, message: `Already scanned ${formatRelative(ticket.scannedAt)} by ${ticket.scannedByName ?? 'someone'}.` }
  }
  // Mark as scanned.
  const store = read()
  const updated: Ticket = {
    ...ticket,
    status: 'SCANNED',
    scannedAt: new Date().toISOString(),
    scannedByUserId: ctx.scannerUserId,
    scannedByName: ctx.scannerName,
  }
  store.tickets = store.tickets.map(t => (t.qrId === updated.qrId ? updated : t))
  write(store)
  return { outcome: 'OK', ticket: updated, message: `Entry granted — ${updated.guestName} (${updated.guestCount} guest${updated.guestCount === 1 ? '' : 's'}).` }
}

export function refundTicket(qrId: string, reason: string): Ticket | undefined {
  const store = read()
  const existing = store.tickets.find(t => t.qrId === qrId)
  if (!existing) return undefined
  if (existing.status === 'SCANNED') return existing // can't refund a used ticket
  const updated: Ticket = {
    ...existing,
    status: 'REFUNDED',
    refundedAt: new Date().toISOString(),
    refundReason: reason.trim(),
  }
  store.tickets = store.tickets.map(t => (t.qrId === qrId ? updated : t))
  write(store)
  return updated
}

// ─── Reporting ─────────────────────────────────────────────────────────────

export interface SalesSummary {
  ticketsSold: number
  ticketsScanned: number
  ticketsRefunded: number
  revenue: number
  /** Revenue minus refunds. */
  netRevenue: number
}

export function summarizeSales(filter?: { hotelId?: string; sellerUserId?: string; clubNightId?: string; dateFrom?: string; dateTo?: string }): SalesSummary {
  const tickets = listTickets({
    hotelId: filter?.hotelId,
    sellerUserId: filter?.sellerUserId,
    clubNightId: filter?.clubNightId,
  })
  const inRange = (iso: string): boolean => {
    const d = iso.split('T')[0]
    if (filter?.dateFrom && d < filter.dateFrom) return false
    if (filter?.dateTo && d > filter.dateTo) return false
    return true
  }
  const filtered = tickets.filter(t => inRange(t.soldAt))
  const revenue = filtered
    .filter(t => t.status !== 'REFUNDED')
    .reduce((s, t) => s + t.pricePaid, 0)
  const refundedAmount = filtered
    .filter(t => t.status === 'REFUNDED')
    .reduce((s, t) => s + t.pricePaid, 0)
  return {
    ticketsSold:     filtered.length,
    ticketsScanned:  filtered.filter(t => t.status === 'SCANNED').length,
    ticketsRefunded: filtered.filter(t => t.status === 'REFUNDED').length,
    revenue:         revenue + refundedAmount,
    netRevenue:      revenue,
  }
}

export interface SellerRow {
  sellerUserId: string
  sellerName: string
  ticketsSold: number
  revenue: number
}

export function salesBySeller(filter?: { hotelId?: string; dateFrom?: string; dateTo?: string }): SellerRow[] {
  const tickets = listTickets({ hotelId: filter?.hotelId })
  const inRange = (iso: string): boolean => {
    const d = iso.split('T')[0]
    if (filter?.dateFrom && d < filter.dateFrom) return false
    if (filter?.dateTo && d > filter.dateTo) return false
    return true
  }
  const filtered = tickets.filter(t => inRange(t.soldAt) && t.status !== 'REFUNDED')
  const by = new Map<string, SellerRow>()
  for (const t of filtered) {
    const cur = by.get(t.sellerUserId) ?? {
      sellerUserId: t.sellerUserId,
      sellerName: t.sellerName,
      ticketsSold: 0,
      revenue: 0,
    }
    cur.ticketsSold += 1
    cur.revenue += t.pricePaid
    by.set(t.sellerUserId, cur)
  }
  return [...by.values()].sort((a, b) => b.revenue - a.revenue)
}

// ─── QR payload helpers ────────────────────────────────────────────────────

/**
 * Build the URL that the QR encodes. When scanned by a phone camera it deep-
 * links into the platform's scan tab with `?scan=<qrId>.<check>`.
 */
export function buildQrPayload(ticket: Ticket, origin: string): string {
  return `${origin}/platform?scan=${ticket.qrId}.${ticket.check}`
}

interface ParsedQr {
  qrId: string
  check?: string
}

export function parseQrPayload(raw: string): ParsedQr | null {
  if (!raw) return null
  let value = raw.trim()
  // If it's a URL with ?scan=…, pull the param.
  try {
    const url = new URL(value)
    const scan = url.searchParams.get('scan')
    if (scan) value = scan
  } catch { /* not a URL, fall through */ }
  // Split off the check suffix if present.
  const [qrId, check] = value.split('.')
  if (!qrId || qrId.length < 8) return null
  return { qrId, check }
}

// ─── Formatting ────────────────────────────────────────────────────────────

function formatRelative(iso?: string): string {
  if (!iso) return 'just now'
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.round(ms / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export function formatEgp(amount: number): string {
  return new Intl.NumberFormat('en', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' EGP'
}
