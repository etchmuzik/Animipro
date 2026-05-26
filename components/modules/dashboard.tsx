'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Star, TrendingUp, TrendingDown, Minus, CheckCircle2, MessageSquare, Award, AlertCircle } from 'lucide-react'
import { getFeedbackSummary, subscribe as subscribeFeedback } from '@/lib/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import {
  WEEKLY_ACTIVITY_DATA, FEEDBACK_TREND_DATA,
  getDashboardStats, getTeamPerformanceData,
  getHotelSchedule, getHotelAnimators, getHotelEvents, getHotelAnnouncements,
  getHotelById,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const fmt = (d: Date) => d.toISOString().split('T')[0]
const today = fmt(new Date())

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-500',
  LATE: 'bg-amber-500',
  ABSENT: 'bg-red-500',
  SCHEDULED: 'bg-blue-500',
  IN_PROGRESS: 'bg-[#0e7490]',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-zinc-400',
}

function StatCard({ icon: Icon, label, value, sub, trend, color = 'teal', gridSpan }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; trend?: string; color?: string; gridSpan?: string
}) {
  const iconBg = {
    teal: 'bg-[#0e7490]/10',
    green: 'bg-green-500/10',
    amber: 'bg-amber-500/10',
    blue: 'bg-blue-500/10',
  }[color] ?? 'bg-[#0e7490]/10'

  const iconColor = {
    teal: 'text-[#0e7490]',
    green: 'text-green-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
  }[color] ?? 'text-[#0e7490]'

  const trendColor = {
    teal: 'text-[#0e7490]',
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  }[color] ?? 'text-[#0e7490]'

  const trendBg = {
    teal: 'bg-[#0e7490]/5',
    green: 'bg-green-500/5',
    amber: 'bg-amber-500/5',
    blue: 'bg-blue-500/5',
  }[color] ?? 'bg-[#0e7490]/5'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden', gridSpan)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-zinc-300 font-semibold uppercase tracking-tight leading-relaxed">{label}</p>
          <p className="text-3xl tabular-nums font-bold text-white mt-2">{value}</p>
          {sub && <p className="text-sm text-zinc-300 leading-relaxed mt-1">{sub}</p>}
        </div>
        <div className={cn('p-3 rounded-xl shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
      {trend && (
        <div className={cn('mt-4 flex items-center gap-2 px-3 py-2 rounded-lg w-fit', trendBg)}>
          <TrendingUp className="w-3.5 h-3.5" style={{ color: iconColor.split('-')[1] === 'teal' ? '#0e7490' : iconColor }} />
          <span className={cn('text-xs font-semibold', trendColor)}>{trend}</span>
        </div>
      )}
    </motion.div>
  )
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className={cn('flex items-center gap-0.5', size === 'md' ? 'gap-1' : 'gap-0.5')}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(
            size === 'md' ? 'w-4 h-4' : 'w-3 h-3',
            i <= full ? 'fill-[#0e7490] text-[#0e7490]' : i === full + 1 && half ? 'fill-[#0e7490]/50 text-[#0e7490]' : 'fill-zinc-700 text-zinc-600'
          )}
        />
      ))}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, type: 'spring' as const, bounce: 0.3 },
  },
}

export function DashboardModule({ hotelId }: { hotelId: string }) {
  const DASHBOARD_STATS       = getDashboardStats(hotelId)
  const TEAM_PERFORMANCE_DATA = getTeamPerformanceData(hotelId)

  // Live guest-satisfaction average from the feedback store (updates when a
  // guest rates an activity). Falls back to the mock figure when no live
  // feedback exists yet.
  const [feedback, setFeedback] = useState(() => getFeedbackSummary())
  useEffect(() => {
    const refresh = () => setFeedback(getFeedbackSummary())
    refresh()
    return subscribeFeedback(refresh)
  }, [])
  const guestAvg = feedback.count > 0 ? feedback.average : DASHBOARD_STATS.guestFeedbackAvg
  const schedule              = getHotelSchedule(hotelId)
  const animators             = getHotelAnimators(hotelId)
  const hotel                 = getHotelById(hotelId)
  const todayEntries          = schedule.filter(s => s.date === today)
  const topAnimators          = [...animators].sort((a, b) => b.performance - a.performance).slice(0, 5)
  const upcomingEvents        = getHotelEvents(hotelId).filter(e => e.status !== 'COMPLETED').slice(0, 3)
  const latestAnnouncements   = getHotelAnnouncements(hotelId).filter(a => a.isActive).slice(0, 3)

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* TripAdvisor & Ratings Row */}
      {hotel && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* TripAdvisor */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#0e7490' }}>
                <svg viewBox="0 0 48 48" className="w-6 h-6 fill-white"><circle cx="12" cy="26" r="8"/><circle cx="36" cy="26" r="8"/><path d="M4 18c0-11 36-11 40 0"/><circle cx="12" cy="26" r="3.5" fill="#ffffff"/><circle cx="36" cy="26" r="3.5" fill="#ffffff"/></svg>
              </div>
              {hotel.tripAdvisorBadge && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#0e7490]/10 text-[#0e7490]">
                  {hotel.tripAdvisorBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300 font-semibold uppercase tracking-tight mb-1">TripAdvisor</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl tabular-nums font-bold text-white">{hotel.tripAdvisorRating.toFixed(1)}</span>
              <StarRating rating={hotel.tripAdvisorRating} size="md" />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">{hotel.tripAdvisorReviews.toLocaleString()} reviews</p>
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <p className="text-xs text-zinc-300 flex-1">{hotel.tripAdvisorRank}</p>
              {hotel.tripAdvisorTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {hotel.tripAdvisorTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              {hotel.tripAdvisorTrend === 'stable' && <Minus className="w-4 h-4 text-zinc-400" />}
            </div>
          </div>

          {/* Google Rating */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col">
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-700 shadow-sm mb-4">
              <svg viewBox="0 0 48 48" className="w-6 h-6">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.3 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 20.5-8 20.5-19.5 0-1.3-.1-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                <path fill="#FBBC05" d="M24 43.5c5.5 0 10.4-1.8 14.2-5l-6.5-5.3C29.8 34.9 27 36 24 36c-5.7 0-10.3-2.9-11.7-7.5l-6.9 5.3C8.4 39.2 15.5 43.5 24 43.5z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2.1-1.9 3.9-3.6 5.2l6.5 5.3c3.8-3.5 6.4-8.7 6.4-15 0-1.3-.1-2.7-.5-4z"/>
              </svg>
            </div>
            <p className="text-xs text-zinc-300 font-semibold uppercase tracking-tight mb-1">Google</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl tabular-nums font-bold text-white">{hotel.googleRating.toFixed(1)}</span>
              <StarRating rating={hotel.googleRating} size="md" />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">Based on guest reviews</p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <p className="text-xs text-[#0e7490] font-medium">Google Maps Profile</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Booking.com Rating */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col">
            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: '#003580' }}>
              <span className="text-white font-black text-sm">B</span>
            </div>
            <p className="text-xs text-zinc-300 font-semibold uppercase tracking-tight mb-1" style={{ color: '#0e7490' }}>Booking.com</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl tabular-nums font-bold text-white">{hotel.bookingRating.toFixed(1)}</span>
              <span className="text-xs text-zinc-400">/ 10</span>
            </div>
            <span className={cn(
              'text-[10px] font-bold px-2.5 py-1 rounded-full text-white inline-block mb-3 w-fit',
              hotel.bookingRating >= 9 ? 'bg-green-600' : hotel.bookingRating >= 8 ? 'bg-blue-600' : 'bg-amber-600'
            )}>
              {hotel.bookingRating >= 9 ? 'Exceptional' : hotel.bookingRating >= 8 ? 'Very Good' : 'Good'}
            </span>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-300">Animation team</span>
                <span className="text-xs tabular-nums font-semibold text-white">{Math.min(10, hotel.bookingRating + 0.3).toFixed(1)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(hotel.bookingRating / 10) * 100}%`, background: '#003580' }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Stats - Bento 2.0 Asymmetric Layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
        <StatCard icon={Users} label="Total Animators" value={DASHBOARD_STATS.totalAnimators} sub={`${DASHBOARD_STATS.activeToday} active today`} trend="+2 this season" color="teal" gridSpan="lg:col-span-1" />
        <StatCard icon={Calendar} label="Today's Activities" value={DASHBOARD_STATS.activitiesScheduled} sub={`${DASHBOARD_STATS.activitiesCompleted} completed`} color="blue" gridSpan="lg:col-span-1" />
        <StatCard icon={Star} label="Avg Performance" value={`${DASHBOARD_STATS.avgPerformance}%`} sub="This week" trend="+3% vs last week" color="amber" gridSpan="lg:col-span-1" />
        <StatCard icon={CheckCircle2} label="Attendance Rate" value={`${DASHBOARD_STATS.avgAttendance}%`} sub="Today" color="green" gridSpan="lg:col-span-1" />
        <StatCard icon={MessageSquare} label="Guest Feedback" value={`${guestAvg}/5`} sub={feedback.count > 0 ? `${feedback.count} guest ratings` : 'This month'} trend="↑ 0.2 vs last month" color="teal" gridSpan="md:col-span-2 lg:col-span-1" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold tracking-tight text-white">Weekly Activity Overview</h3>
          </div>
          <div className="px-4 pb-4 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={WEEKLY_ACTIVITY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e7490" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gGuests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="rgb(63, 63, 70)" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} width={40} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="activities" stroke="#0e7490" fill="url(#gActivities)" strokeWidth={2.5} name="Activities" dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="guests" stroke="#7c3aed" fill="url(#gGuests)" strokeWidth={2.5} name="Guests" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4 px-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#0e7490' }} /><span className="text-xs text-zinc-300">Activities</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#7c3aed' }} /><span className="text-xs text-zinc-300">Guests</span></div>
            </div>
          </div>
        </div>

        {/* Feedback Trend */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold tracking-tight text-white">Guest Feedback Trend</h3>
          </div>
          <div className="px-4 pb-4 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FEEDBACK_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgb(63, 63, 70)" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[3.5, 5]} tick={{ fontSize: 12, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
                <Line type="monotone" dataKey="rating" stroke="#0e7490" strokeWidth={3} dot={{ r: 4, fill: '#0e7490', strokeWidth: 0 }} name="Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-white">Today&apos;s Schedule</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0e7490]/10 text-[#0e7490]">{todayEntries.length}</span>
          </div>
          <div className="divide-y divide-white/5">
            {todayEntries.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-300">No entries for today</div>
            ) : (
              todayEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                  <div className="text-center w-14 shrink-0">
                    <p className="text-xs font-mono font-bold text-[#0e7490] leading-tight">{entry.startTime}</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">{entry.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{entry.activityName ?? entry.type}</p>
                    <p className="text-[10px] text-zinc-300 truncate">{entry.animatorName} · {entry.venue}</p>
                  </div>
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', STATUS_COLORS[entry.status])} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Performance */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold tracking-tight text-white">Team Performance</h3>
          </div>
          <div className="px-2 pb-4 pt-2">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={TEAM_PERFORMANCE_DATA} layout="vertical" margin={{ top: 5, right: 15, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgb(63, 63, 70)" strokeOpacity={0.4} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="team" type="category" tick={{ fontSize: 11, fill: 'rgb(161, 161, 170)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
                <Bar dataKey="performance" fill="#0e7490" radius={[0, 6, 6, 0]} name="Performance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-white">Top Performers</h3>
            <Award className="w-4 h-4 text-[#0e7490]" />
          </div>
          <div className="divide-y divide-white/5">
            {topAnimators.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white',
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-500' : 'bg-zinc-600'
                )}>
                  {i + 1}
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#0e7490' }}>
                  {a.firstName[0]}{a.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{a.firstName} {a.lastName}</p>
                  <p className="text-[10px] text-zinc-300">{a.teamName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs tabular-nums font-bold text-[#0e7490]">{a.performance}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-white">Upcoming Events</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0e7490]/10 text-[#0e7490]">{upcomingEvents.length}</span>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-300">No upcoming events</div>
            ) : (
              upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors">
                  <div className="text-center bg-[#0e7490]/10 rounded-lg p-2.5 shrink-0 w-14">
                    <p className="text-[9px] font-semibold text-[#0e7490] uppercase">{new Date(ev.date).toLocaleDateString('en', { month: 'short' })}</p>
                    <p className="text-lg font-mono font-bold text-[#0e7490] leading-none">{new Date(ev.date).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight">{ev.name}</p>
                    <p className="text-[10px] text-zinc-300 mt-1">{ev.venue} · {ev.startTime}–{ev.endTime}</p>
                    <p className="text-[10px] text-zinc-300">{ev.expectedGuests} guests · {ev.assignedAnimators.length} animators</p>
                  </div>
                  <span className={cn('text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0',
                    ev.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-600' : 'bg-[#0e7490]/10 text-[#0e7490]'
                  )}>
                    {ev.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="p-6 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold tracking-tight text-white">Latest Announcements</h3>
          </div>
          <div className="divide-y divide-white/5">
            {latestAnnouncements.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-300">No announcements</div>
            ) : (
              latestAnnouncements.map(ann => (
                <div key={ann.id} className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors"
                  style={{ borderLeft: `3px solid ${ann.priority === 'URGENT' ? '#ef4444' : ann.priority === 'HIGH' ? '#0e7490' : '#10b981'}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white leading-tight">{ann.title}</p>
                      {ann.priority === 'URGENT' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-300 mt-2 line-clamp-2 leading-relaxed">{ann.content}</p>
                    <p className="text-[9px] text-zinc-400 mt-2">{ann.authorName} · {new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
