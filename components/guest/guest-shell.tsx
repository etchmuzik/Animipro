// ─── AnimaPro — Guest shell (per-hotel) ───────────────────────────────────────
//
// Top-level client tree for /guest/[hotelId]. Renders a slim topbar (hotel
// name + language switcher) and a three-tab content area: Today's activities,
// Tonight's clubs, My tickets. Stateless beyond the active-tab toggle.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Sparkles, Ticket } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'
import { TodayFeed } from '@/components/guest/today-feed'
import { ClubsBrowser } from '@/components/guest/clubs-browser'
import { MyTickets } from '@/components/guest/my-tickets'

type Tab = 'today' | 'clubs' | 'tickets'

interface GuestShellProps {
  hotelId: string
  hotelName: string
}

export function GuestShell({ hotelId, hotelName }: GuestShellProps): React.ReactElement {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">

      {/* Topbar — hotel name + language switcher only. No staff chrome. */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 h-14 flex items-center gap-3">
          <Link
            href="/guest"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-13"
            aria-label={t('guest.shell.changeHotel')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('guest.shell.changeHotel')}</span>
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <p className="font-semibold text-13 truncate">{hotelName}</p>
            <p className="text-tiny text-muted-foreground uppercase tracking-wide leading-none">
              {t('guest.shell.eyebrow')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Tab strip */}
        <nav
          aria-label={t('guest.shell.sections')}
          className="max-w-3xl mx-auto px-2 sm:px-3 flex border-t border-border/50"
        >
          <TabButton active={tab === 'today'} onClick={() => setTab('today')} icon={CalendarDays} label={t('guest.tabs.today')} />
          <TabButton active={tab === 'clubs'} onClick={() => setTab('clubs')} icon={Sparkles} label={t('guest.tabs.clubs')} />
          <TabButton active={tab === 'tickets'} onClick={() => setTab('tickets')} icon={Ticket} label={t('guest.tabs.tickets')} />
        </nav>
      </header>

      {/* Active panel */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-5 py-5">
        {tab === 'today' && <TodayFeed hotelId={hotelId} />}
        {tab === 'clubs' && <ClubsBrowser hotelId={hotelId} />}
        {tab === 'tickets' && <MyTickets />}
      </main>

      <footer className="border-t border-border py-4 text-center text-tiny text-muted-foreground">
        {t('guest.footer.poweredBy')} <Link href="/" className="text-primary hover:underline">AnimaPro</Link>
      </footer>
    </div>
  )
}

function TabButton({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }): React.ReactElement {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-13 font-semibold border-b-2 transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
