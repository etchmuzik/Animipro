// ─── Animipro — Guest "What's on today" feed ──────────────────────────────────
//
// Read-only daily timetable. Source: hotel schedule entries filtered to today,
// sorted by start time. Cards are guest-friendly — no animator contact, no
// status overlays, no edit affordances.

'use client'

import { CalendarX, Clock, MapPin, User } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { getHotelSchedule } from '@/lib/mock-data'

interface TodayFeedProps {
  hotelId: string
}

const ymd = (d: Date): string => d.toISOString().split('T')[0]

export function TodayFeed({ hotelId }: TodayFeedProps): React.ReactElement {
  const { t } = useTranslation()
  const today = ymd(new Date())
  const entries = getHotelSchedule(hotelId)
    .filter(e => e.date === today && e.type === 'ACTIVITY' && e.status !== 'CANCELLED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <CalendarX className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <div>
          <p className="font-semibold">{t('guest.today.empty.title')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('guest.today.empty.body')}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-3" aria-label={t('guest.today.heading')}>
      <h2 className="text-lg font-bold tracking-tight">{t('guest.today.heading')}</h2>
      <ol className="space-y-2">
        {entries.map(e => (
          <li key={e.id} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
            <div className="shrink-0 w-16 text-center">
              <p className="font-mono text-primary font-bold text-13 leading-tight tabular-nums">{e.startTime}</p>
              <p className="text-tiny text-muted-foreground leading-tight tabular-nums">{e.endTime}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-13 leading-snug">{e.activityName ?? e.type}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-mini text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {e.venue}
                </span>
                {e.animatorName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {/* First name only — guests don't need staff full names. */}
                    {e.animatorName.split(' ')[0]}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration(e.startTime, e.endTime)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function duration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return ''
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
