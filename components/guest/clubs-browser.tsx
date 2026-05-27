// ─── AnimaPro — Guest clubs browser ───────────────────────────────────────────
//
// Lists upcoming ClubNights. The hotelAllocation field on ClubNight is a
// count (tickets reserved for hotel guests), not an allow-list — so every
// upcoming night across every club is visible. Each card opens BuySheet
// pre-filled with the night id and the guest's hotelId from the route.

'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  CLUBS,
  formatEgp,
  getUpcomingNights,
  type ClubNight,
} from '@/lib/club-tickets'
import { BuySheet } from '@/components/guest/buy-sheet'

interface ClubsBrowserProps {
  hotelId: string
}

export function ClubsBrowser({ hotelId }: ClubsBrowserProps): React.ReactElement {
  const { t } = useTranslation()
  const [pendingNight, setPendingNight] = useState<ClubNight | null>(null)
  const [nights, setNights] = useState<ClubNight[]>([])

  // Resolve upcoming nights on mount — getUpcomingNights() defaults to "today"
  // which is fine; we just don't run it during SSR to keep the date stable.
  useEffect(() => {
    setNights(getUpcomingNights())
  }, [])

  if (nights.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-semibold">{t('guest.clubs.empty.title')}</p>
        <p className="text-sm text-muted-foreground mt-1">{t('guest.clubs.empty.body')}</p>
      </div>
    )
  }

  return (
    <section className="space-y-3" aria-label={t('guest.clubs.heading')}>
      <h2 className="text-lg font-bold tracking-tight">{t('guest.clubs.heading')}</h2>
      <ul className="space-y-3">
        {nights.map(n => {
          const club = CLUBS.find(c => c.id === n.clubId)
          if (!club) return null
          return (
            <li key={n.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className={cn('p-4 text-white bg-gradient-to-br', club.gradient)}>
                <p className="text-mini font-bold uppercase tracking-wide opacity-80">{club.area}</p>
                <h3 className="font-extrabold leading-tight text-lg">{club.name}</h3>
                <p className="text-13 opacity-90 mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {n.theme}
                </p>
              </div>
              <div className="p-4 grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                <dl className="space-y-1.5 text-13">
                  <Row icon={Calendar} k={t('guest.clubs.dateLabel')} v={new Date(n.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })} />
                  <Row icon={Clock} k={t('guest.clubs.doorsLabel')} v={`${n.doorsOpen} – ${n.doorsClose}`} />
                  <Row k={t('guest.clubs.priceLabel')} v={formatEgp(n.pricePerTicket)} />
                </dl>
                <Button onClick={() => setPendingNight(n)} className="h-10 px-4 text-13 font-semibold">
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
        />
      )}
    </section>
  )
}

function Row({ icon: Icon, k, v }: { icon?: React.ElementType; k: string; v: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <span className="w-3.5" />}
      <span className="text-muted-foreground w-14">{k}</span>
      <span className="text-foreground font-semibold">{v}</span>
    </div>
  )
}
