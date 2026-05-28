// ─── Animipro — Guest buy sheet ───────────────────────────────────────────────
//
// Simulated checkout. Reuses sellTicket() unchanged — the staff sales-panel +
// door scanner work transparently with guest-bought tickets. The seller is
// tagged "guest:<sessionId>" so my-tickets.tsx can filter the shared store
// down to "tickets I bought from this browser".
//
// Decision locked by the user: all four payment methods (CASH / CARD / WALLET
// / ROOM_CHARGE) are visible and simulate success. No real payment
// processor.

'use client'

import { useState } from 'react'
import { X, CreditCard, Banknote, Wallet, BedDouble, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  CLUBS,
  sellTicket,
  type ClubNight,
  type PaymentMethod,
  type Ticket,
} from '@/lib/club-tickets'
import { formatPrice } from '@/lib/currency'
import { guestSellerUserId } from '@/lib/guest-session'
import { TicketCard } from '@/components/modules/tickets/ticket-card'
import { CurrencySwitcher, useCurrency } from '@/components/guest/currency-switcher'

interface BuySheetProps {
  night: ClubNight
  hotelId: string
  onClose: () => void
  onViewTickets?: () => void
}

const PAY_METHODS: { value: PaymentMethod; icon: React.ElementType; key: string }[] = [
  { value: 'CARD',        icon: CreditCard, key: 'guest.buy.pay.card' },
  { value: 'WALLET',      icon: Wallet,     key: 'guest.buy.pay.wallet' },
  { value: 'CASH',        icon: Banknote,   key: 'guest.buy.pay.cash' },
  { value: 'ROOM_CHARGE', icon: BedDouble,  key: 'guest.buy.pay.room' },
]

export function BuySheet({ night, hotelId, onClose, onViewTickets }: BuySheetProps): React.ReactElement {
  const { t } = useTranslation()
  const currency = useCurrency()
  const club = CLUBS.find(c => c.id === night.clubId)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [count, setCount] = useState(1)
  const [pay, setPay] = useState<PaymentMethod>('CARD')
  const [processing, setProcessing] = useState(false)
  const [confirmed, setConfirmed] = useState<Ticket | null>(null)

  const total = night.pricePerTicket * count
  const canSubmit = name.trim().length >= 2 && count >= 1 && !processing

  function submit(): void {
    if (!canSubmit) return
    setProcessing(true)
    // Simulated processing delay so the "paying…" state is visible. No real
    // payment provider — all methods land on the same success path.
    window.setTimeout(() => {
      const ticket = sellTicket({
        clubNightId:  night.id,
        guestName:    name.trim(),
        guestRoom:    room.trim() || undefined,
        guestCount:   count,
        pricePaid:    total,
        paymentMethod: pay,
        sellerUserId: guestSellerUserId(),
        sellerName:   'Guest self-purchase',
        hotelId,
      })
      setProcessing(false)
      setConfirmed(ticket)
    }, 700)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('guest.buy.title')}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-bold text-13 truncate">{club?.name ?? night.clubId}</p>
            <p className="text-tiny text-muted-foreground truncate">{night.theme}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('guest.buy.close')}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmed
          ? (
            <div className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{t('guest.buy.confirmedTitle')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('guest.buy.confirmedSubtitle')}</p>
              </div>
              <TicketCard ticket={confirmed} canRefund={false} />
              <p className="text-tiny text-muted-foreground text-center">{t('guest.buy.screenshotHint')}</p>
              {onViewTickets && (
                <Button className="w-full" onClick={() => { onViewTickets(); onClose() }}>
                  {t('guest.buy.viewTickets')}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={onClose}>
                {t('guest.buy.done')}
              </Button>
            </div>
          )
          : (
            <form
              onSubmit={e => { e.preventDefault(); submit() }}
              className="p-4 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-mini font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="guest-name">
                  {t('guest.buy.nameLabel')}
                </label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('guest.buy.namePlaceholder')}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-13 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-mini font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="guest-room">
                    {t('guest.buy.roomLabel')}
                  </label>
                  <input
                    id="guest-room"
                    type="text"
                    inputMode="numeric"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder={t('guest.buy.roomPlaceholder')}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-13 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-mini font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="guest-count">
                    {t('guest.buy.countLabel')}
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={20}
                    value={count}
                    onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-13 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-mini font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  {t('guest.buy.payLabel')}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {PAY_METHODS.map(({ value, icon: Icon, key }) => {
                    const active = pay === value
                    return (
                      <label
                        key={value}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-md border cursor-pointer transition-all text-13',
                          active
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border text-foreground hover:border-primary/40',
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={value}
                          checked={active}
                          onChange={() => setPay(value)}
                          className="sr-only"
                        />
                        <Icon className="w-4 h-4" />
                        {t(key)}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-mini text-muted-foreground uppercase tracking-wide">
                    {t('guest.buy.currency')}
                  </span>
                  <CurrencySwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mini text-muted-foreground uppercase tracking-wide">
                    {t('guest.buy.totalLabel')}
                  </span>
                  <span className="text-lg font-bold tabular-nums">{formatPrice(total, currency)}</span>
                </div>
              </div>

              <Button type="submit" disabled={!canSubmit} className="w-full h-11 font-semibold">
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('guest.buy.processing')}
                  </span>
                ) : t('guest.buy.confirmCta')}
              </Button>
              <p className="text-tiny text-muted-foreground text-center">
                {t('guest.buy.simNotice')}
              </p>
            </form>
          )}
      </div>
    </div>
  )
}
