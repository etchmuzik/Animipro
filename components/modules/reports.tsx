'use client'

import { Download, TrendingUp, Users, Star, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, AreaChart, Area, Legend,
} from 'recharts'
import {
  ANIMATORS, TEAMS, WEEKLY_ACTIVITY_DATA, TEAM_PERFORMANCE_DATA,
  FEEDBACK_TREND_DATA, PERFORMANCE_SCORES,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)']

const NATIONALITY_DATA = Object.entries(
  ANIMATORS.reduce((acc, a) => { acc[a.nationality] = (acc[a.nationality] ?? 0) + 1; return acc }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

const CONTRACT_DATA = [
  { name: 'Full Time', value: ANIMATORS.filter(a => a.contractType === 'FULL_TIME').length },
  { name: 'Seasonal', value: ANIMATORS.filter(a => a.contractType === 'SEASONAL').length },
  { name: 'Part Time', value: ANIMATORS.filter(a => a.contractType === 'PART_TIME').length },
  { name: 'Freelance', value: ANIMATORS.filter(a => a.contractType === 'FREELANCE').length },
].filter(d => d.value > 0)

const TEAM_STATS = TEAMS.map(t => {
  const members = ANIMATORS.filter(a => a.teamId === t.id)
  return {
    name: t.name.replace(' ', '\n'),
    members: members.length,
    avgPerf: Math.round(members.reduce((s, m) => s + m.performance, 0) / (members.length || 1)),
    avgAtt: Math.round(members.reduce((s, m) => s + m.attendanceRate, 0) / (members.length || 1)),
  }
})

const RADAR_DATA = [
  { metric: 'Punctuality', score: 88 },
  { metric: 'Attitude', score: 92 },
  { metric: 'Skills', score: 84 },
  { metric: 'Guest Feedback', score: 91 },
  { metric: 'Teamwork', score: 89 },
]

export function ReportsModule({ hotelId }: { hotelId?: string } = {}) {
  return (
    <div className="space-y-5">
      {/* Export Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Reporting Period: May – June 2024</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
            const csv = 'Metric,Value\nTotal Activities,142\nAvg Attendance,96.2%\nGuest Satisfaction,4.7/5\nPerformance Avg,88.4%'
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
            Object.assign(document.createElement('a'), { href: url, download: 'animapro-report.csv' }).click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="w-3.5 h-3.5" />CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => window.print()}>
            <Download className="w-3.5 h-3.5" />PDF
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Activities Run', value: '142', sub: 'This month', trend: '+18%', icon: Calendar },
          { label: 'Average Attendance', value: '96.2%', sub: 'Team average', trend: '+1.4%', icon: Users },
          { label: 'Guest Satisfaction', value: '4.7/5', sub: '112 reviews', trend: '+0.2', icon: Star },
          { label: 'Performance Avg', value: '88.4%', sub: 'All teams', trend: '+3.1%', icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <kpi.icon className="w-4 h-4 text-primary/60" />
              </div>
              <p className="text-2xl font-black text-foreground">{kpi.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-micro text-muted-foreground">{kpi.sub}</span>
                <span className="text-micro font-semibold text-green-600">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity + Attendance */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Activity & Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_ACTIVITY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="activities" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Activities" />
                <Bar dataKey="attendance" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance Radar */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Average Team KPI Radar</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-3">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                <Radar name="Score" dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Team Performance vs Attendance</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TEAM_STATS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgPerf" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} name="Avg Performance %" />
                <Bar dataKey="avgAtt" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} name="Avg Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nationality Breakdown */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Team Nationalities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {NATIONALITY_DATA.slice(0, 6).map((n, i) => (
                <div key={n.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs flex-1 text-muted-foreground">{n.name}</span>
                  <div className="flex-1 max-w-20">
                    <Progress value={(n.value / ANIMATORS.length) * 100} className="h-1.5" />
                  </div>
                  <span className="text-xs font-semibold w-4 text-right">{n.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest Feedback Trend */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Guest Satisfaction Over Time</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={FEEDBACK_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gFeedback" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="rating" stroke="var(--color-accent)" fill="url(#gFeedback)" strokeWidth={2.5} name="Avg Rating" dot={{ r: 3, fill: 'var(--color-accent)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
