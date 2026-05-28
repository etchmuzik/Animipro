// ─── Animipro — Issued ticket card (with QR + print button) ─────────────────
//
// Renders a freshly sold ticket: club / night / guest details + a generated
// QR image. The print button opens a clean print-friendly view in a new
// window — the guest gets a paper or saved-PDF ticket they bring to the door.

'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Calendar, Clock, MapPin, User, Printer, Copy, Check, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { getBrand, subscribe as subscribeBrand } from '@/lib/brand-store'
import {
  buildQrPayload,
  formatEgp,
  getClub,
  getClubNight,
  refundTicket,
  type Ticket,
} from '@/lib/club-tickets'

interface TicketCardProps {
  ticket: Ticket
  onAfterAction?: () => void
  /** Show the refund button (sellers + admins). Default true. */
  canRefund?: boolean
}

export function TicketCard({ ticket, onAfterAction, canRefund = true }: TicketCardProps): React.ReactElement | null {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  // Live brand hex — QR + print template need a real color string. Subscribing
  // keeps the QR/print honoring the white-label colour the buyer chose.
  const [brandHex, setBrandHex] = useState<string>(() => getBrand().primaryHex)
  useEffect(() => {
    const refresh = (): void => setBrandHex(getBrand().primaryHex)
    refresh()
    return subscribeBrand(refresh)
  }, [])
  const club = getClub(getClubNight(ticket.clubNightId)?.clubId ?? '')
  const night = getClubNight(ticket.clubNightId)

  const payload = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return buildQrPayload(ticket, window.location.origin)
  }, [ticket])

  // Generate the QR as a data-URL once payload is ready. Re-runs on brand change.
  useEffect(() => {
    if (!payload) return
    let cancelled = false
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: { dark: brandHex, light: '#ffffff' },
    })
      .then(url => { if (!cancelled) setQrUrl(url) })
      .catch(() => { if (!cancelled) setQrUrl(null) })
    return () => { cancelled = true }
  }, [payload, brandHex])

  if (!club || !night) return null

  function handleCopy(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${ticket.qrId}.${ticket.check}`).then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      }).catch(() => { /* swallow */ })
    }
  }

  function handlePrint(): void {
    if (typeof window === 'undefined' || !qrUrl || !club || !night) return
    const w = window.open('', '_blank', 'width=420,height=720')
    if (!w) return
    const dateStr = new Date(night.date).toLocaleDateString('en', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    // Print template needs literal color strings — derive a darker shade for
    // the gradient end from the live brand hex.
    const heroStart = brandHex
    const heroEnd = darkenHex(brandHex, 0.15)
    w.document.write(`
      <!DOCTYPE html><html><head><title>Ticket — ${escapeHtml(club.name)}</title>
      <meta charset="utf-8"/>
      <style>
        body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
        .ticket { max-width: 360px; margin: 24px auto; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
        .hero { padding: 24px; color: #fff; background: linear-gradient(135deg, ${heroStart}, ${heroEnd}); }
        .hero h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
        .hero p  { margin: 0; opacity: 0.9; font-size: 13px; }
        .body { padding: 20px 24px; }
        .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
        .row:last-child { border: 0; }
        .row .k { color: #64748b; font-weight: 500; }
        .row .v { color: #0f172a; font-weight: 700; text-align: right; }
        .qr-wrap { text-align: center; padding: 16px 24px 24px; }
        .qr-wrap img { width: 240px; height: 240px; }
        .qr-wrap p { font-size: 11px; color: #64748b; margin: 8px 0 0; }
        .footer { padding: 12px 24px 20px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px dashed #e2e8f0; }
        @media print { body { background: #fff; } .ticket { box-shadow: none; margin: 0 auto; } }
      </style></head><body onload="window.print()">
        <div class="ticket">
          <div class="hero">
            <h1>${escapeHtml(club.name)}</h1>
            <p>${escapeHtml(night.theme)}</p>
          </div>
          <div class="body">
            <div class="row"><span class="k">Guest</span><span class="v">${escapeHtml(ticket.guestName)}${ticket.guestRoom ? ' · Room ' + escapeHtml(ticket.guestRoom) : ''}</span></div>
            <div class="row"><span class="k">Date</span><span class="v">${escapeHtml(dateStr)}</span></div>
            <div class="row"><span class="k">Doors</span><span class="v">${night.doorsOpen} – ${night.doorsClose}</span></div>
            <div class="row"><span class="k">Venue</span><span class="v">${escapeHtml(club.area)}</span></div>
            <div class="row"><span class="k">Guests</span><span class="v">${ticket.guestCount}</span></div>
            <div class="row"><span class="k">Paid</span><span class="v">${formatEgp(ticket.pricePaid)}</span></div>
          </div>
          <div class="qr-wrap">
            <img alt="QR" src="${qrUrl}"/>
            <p>Show this code at the door · ${ticket.qrId.slice(0, 8).toUpperCase()}.${ticket.check.toUpperCase()}</p>
          </div>
          <div class="footer">
            Issued ${new Date(ticket.soldAt).toLocaleString('en')} by ${escapeHtml(ticket.sellerName)}<br/>
            Powered by Animipro · animipro.online
          </div>
        </div>
      </body></html>
    `)
    w.document.close()
  }

  function handleRefund(): void {
    const reason = window.prompt('Refund reason? (visible in the sales log)') ?? ''
    if (!reason) return
    refundTicket(ticket.qrId, reason)
    onAfterAction?.()
  }

  const statusDomainStatus: { kind: 'success' | 'progress' | 'danger'; label: string } =
    ticket.status === 'SCANNED'
      ? { kind: 'success', label: 'Scanned in' }
      : ticket.status === 'REFUNDED'
        ? { kind: 'danger', label: 'Refunded' }
        : { kind: 'progress', label: 'Active' }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Hero band — uses the club's gradient as the brand cue */}
      <div className={cn('p-5 text-white bg-gradient-to-br', club.gradient)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-mini font-bold uppercase tracking-wide opacity-80">{club.area}</p>
            <h3 className="text-lg font-extrabold leading-tight">{club.name}</h3>
            <p className="text-sm opacity-90 mt-0.5">{night.theme}</p>
          </div>
          <StatusBadge kind={statusDomainStatus.kind} label={statusDomainStatus.label} size="sm" tone="light" />
        </div>
      </div>

      {/* Body — guest + payment details + QR */}
      <div className="p-4 sm:p-5 grid gap-4 sm:grid-cols-[1fr_auto] items-start">
        <dl className="space-y-2 text-13">
          <Row icon={User}     k="Guest"  v={`${ticket.guestName}${ticket.guestRoom ? ' · Room ' + ticket.guestRoom : ''}`} />
          <Row icon={Calendar} k="Date"   v={new Date(night.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })} />
          <Row icon={Clock}    k="Doors"  v={`${night.doorsOpen} – ${night.doorsClose}`} />
          <Row icon={MapPin}   k="Venue"  v={club.area} />
          <Row              k="Guests" v={`${ticket.guestCount}`} />
          <Row              k="Paid"   v={`${formatEgp(ticket.pricePaid)} (${ticket.paymentMethod.replace('_', ' ').toLowerCase()})`} />
        </dl>

        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg bg-white p-2 ring-1 ring-border">
            {qrUrl
              ? <img src={qrUrl} alt="Ticket QR" className="w-full h-full object-contain" />
              : <div className="w-full h-full bg-muted animate-pulse rounded" />
            }
          </div>
          <code className="text-tiny text-muted-foreground font-mono">{ticket.qrId.slice(0, 8).toUpperCase()}.{ticket.check.toUpperCase()}</code>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <Button size="sm" className="h-8 gap-1.5 text-13" onClick={handlePrint} disabled={!qrUrl}>
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-13" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy code'}
        </Button>
        {canRefund && ticket.status === 'ACTIVE' && (
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-13 ml-auto border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={handleRefund}>
            <Ban className="w-3.5 h-3.5" /> Refund
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({ icon: Icon, k, v }: { icon?: React.ElementType; k: string; v: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <span className="w-3.5" />}
      <span className="text-muted-foreground w-16">{k}</span>
      <span className="text-foreground font-medium truncate">{v}</span>
    </div>
  )
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
}

// Multiply each RGB channel by (1 - amount) to produce a darker shade.
// Used by the print gradient end-stop so the hero band looks 3-dimensional.
function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return hex
  const factor = Math.max(0, Math.min(1, 1 - amount))
  const ch = (i: number): string => {
    const v = Math.round(parseInt(full.slice(i, i + 2), 16) * factor)
    return v.toString(16).padStart(2, '0')
  }
  return `#${ch(0)}${ch(2)}${ch(4)}`
}
