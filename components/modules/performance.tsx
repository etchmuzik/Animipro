'use client'

import { useState } from 'react'
import { Star, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { ANIMATORS, PERFORMANCE_SCORES, TEAMS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const SCORE_COLOR = (v: number) =>
  v >= 90 ? 'text-green-600' : v >= 80 ? 'text-primary' : v >= 70 ? 'text-yellow-600' : 'text-red-500'

const SCORE_BAR = (v: number) =>
  v >= 90 ? '[&>div]:bg-green-500' : v >= 80 ? '[&>div]:bg-primary' : v >= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'

const KPI_LABELS: Record<string, string> = {
  punctuality: 'Punctuality',
  attitude: 'Attitude',
  skills: 'Technical Skills',
  guestFeedback: 'Guest Feedback',
  teamwork: 'Teamwork',
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('text-xs font-bold', SCORE_COLOR(value))}>{value}</span>
      </div>
      <Progress value={value} className={cn('h-1.5', SCORE_BAR(value))} />
    </div>
  )
}

function AnimatorScoreCard({ score }: { score: typeof PERFORMANCE_SCORES[0] }) {
  const [expanded, setExpanded] = useState(false)
  const animator = ANIMATORS.find(a => a.id === score.animatorId)
  const team = TEAMS.find(t => t.id === animator?.teamId)
  const radarData = Object.entries(KPI_LABELS).map(([k, label]) => ({
    metric: label, score: score[k as keyof typeof score] as number
  }))
  const grade = score.overall >= 90 ? 'A' : score.overall >= 80 ? 'B' : score.overall >= 70 ? 'C' : 'D'
  const gradeColors = { A: 'bg-green-500', B: 'bg-primary', C: 'bg-yellow-500', D: 'bg-red-500' }

  return (
    <Card className={cn('hover:shadow-md transition-all cursor-pointer', expanded && 'ring-1 ring-primary/30')} onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: team?.color ?? 'var(--color-primary)' }}>
            {score.animatorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none">{score.animatorName}</p>
            <p className="text-micro text-muted-foreground mt-0.5">{animator?.teamName} · {animator?.role?.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white', gradeColors[grade])}>
              {grade}
            </div>
            <div className="text-right">
              <p className={cn('text-lg font-black leading-none', SCORE_COLOR(score.overall))}>{score.overall}</p>
              <p className="text-tiny text-muted-foreground">/100</p>
            </div>
          </div>
        </div>

        {/* Mini bars always visible */}
        <div className="space-y-1.5">
          {Object.entries(KPI_LABELS).map(([k, label]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-tiny text-muted-foreground w-20 shrink-0">{label}</span>
              <Progress value={score[k as keyof typeof score] as number} className={cn('h-1 flex-1', SCORE_BAR(score[k as keyof typeof score] as number))} />
              <span className={cn('text-micro font-semibold w-6 text-right', SCORE_COLOR(score[k as keyof typeof score] as number))}>
                {score[k as keyof typeof score]}
              </span>
            </div>
          ))}
        </div>

        {/* Expanded radar */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} />
                <Radar dataKey="score" stroke={team?.color ?? 'var(--color-primary)'} fill={team?.color ?? 'var(--color-primary)'} fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="flex-1 h-7 text-mini" onClick={() => alert(`Full performance review for ${score.animatorName} — available in full version`)}>Full Review</Button>
              <Button size="sm" variant="outline" className="flex-1 h-7 text-mini" onClick={() => { const c = prompt(`Add comment for ${score.animatorName}:`); if (c) alert(`Comment saved: "${c}"`) }}>Add Comment</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PerformanceModule({ hotelId, searchQuery }: { hotelId?: string; searchQuery: string }) {
  const [sortBy, setSortBy] = useState<'overall' | 'punctuality' | 'guestFeedback'>('overall')
  const [filterTeam, setFilterTeam] = useState('ALL')

  const filtered = PERFORMANCE_SCORES.filter(s => {
    const animator = ANIMATORS.find(a => a.id === s.animatorId)
    const q = searchQuery.toLowerCase()
    return (!q || s.animatorName.toLowerCase().includes(q)) &&
      (filterTeam === 'ALL' || animator?.teamId === filterTeam)
  }).sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number))

  const avgScores = Object.keys(KPI_LABELS).reduce((acc, k) => {
    acc[k] = Math.round(PERFORMANCE_SCORES.reduce((s, p) => s + (p[k as keyof typeof p] as number), 0) / PERFORMANCE_SCORES.length)
    return acc
  }, {} as Record<string, number>)

  const top3 = [...PERFORMANCE_SCORES].sort((a, b) => b.overall - a.overall).slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Teams</option>
            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="overall">Sort: Overall</option>
            <option value="punctuality">Sort: Punctuality</option>
            <option value="guestFeedback">Sort: Guest Feedback</option>
          </select>
        </div>
        <Badge variant="outline" className="text-micro">Period: Week 23, 2024</Badge>
      </div>

      {/* Top Performers Podium */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center gap-2">
          <Award className="w-4 h-4 text-accent" />
          <CardTitle className="text-sm">Top Performers This Week</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {top3.map((s, i) => {
              const animator = ANIMATORS.find(a => a.id === s.animatorId)
              const team = TEAMS.find(t => t.id === animator?.teamId)
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={s.animatorId} className={cn('text-center p-3 rounded-xl border', i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-muted/50 border-border')}>
                  <div className="text-2xl mb-1">{medals[i]}</div>
                  <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white mb-1.5"
                    style={{ background: team?.color ?? 'var(--color-primary)' }}>
                    {s.animatorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <p className="text-xs font-bold leading-tight">{s.animatorName}</p>
                  <p className="text-micro text-muted-foreground mt-0.5">{animator?.teamName}</p>
                  <p className={cn('text-lg font-black mt-1', SCORE_COLOR(s.overall))}>{s.overall}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Average KPI Summary */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Team Average KPIs</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(KPI_LABELS).map(([k, label]) => (
              <div key={k} className="text-center">
                <p className={cn('text-2xl font-black', SCORE_COLOR(avgScores[k]))}>{avgScores[k]}</p>
                <p className="text-micro text-muted-foreground">{label}</p>
                <Progress value={avgScores[k]} className={cn('h-1.5 mt-1.5', SCORE_BAR(avgScores[k]))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Cards */}
      <p className="text-xs text-muted-foreground">{filtered.length} animators — click a card to expand radar chart</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(s => <AnimatorScoreCard key={s.animatorId} score={s} />)}
      </div>
    </div>
  )
}
