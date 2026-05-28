// ─── Animipro — Guest "My tickets" list ───────────────────────────────────────
//
// Filters the shared club-tickets store down to tickets bought from this
// browser (sellerUserId starts with `guest:`, written by buy-sheet.tsx via
// guestSellerUserId()). Subscribes to the store so a fresh purchase from the
// "Buy" tab appears here on the next render.

'use client'

import { useEffect, useState } from 'react'
import { Ticket as TicketIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import {
  listTickets,
  subscribe as subscribeTickets,
  type Ticket,
} from '@/lib/club-tickets'
import { guestSellerUserId } from '@/lib/guest-session'
import { TicketCard } from '@/components/modules/tickets/ticket-card'

interface MyTicketsProps {
  onBrowseClubs?: () => void
}

export function MyTickets({ onBrowseClubs }: MyTicketsProps): React.ReactElement {
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const refresh = (): void => {
      const sellerId = guestSellerUserId()
      const mine = listTickets()
        .filter(tk => tk.sellerUserId === sellerId)
        .sort((a, b) => b.soldAt.localeCompare(a.soldAt))
      setTickets(mine)
    }
    refresh()
    return subscribeTickets(refresh)
  }, [])

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <TicketIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <div>
          <p className="font-semibold">{t('guest.tickets.empty.title')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('guest.tickets.empty.body')}</p>
        </div>
        {onBrowseClubs && (
          <Button variant="outline" size="sm" onClick={onBrowseClubs}>
            {t('guest.tickets.empty.cta')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <section className="space-y-3" aria-label={t('guest.tickets.heading')}>
      <h2 className="text-lg font-bold tracking-tight">{t('guest.tickets.heading')}</h2>
      <ul className="space-y-3">
        {tickets.map(tk => (
          <li key={tk.id}>
            <TicketCard ticket={tk} canRefund={false} />
          </li>
        ))}
      </ul>
    </section>
  )
}
