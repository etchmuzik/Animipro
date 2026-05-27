// ─── AnimaPro — Tickets · Sell tab ──────────────────────────────────────────
//
// Three-step sale: pick a club night → guest details + payment → review.
// On submit, sells the ticket and renders the issued <TicketCard> with QR.

'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, CreditCard, Banknote, BedDouble, Wallet, RotateCcw, Users, Ticket as TicketIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CLUBS,
  formatEgp,
  getClubNight,
  getNightsForClub,
  getUpcomingNights,
  sellTicket,
  type PaymentMethod,
  type Ticket,
} from '@/lib/club-tickets'
import type { AppUser } from '@/lib/roles'
import { TicketCard } from './ticket-card'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'CASH',        label: 'Cash',         icon: Banknote },
  { value: 'CARD',        label: 'Card',         icon: CreditCard },
  { value: 'ROOM_CHARGE', label: 'Room charge',  icon: BedDouble },
  { value: 'WALLET',      label: 'Wallet / IPay',icon: Wallet },
]

interface SellPanelProps {
  currentUser: AppUser
}

export function SellPanel({ currentUser }: SellPanelProps): React.ReactElement {
  const [step, setStep] = useState<'pick' | 'details' | 'done'>('pick')
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)
  const [selectedNightId, setSelectedNightId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestRoom, setGuestRoom] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null)

  const upcomingNights = useMemo(() => getUpcomingNights(), [])
  const clubNights = useMemo(() => selectedClubId ? getNightsForClub(selectedClubId) : upcomingNights,
    [selectedClubId, upcomingNights])
  const night = selectedNightId ? getClubNight(selectedNightId) : null
  const pricePerTicket = night?.pricePerTicket ?? 0
  const total = pricePerTicket * guestCount

  function resetAll(): void {
    setStep('pick')
    setSelectedClubId(null)
    setSelectedNightId(null)
    setGuestName('')
    setGuestRoom('')
    setGuestCount(1)
    setPaymentMethod('CASH')
    setIssuedTicket(null)
  }

  function handleSubmit(): void {
    if (!night || !guestName.trim()) return
    const t = sellTicket({
      clubNightId: night.id,
      guestName,
      guestRoom,
      guestCount,
      pricePaid: total,
      paymentMethod,
      sellerUserId: currentUser.id,
      sellerName: currentUser.name,
      hotelId: currentUser.hotelId,
    })
    setIssuedTicket(t)
    setStep('done')
  }

  // ─── Step 3: issued ticket ─────────────────────────────────────────────────
  if (step === 'done' && issuedTicket) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-eyebrow">Ticket issued</p>
            <h2 className="text-xl font-bold text-foreground">Hand this to the guest 👋</h2>
          </div>
          <Button size="sm" variant="outline" onClick={resetAll} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Sell another
          </Button>
        </div>
        <TicketCard ticket={issuedTicket} onAfterAction={resetAll} />
      </div>
    )
  }

  // ─── Layout: night list (left) → form (right) ─────────────────────────────
  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
      {/* Left: pick night */}
      <div>
        <p className="text-eyebrow mb-2">Step 1 — pick a club night</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => { setSelectedClubId(null); setSelectedNightId(null) }}
            className={cn(
              'px-3 py-1.5 rounded-full text-mini font-semibold border transition-colors',
              !selectedClubId ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            All clubs
          </button>
          {CLUBS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSelectedClubId(c.id); setSelectedNightId(null) }}
              className={cn(
                'px-3 py-1.5 rounded-full text-mini font-semibold border transition-colors',
                selectedClubId === c.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {clubNights.map(cn0 => {
            const isSelected = selectedNightId === cn0.id
            const club = CLUBS.find(c => c.id === cn0.clubId)
            if (!club) return null
            return (
              <button
                key={cn0.id}
                type="button"
                onClick={() => { setSelectedNightId(cn0.id); setStep('details') }}
                className={cn(
                  'group w-full text-left rounded-lg border overflow-hidden transition-colors',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-card/80 hover:border-border/80'
                )}
              >
                <div className="flex items-stretch">
                  <span className={cn('w-1.5 shrink-0 bg-gradient-to-b', club.gradient)} aria-hidden="true" />
                  <div className="flex-1 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-bold text-foreground">{club.name}</p>
                      <span className="text-mini text-muted-foreground">{club.area}</span>
                    </div>
                    <p className="text-mini text-muted-foreground mt-0.5">{cn0.theme}</p>
                    <div className="flex items-center justify-between mt-2 text-13">
                      <span className="text-foreground">
                        <span className="font-semibold">{new Date(cn0.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="text-muted-foreground"> · {cn0.doorsOpen}</span>
                      </span>
                      <span className="font-bold text-primary">{formatEgp(cn0.pricePerTicket)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground self-center mr-2 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: details + total + submit */}
      <div className="space-y-4">
        {!night ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <TicketIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Pick a club night on the left to start the sale.</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-eyebrow mb-2">Step 2 — guest & payment</p>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div>
                  <label className="text-mini font-semibold text-muted-foreground mb-1 block">Guest name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Anna Müller"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-mini font-semibold text-muted-foreground mb-1 block">Room (optional)</label>
                    <input
                      type="text"
                      value={guestRoom}
                      onChange={e => setGuestRoom(e.target.value)}
                      placeholder="412"
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-mini font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                      <Users className="w-3 h-3" /> Guests
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="h-9 w-9 rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={guestCount <= 1}
                        aria-label="One fewer guest"
                      >−</button>
                      <span className="flex-1 h-9 grid place-items-center font-mono font-bold text-foreground">{guestCount}</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                        className="h-9 w-9 rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={guestCount >= 20}
                        aria-label="One more guest"
                      >+</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-mini font-semibold text-muted-foreground mb-1 block">Payment method</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm.value}
                        type="button"
                        onClick={() => setPaymentMethod(pm.value)}
                        className={cn(
                          'flex items-center gap-2 h-9 px-3 rounded-md border text-mini font-semibold transition-colors',
                          paymentMethod === pm.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                        )}
                      >
                        <pm.icon className="w-3.5 h-3.5" />
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-mini text-muted-foreground">{guestCount} × {formatEgp(pricePerTicket)}</span>
                <span className="text-2xl font-black text-foreground tabular-nums">{formatEgp(total)}</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!guestName.trim()}
                className="w-full h-11 text-base font-bold gap-2"
              >
                <TicketIcon className="w-4 h-4" />
                Issue ticket — {formatEgp(total)}
              </Button>
              <p className="text-tiny text-muted-foreground text-center mt-2">
                Logged under {currentUser.name} · QR generated client-side
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
