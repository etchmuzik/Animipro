'use client'

import { useEffect, useState } from 'react'
import {
  Users, Calendar, Star, TrendingUp, TrendingDown, Minus,
  CheckCircle2, MessageSquare, Award, AlertCircle, ChevronRight,
  Sparkles, Sun, Moon, Sunset,
} from 'lucide-react'
import { getFeedbackSummary, subscribe as subscribeFeedback } from '@/lib/feedback'
import { getBrand, subscribe as subscribeBrand } from '@/lib/brand-store'
import { useIsDesktop } from '@/lib/use-media-query'
import type { AppUser } from '@/lib/roles'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import {
  WEEKLY_ACTIVITY_DATA, FEEDBACK_TREND_DATA,
  getDashboardStats, getTeamPerformanceData,
  getHotelSchedule, getHotelAnimators, getHotelEvents, getHotelAnnouncements,
  getHotelById,
} from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const fmt = (d: Date) => d.toISOString().split('T')[0]
const today = fmt(new Date())

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-emerald-500',
  LATE: 'bg-amber-500',
  ABSENT: 'bg-red-500',
  SCHEDULED: 'bg-sky-500',
  IN_PROGRESS: 'bg-primary',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-muted-foreground/40',
}

// ─── Time-of-day greeting + glyph ────────────────────────────────────────────
function timeContext(): { greeting: string; icon: React.ElementType; tone: string } {
  const hr = new Date().getHours()
  if (hr < 5)  return { greeting: 'Working late',  icon: Moon,   tone: 'text-indigo-400' }
  if (hr < 12) return { greeting: 'Good morning',  icon: Sun,    tone: 'text-amber-400' }
  if (hr < 17) return { greeting: 'Good afternoon', icon: Sun,    tone: 'text-amber-500' }
  if (hr < 21) return { greeting: 'Good evening',  icon: Sunset, tone: 'text-rose-400' }
  return { greeting: 'Good night', icon: Moon, tone: 'text-indigo-400' }
}

export function DashboardModule({ hotelId, currentUser }: { hotelId: string; currentUser?: AppUser }) {
  const DASHBOARD_STATS       = getDashboardStats(hotelId)
  const TEAM_PERFORMANCE_DATA = getTeamPerformanceData(hotelId)

  const [feedback, setFeedback] = useState(() => getFeedbackSummary())
  useEffect(() => {
    const refresh = () => setFeedback(getFeedbackSummary())
    refresh()
    return subscribeFeedback(refresh)
  }, [])

  const [brandHex, setBrandHex] = useState<string>(() => getBrand().primaryHex)
  useEffect(() => {
    const refresh = (): void => setBrandHex(getBrand().primaryHex)
    refresh()
    return subscribeBrand(refresh)
  }, [])

  const isDesktop = useIsDesktop()
  const chartMargin = isDesktop
    ? { top: 5, right: 10, left: -20, bottom: 5 }
    : { top: 5, right: 6, left: -28, bottom: 5 }
  const yAxisWidth = isDesktop ? 40 : 32
  const teamChartYAxisWidth = isDesktop ? 80 : 56
  const teamChartMargin = isDesktop
    ? { top: 5, right: 15, left: 80, bottom: 5 }
    : { top: 5, right: 8, left: 0, bottom: 5 }

  const guestAvg            = feedback.count > 0 ? feedback.average : DASHBOARD_STATS.guestFeedbackAvg
  const schedule            = getHotelSchedule(hotelId)
  const animators           = getHotelAnimators(hotelId)
  const hotel               = getHotelById(hotelId)
  const todayEntries        = schedule.filter(s => s.date === today)
  const todayCompleted      = todayEntries.filter(e => e.status === 'COMPLETED').length
  const topAnimators        = [...animators].sort((a, b) => b.performance - a.performance).slice(0, 5)
  const upcomingEvents      = getHotelEvents(hotelId).filter(e => e.status !== 'COMPLETED').slice(0, 3)
  const latestAnnouncements = getHotelAnnouncements(hotelId).filter(a => a.isActive).slice(0, 3)

  const tc = timeContext()
  const firstName = currentUser?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6 anim-stagger">

      {/* ─── Editorial hero ─────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 text-mini font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <tc.icon className={cn('w-3.5 h-3.5', tc.tone)} />
            {tc.greeting}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            {tc.greeting}, {firstName}.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            <span className="font-semibold text-foreground tabular-nums">{todayCompleted}</span> of <span className="font-semibold text-foreground tabular-nums">{todayEntries.length}</span> activities done today.
            Team is at <span className="font-semibold text-foreground tabular-nums">{DASHBOARD_STATS.avgPerformance}%</span> performance.
            Guests rating you <span className="font-semibold text-foreground tabular-nums">{guestAvg.toFixed(1)}/5</span>.
          </p>
        </div>
        {/* Headline sparkline — last 7 days of activities */}
        <div className="rounded-2xl bg-card ring-1 ring-border px-5 py-3 min-w-[180px]">
          <p className="text-tiny font-bold uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="font-display text-2xl font-extrabold leading-none tabular-nums mt-1">
            {WEEKLY_ACTIVITY_DATA.reduce((s, d) => s + d.activities, 0)}
          </p>
          <div className="h-8 -mx-2 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_ACTIVITY_DATA}>
                <Line type="monotone" dataKey="activities" stroke={brandHex} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </header>

      {/* ─── Reputation — promoted to hero strip ────────────────────────────── */}
      {hotel && (
        <section aria-label="Guest reputation" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          {/* TripAdvisor — owl green band on top */}
          <article className="relative overflow-hidden rounded-2xl bg-card ring-1 ring-border p-5 flex flex-col gap-3">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#00aa6c]" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00aa6c] flex items-center justify-center">
                  <svg viewBox="0 0 48 48" className="w-5 h-5 fill-white">
                    <circle cx="12" cy="26" r="8"/><circle cx="36" cy="26" r="8"/>
                    <path d="M4 18c0-11 36-11 40 0"/>
                    <circle cx="12" cy="26" r="3.5" fill="#00aa6c"/>
                    <circle cx="36" cy="26" r="3.5" fill="#00aa6c"/>
                  </svg>
                </div>
                <span className="text-mini font-bold uppercase tracking-[0.14em] text-muted-foreground">Tripadvisor</span>
              </div>
              {hotel.tripAdvisorBadge && (
                <Badge
                  variant="soft"
                  size="sm"
                  className="border-transparent"
                  style={{ backgroundColor: 'rgb(0 170 108 / 0.12)', color: '#00aa6c' }}
                >
                  {hotel.tripAdvisorBadge}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold tabular-nums leading-none">{hotel.tripAdvisorRating.toFixed(1)}</span>
              <StarRating rating={hotel.tripAdvisorRating} size="md" />
            </div>
            <div className="flex items-center justify-between text-mini text-muted-foreground mt-auto pt-2 border-t border-border/60">
              <span>{hotel.tripAdvisorReviews.toLocaleString()} reviews</span>
              <span className="flex items-center gap-1 font-semibold">
                {hotel.tripAdvisorRank}
                <TrendIcon trend={hotel.tripAdvisorTrend} />
              </span>
            </div>
          </article>

          {/* Google — multi-color logo, neutral surface */}
          <article className="rounded-2xl bg-card ring-1 ring-border p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-background ring-1 ring-border flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.3 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 20.5-8 20.5-19.5 0-1.3-.1-2.7-.5-4z"/>
                  <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                  <path fill="#FBBC05" d="M24 43.5c5.5 0 10.4-1.8 14.2-5l-6.5-5.3C29.8 34.9 27 36 24 36c-5.7 0-10.3-2.9-11.7-7.5l-6.9 5.3C8.4 39.2 15.5 43.5 24 43.5z"/>
                  <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2.1-1.9 3.9-3.6 5.2l6.5 5.3c3.8-3.5 6.4-8.7 6.4-15 0-1.3-.1-2.7-.5-4z"/>
                </svg>
              </div>
              <span className="text-mini font-bold uppercase tracking-[0.14em] text-muted-foreground">Google</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold tabular-nums leading-none">{hotel.googleRating.toFixed(1)}</span>
              <StarRating rating={hotel.googleRating} size="md" />
            </div>
            <div className="flex items-center justify-between text-mini text-muted-foreground mt-auto pt-2 border-t border-border/60">
              <span>Maps profile</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-500">
                <TrendingUp className="w-3.5 h-3.5" />
                trending
              </span>
            </div>
          </article>

          {/* Booking.com — full-bleed navy band */}
          <article className="relative overflow-hidden rounded-2xl bg-[#003580] text-white p-5 flex flex-col gap-3 ring-1 ring-[#002862]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-[#003580] flex items-center justify-center">
                <span className="font-black text-base">B.</span>
              </div>
              <span className="text-mini font-bold uppercase tracking-[0.14em] text-white/70">Booking.com</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold tabular-nums leading-none">{hotel.bookingRating.toFixed(1)}</span>
              <span className="text-mini text-white/70 font-semibold">/ 10</span>
            </div>
            <Badge
              size="sm"
              className={cn(
                'border-transparent w-fit',
                hotel.bookingRating >= 9 ? 'bg-emerald-500 text-white' : hotel.bookingRating >= 8 ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white',
              )}
            >
              {hotel.bookingRating >= 9 ? 'Exceptional' : hotel.bookingRating >= 8 ? 'Very Good' : 'Good'}
            </Badge>
            <div className="mt-auto pt-2 border-t border-white/15 space-y-1">
              <div className="flex items-center justify-between text-mini">
                <span className="text-white/70">Animation team</span>
                <span className="tabular-nums font-bold">{Math.min(10, hotel.bookingRating + 0.3).toFixed(1)}</span>
              </div>
              <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-white" style={{ width: `${(hotel.bookingRating / 10) * 100}%` }} />
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ─── KPI strip — 4 inline stats, no card-chip-icon pattern ──────────── */}
      <section aria-label="Today's numbers" className="rounded-2xl bg-card ring-1 ring-border divide-y sm:divide-y-0 sm:divide-x divide-border grid grid-cols-2 sm:grid-cols-4">
        <Stat icon={Users}        label="Animators on shift" value={`${DASHBOARD_STATS.activeToday}/${DASHBOARD_STATS.totalAnimators}`} delta="+2 this season" />
        <Stat icon={Calendar}     label="Activities today"   value={String(DASHBOARD_STATS.activitiesScheduled)} delta={`${DASHBOARD_STATS.activitiesCompleted} done`} />
        <Stat icon={Star}         label="Avg performance"    value={`${DASHBOARD_STATS.avgPerformance}%`} delta="+3% vs last week" deltaTone="positive" />
        <Stat icon={CheckCircle2} label="Attendance"         value={`${DASHBOARD_STATS.avgAttendance}%`} delta="today" />
      </section>

      {/* ─── Charts row ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSection title="Weekly activity" defaultOpen={isDesktop} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={isDesktop ? 240 : 200}>
            <AreaChart data={WEEKLY_ACTIVITY_DATA} margin={chartMargin}>
              <defs>
                <linearGradient id="gActivities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brandHex} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={brandHex} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGuests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: isDesktop ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: isDesktop ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={yAxisWidth} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: isDesktop ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={yAxisWidth} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area yAxisId="left" type="monotone" dataKey="activities" stroke={brandHex} fill="url(#gActivities)" strokeWidth={2.5} name="Activities" dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="guests" stroke="#a855f7" fill="url(#gGuests)" strokeWidth={2.5} name="Guests" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 sm:gap-6 mt-3 px-2 flex-wrap text-mini text-muted-foreground">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: brandHex }} /> Activities</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Guests</span>
          </div>
        </ChartSection>

        <ChartSection title="Feedback trend" defaultOpen={isDesktop}>
          <ResponsiveContainer width="100%" height={isDesktop ? 240 : 200}>
            <LineChart data={FEEDBACK_TREND_DATA} margin={chartMargin}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: isDesktop ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: isDesktop ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={yAxisWidth} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="rating" stroke={brandHex} strokeWidth={3} dot={{ r: 4, fill: brandHex, strokeWidth: 0 }} name="Rating" />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      </section>

      {/* ─── Lists row ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Schedule — time-gutter, no card chip */}
        <ListCard title="Today's schedule" badge={todayEntries.length}>
          {todayEntries.length === 0 ? (
            <EmptyRow text="Nothing scheduled today" />
          ) : (
            todayEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors">
                <div className="w-14 shrink-0 text-center">
                  <p className="font-mono text-13 font-bold text-primary tabular-nums leading-tight">{entry.startTime}</p>
                  <p className="text-tiny text-muted-foreground tabular-nums">{entry.endTime}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-13 font-semibold truncate">{entry.activityName ?? entry.type}</p>
                  <p className="text-mini text-muted-foreground truncate">{entry.animatorName} · {entry.venue}</p>
                </div>
                <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[entry.status])} aria-label={entry.status} />
              </div>
            ))
          )}
        </ListCard>

        {/* Team Performance chart */}
        <ChartSection title="Team performance" defaultOpen={isDesktop} bodyClassName="px-2 pb-4 pt-2">
          <ResponsiveContainer width="100%" height={isDesktop ? 240 : 220}>
            <BarChart data={TEAM_PERFORMANCE_DATA} layout="vertical" margin={teamChartMargin}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: isDesktop ? 11 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="team" type="category" tick={{ fontSize: isDesktop ? 11 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={teamChartYAxisWidth} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="performance" fill={brandHex} radius={[0, 6, 6, 0]} name="Performance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Top Performers — ranked, with avatar and medal */}
        <ListCard title="Top performers" iconRight={<Award className="w-4 h-4 text-amber-500" />}>
          {topAnimators.map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors">
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 tabular-nums leading-none',
                i === 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                i === 1 ? 'bg-muted text-muted-foreground' :
                i === 2 ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                'bg-muted text-muted-foreground',
              )}>
                {i + 1}
              </span>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-primary/12 text-primary">
                {a.firstName[0]}{a.lastName[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-13 font-semibold truncate">{a.firstName} {a.lastName}</p>
                <p className="text-mini text-muted-foreground truncate">{a.teamName}</p>
              </div>
              <span className="font-mono text-13 font-bold tabular-nums text-foreground shrink-0">{a.performance}%</span>
            </div>
          ))}
        </ListCard>
      </section>

      {/* ─── Bottom row ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <ListCard title="Upcoming events" badge={upcomingEvents.length}>
          {upcomingEvents.length === 0 ? (
            <EmptyRow text="No upcoming events" />
          ) : (
            upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-4 px-5 py-3 hover:bg-accent/40 transition-colors">
                <div className="text-center bg-primary/10 rounded-lg px-2.5 py-1.5 shrink-0 w-14">
                  <p className="text-tiny font-bold text-primary uppercase">{new Date(ev.date).toLocaleDateString('en', { month: 'short' })}</p>
                  <p className="font-display text-lg font-extrabold text-primary leading-none tabular-nums">{new Date(ev.date).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-13 font-semibold leading-tight">{ev.name}</p>
                  <p className="text-mini text-muted-foreground mt-0.5">{ev.venue} · {ev.startTime}–{ev.endTime}</p>
                  <p className="text-mini text-muted-foreground">{ev.expectedGuests} guests · {ev.assignedAnimators.length} animators</p>
                </div>
                <Badge
                  variant="soft"
                  size="sm"
                  tone={ev.status === 'CONFIRMED' ? 'emerald' : 'primary'}
                  className="shrink-0 uppercase tracking-wide"
                >
                  {ev.status}
                </Badge>
              </div>
            ))
          )}
        </ListCard>

        <ListCard title="Latest announcements">
          {latestAnnouncements.length === 0 ? (
            <EmptyRow text="No announcements" />
          ) : (
            latestAnnouncements.map(ann => (
              <div key={ann.id} className="flex items-start gap-3 px-5 py-3 hover:bg-accent/40 transition-colors">
                <span className={cn(
                  'w-1.5 h-12 rounded-full shrink-0 mt-1',
                  ann.priority === 'URGENT' ? 'bg-red-500' : ann.priority === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500',
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-13 font-semibold leading-tight">{ann.title}</p>
                    {ann.priority === 'URGENT' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  </div>
                  <p className="text-mini text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                  <p className="text-tiny text-muted-foreground/70 mt-1">{ann.authorName} · {new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>
      </section>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
}

function Stat({ icon: Icon, label, value, delta, deltaTone }: {
  icon: React.ElementType; label: string; value: string; delta?: string; deltaTone?: 'positive' | 'neutral'
}) {
  return (
    <div className="p-4 sm:p-5 min-w-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-mini font-semibold uppercase tracking-[0.14em] truncate">{label}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums leading-none mt-2 truncate">{value}</p>
      {delta && (
        <p className={cn(
          'text-mini font-semibold mt-1.5 truncate',
          deltaTone === 'positive' ? 'text-emerald-500' : 'text-muted-foreground',
        )}>
          {delta}
        </p>
      )}
    </div>
  )
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className={cn('flex items-center', size === 'md' ? 'gap-1' : 'gap-0.5')}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(
            size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3',
            i <= full ? 'fill-amber-400 text-amber-400' :
            i === full + 1 && half ? 'fill-amber-400/50 text-amber-400' :
            'fill-muted text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  )
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up')   return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />
}

// Generic list card used by Today / Top performers / Events / Announcements.
// Lets each section share structure without copy-pasting the chrome.
function ListCard({ title, badge, iconRight, children }: {
  title: string; badge?: number; iconRight?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        {badge !== undefined && (
          <Badge variant="soft" tone="primary" size="sm" className="tabular-nums">{badge}</Badge>
        )}
        {iconRight}
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-5 py-6 text-center text-sm text-muted-foreground">{text}</div>
}

// ─── ChartSection — collapsible on phone, always-open on desktop ────────────
function ChartSection({
  title, defaultOpen, className, bodyClassName, children,
}: {
  title: string; defaultOpen: boolean; className?: string; bodyClassName?: string; children: React.ReactNode
}): React.ReactElement {
  return (
    <details
      key={defaultOpen ? 'open' : 'closed'}
      open={defaultOpen}
      className={cn('group rounded-2xl bg-card ring-1 ring-border overflow-hidden', className)}
    >
      <summary className="flex items-center justify-between gap-2 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden min-h-11 border-b border-border">
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 md:hidden" aria-hidden="true" />
      </summary>
      <div className={cn('px-4 pb-4 pt-2', bodyClassName)}>{children}</div>
    </details>
  )
}
