// ─── Animipro — Guest clubs browser ───────────────────────────────────────────
//
// Lists upcoming ClubNights. The hotelAllocation field on ClubNight is a
// count (tickets reserved for hotel guests), not an allow-list — so every
// upcoming night across every club is visible. Each card opens BuySheet
// pre-filled with the night id and the guest's hotelId from the route.
//
// Visual: photo hero with the club's brand gradient overlay, big display
// type for the club name, theme as a glassy pill, price as the dominant
// element in the body. Built so this surface is the first impression and
// it has to feel like a night out, not a CRM.

'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MoonStar, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  CLUBS,
  getUpcomingNights,
  type ClubNight,
} from '@/lib/club-tickets'
import { formatPriceNumber, getCurrencySymbol } from '@/lib/currency'
import { BuySheet } from '@/components/guest/buy-sheet'
import { CurrencySwitcher, useCurrency } from '@/components/guest/currency-switcher'

interface ClubsBrowserProps {
  hotelId: string
  onViewTickets?: () => void
}

export function ClubsBrowser({ hotelId, onViewTickets }: ClubsBrowserProps): React.ReactElement {
  const { t } = useTranslation()
  const currency = useCurrency()
  const [pendingNight, setPendingNight] = useState<ClubNight | null>(null)
  const [nights, setNights] = useState<ClubNight[]>([])

  useEffect(() => {
    setNights(getUpcomingNights())
  }, [])

  if (nights.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <MoonStar className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <div>
          <p className="font-semibold">{t('guest.clubs.empty.title')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('guest.clubs.empty.body')}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-5" aria-label={t('guest.clubs.heading')}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
            {t('guest.clubs.heading')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('guest.clubs.subheading')}</p>
        </div>
        <CurrencySwitcher />
      </header>

      <ul className="space-y-5">
        {nights.map(n => {
          const club = CLUBS.find(c => c.id === n.clubId)
          if (!club) return null
          const dateLabel = new Date(n.date).toLocaleDateString('en', {
            weekday: 'long', day: 'numeric', month: 'short',
          })
          return (
            <li
              key={n.id}
              className="group overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-foreground/10"
            >
              {/* Hero — photo with brand-gradient overlay + glassy theme pill */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={club.image}
                  alt={club.name}
                  loading="lazy"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
                />
                {/* Brand-gradient wash — multiply blend so photo stays alive */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br mix-blend-multiply opacity-80',
                  club.gradient,
                )} />
                {/* Dark base for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Floating theme pill */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 text-white text-mini font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {n.theme}
                </div>

                {/* Name block — bottom-left, big editorial */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-tiny font-bold uppercase tracking-[0.18em] opacity-80">{club.area}</p>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mt-1">
                    {club.name}
                  </h3>
                </div>
              </div>

              {/* Body — date chips + price + CTA */}
              <div className="p-4 sm:p-5 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip icon={Calendar} text={dateLabel} />
                    <Chip icon={Clock} text={`${n.doorsOpen}–${n.doorsClose}`} />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    {currency !== 'EGP' && (
                      <span className="font-display text-xl sm:text-2xl font-extrabold leading-none text-muted-foreground tracking-tight">
                        {getCurrencySymbol(currency)}
                      </span>
                    )}
                    <span className="font-display text-2xl sm:text-3xl font-extrabold leading-none tabular-nums tracking-tight">
                      {formatPriceNumber(n.pricePerTicket, currency)}
                    </span>
                    <span className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
                      {currency === 'EGP' ? `EGP ${t('guest.clubs.perTicket')}` : t('guest.clubs.perTicket')}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setPendingNight(n)}
                  className="h-11 px-6 font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  {t('guest.clubs.buyCta')}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      {pendingNight && (
        <BuySheet
          night={pendingNight}
          hotelId={hotelId}
          onClose={() => setPendingNight(null)}
          onViewTickets={onViewTickets}
        />
      )}
    </section>
  )
}

function Chip({ icon: Icon, text }: { icon: React.ElementType; text: string }): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground/80 text-mini font-semibold">
      <Icon className="w-3 h-3" />
      {text}
    </span>
  )
}
