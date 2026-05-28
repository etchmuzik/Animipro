// ─── Animipro — Tickets · Sales report tab (managers only) ──────────────────
//
// Today's revenue totals + per-seller leaderboard + recent tickets table.
// Date range picker (today / week / all-time).

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Ticket as TicketIcon, TrendingUp, ScanLine, Ban, Trophy } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import {
  formatEgp,
  getClub,
  getClubNight,
  listTickets,
  salesBySeller,
  subscribe,
  summarizeSales,
  type Ticket,
} from '@/lib/club-tickets'
import type { AppUser } from '@/lib/roles'

type RangeKey = 'today' | 'week' | 'all'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'Last 7 days' },
  { key: 'all',   label: 'All time' },
]

function rangeBounds(key: RangeKey): { dateFrom?: string; dateTo?: string } {
  const today = new Date()
  const ymd = (d: Date): string => d.toISOString().split('T')[0]
  if (key === 'today') {
    const t = ymd(today)
    return { dateFrom: t, dateTo: t }
  }
  if (key === 'week') {
    const from = new Date(today)
    from.setDate(today.getDate() - 6)
    return { dateFrom: ymd(from), dateTo: ymd(today) }
  }
  return {}
}

interface SalesPanelProps {
  currentUser: AppUser
}

export function SalesPanel({ currentUser }: SalesPanelProps): React.ReactElement {
  const [range, setRange] = useState<RangeKey>('today')
  const [, tick] = useState(0)

  // Re-render when a ticket is sold / scanned anywhere in the app.
  useEffect(() => subscribe(() => tick(n => n + 1)), [])

  const bounds = useMemo(() => rangeBounds(range), [range])
  const summary = useMemo(() => summarizeSales({ hotelId: currentUser.hotelId, ...bounds }),
    [currentUser.hotelId, bounds])
  const leaderboard = useMemo(() => salesBySeller({ hotelId: currentUser.hotelId, ...bounds }),
    [currentUser.hotelId, bounds])
  const recent = useMemo(() => {
    const all = listTickets({ hotelId: currentUser.hotelId })
    return all
      .filter(t => {
        const d = t.soldAt.split('T')[0]
        if (bounds.dateFrom && d < bounds.dateFrom) return false
        if (bounds.dateTo && d > bounds.dateTo) return false
        return true
      })
      .sort((a, b) => b.soldAt.localeCompare(a.soldAt))
      .slice(0, 25)
  }, [currentUser.hotelId, bounds])

  return (
    <div className="space-y-5">
      {/* Range chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-eyebrow">Range</span>
        {RANGES.map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-mini font-semibold border transition-colors',
              range === r.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={TicketIcon}   label="Tickets sold"     value={summary.ticketsSold.toString()}                       accent="text-primary" />
        <Kpi icon={ScanLine}     label="Scanned in"       value={`${summary.ticketsScanned} / ${summary.ticketsSold}`} accent="text-green-400" />
        <Kpi icon={Ban}          label="Refunded"         value={summary.ticketsRefunded.toString()}                   accent="text-red-400" />
        <Kpi icon={TrendingUp}   label="Net revenue"      value={formatEgp(summary.netRevenue)}                        accent="text-amber-300" />
      </div>

      {/* Leaderboard + recent table */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold text-foreground">Top sellers</h3>
            <span className="ml-auto text-mini text-muted-foreground">{leaderboard.length}</span>
          </div>
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-mini text-muted-foreground">
              No sales in this range yet.
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {leaderboard.map((row, i) => (
                <li key={row.sellerUserId} className="px-4 py-3 flex items-center gap-3">
                  <span className={cn(
                    'shrink-0 grid place-items-center w-7 h-7 rounded-full font-bold text-13',
                    i === 0 ? 'bg-amber-400/20 text-amber-300' :
                    i === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                    i === 2 ? 'bg-orange-700/30 text-orange-300' :
                    'bg-muted text-muted-foreground'
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-13 font-semibold text-foreground truncate">{row.sellerName}</p>
                    <p className="text-mini text-muted-foreground">{row.ticketsSold} ticket{row.ticketsSold === 1 ? '' : 's'}</p>
                  </div>
                  <span className="text-13 font-bold text-foreground tabular-nums">{formatEgp(row.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Recent tickets</h3>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-mini text-muted-foreground">
              No tickets in this range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-13">
                <thead>
                  <tr className="text-left text-mini text-muted-foreground border-b border-border">
                    <th className="px-3 py-2 font-medium">Sold</th>
                    <th className="px-3 py-2 font-medium">Guest</th>
                    <th className="px-3 py-2 font-medium">Club</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(t => <RecentRow key={t.id} ticket={t} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecentRow({ ticket }: { ticket: Ticket }): React.ReactElement {
  const night = getClubNight(ticket.clubNightId)
  const club = night ? getClub(night.clubId) : null
  const soldTime = new Date(ticket.soldAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
  const kind = ticket.status === 'SCANNED' ? 'success' : ticket.status === 'REFUNDED' ? 'danger' : 'progress'
  const label = ticket.status === 'SCANNED' ? 'Scanned' : ticket.status === 'REFUNDED' ? 'Refunded' : 'Active'
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/40">
      <td className="px-3 py-2 text-muted-foreground tabular-nums">{soldTime}</td>
      <td className="px-3 py-2 text-foreground font-medium truncate max-w-[12ch]">{ticket.guestName}</td>
      <td className="px-3 py-2 text-muted-foreground truncate max-w-[18ch]">{club?.name ?? '—'}</td>
      <td className="px-3 py-2"><StatusBadge kind={kind} label={label} size="sm" /></td>
      <td className="px-3 py-2 text-right font-bold text-foreground tabular-nums">{formatEgp(ticket.pricePaid)}</td>
    </tr>
  )
}

function Kpi({ icon: Icon, label, value, accent }: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-3.5 h-3.5', accent ?? 'text-muted-foreground')} />
        <span className="text-mini font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn('text-2xl font-black tabular-nums mt-1', accent ?? 'text-foreground')}>{value}</p>
    </div>
  )
}
