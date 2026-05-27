'use client'

import { useState } from 'react'
import { Users, Search, Filter, Plus, Edit, UserCheck, UserX, Star, Globe, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { getHotelAnimators, getHotelTeams, type Animator, type Team } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  ANIMATION_CHIEF: 'Chief',
  TEAM_LEADER: 'Leader',
  ANIMATOR: 'Animator',
  ENTERTAINER: 'Entertainer',
  LIFEGUARD: 'Lifeguard',
  KIDS_CLUB: 'Kids Club',
}

const ROLE_COLORS: Record<string, string> = {
  ANIMATION_CHIEF: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  TEAM_LEADER: 'bg-primary/10 text-primary border-primary/20',
  ANIMATOR: 'bg-secondary text-secondary-foreground border-secondary',
  ENTERTAINER: 'bg-purple-100 text-purple-800 border-purple-300',
  LIFEGUARD: 'bg-red-100 text-red-800 border-red-300',
  KIDS_CLUB: 'bg-orange-100 text-orange-800 border-orange-300',
}

const CONTRACT_COLORS: Record<string, string> = {
  FULL_TIME: 'bg-green-100 text-green-700',
  SEASONAL: 'bg-blue-100 text-blue-700',
  PART_TIME: 'bg-yellow-100 text-yellow-700',
  FREELANCE: 'bg-gray-100 text-gray-700',
}

const PERF_COLOR = (v: number) =>
  v >= 90 ? 'text-green-600' : v >= 80 ? 'text-primary' : v >= 70 ? 'text-yellow-600' : 'text-red-500'

function AnimatorCard({ animator, onSelect, teamColor }: { animator: Animator; onSelect: () => void; teamColor?: string }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-150 group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-primary-foreground shrink-0"
              style={{ background: teamColor ?? 'var(--color-primary)' }}>
              {animator.firstName[0]}{animator.lastName[0]}
            </div>
            <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
              animator.isActive ? 'bg-green-500' : 'bg-gray-400'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{animator.firstName} {animator.lastName}</p>
                <p className="text-mini text-muted-foreground mt-0.5">{animator.teamName}</p>
              </div>
              <Badge className={cn('text-tiny px-1.5 py-0.5 border shrink-0', ROLE_COLORS[animator.role])}>
                {ROLE_LABELS[animator.role]}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-tiny text-muted-foreground">Performance</span>
                  <span className={cn('text-micro font-bold', PERF_COLOR(animator.performance))}>{animator.performance}%</span>
                </div>
                <Progress value={animator.performance} className="h-1" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-tiny px-1.5 py-0 border-0', CONTRACT_COLORS[animator.contractType])}>
                {animator.contractType.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1 text-micro text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>{animator.nationality}</span>
              </div>
              <div className="flex items-center gap-1 text-micro text-muted-foreground ml-auto">
                <Star className="w-3 h-3 text-accent" />
                <span>{animator.attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnimatorModal({ animator, teamColor, onClose }: { animator: Animator; teamColor?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-primary-foreground"
              style={{ background: teamColor ?? 'var(--color-primary)' }}>
              {animator.firstName[0]}{animator.lastName[0]}
            </div>
            <div>
              <CardTitle className="text-base">{animator.firstName} {animator.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{animator.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-micro border', ROLE_COLORS[animator.role])}>{ROLE_LABELS[animator.role]}</Badge>
                <div className={cn('w-2 h-2 rounded-full', animator.isActive ? 'bg-green-500' : 'bg-gray-400')} />
                <span className="text-micro text-muted-foreground">{animator.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Team</p>
              <p className="font-semibold text-xs">{animator.teamName}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Contract</p>
              <p className="font-semibold text-xs">{animator.contractType.replace('_', ' ')}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Nationality</p>
              <p className="font-semibold text-xs">{animator.nationality}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Start Date</p>
              <p className="font-semibold text-xs">{new Date(animator.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-micro text-muted-foreground uppercase tracking-widest mb-2">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {animator.languages.map(l => <Badge key={l} variant="secondary" className="text-micro">{l}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-micro text-muted-foreground uppercase tracking-widest mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1.5">
              {animator.specialties.map(s => <Badge key={s} className="text-micro bg-primary/10 text-primary border-0">{s}</Badge>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Performance</span>
                <span className={cn('text-xs font-bold', PERF_COLOR(animator.performance))}>{animator.performance}%</span>
              </div>
              <Progress value={animator.performance} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Attendance</span>
                <span className="text-xs font-bold text-primary">{animator.attendanceRate}%</span>
              </div>
              <Progress value={animator.attendanceRate} className="h-2" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => alert(`Edit profile for ${animator.firstName} ${animator.lastName} — available in full version`)}>Edit Profile</Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamCard({ team, allAnimators }: { team: Team; allAnimators: Animator[] }) {
  const members = allAnimators.filter(a => a.teamId === team.id)
  const avgPerf = Math.round(members.reduce((s, m) => s + m.performance, 0) / (members.length || 1))
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5" style={{ background: team.color }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">{team.name}</p>
            <p className="text-micro text-muted-foreground">{team.type.replace(/_/g, ' ')}</p>
          </div>
          <Badge variant="secondary" className="text-micro">{members.length} members</Badge>
        </div>
        <p className="text-mini text-muted-foreground mb-3">{team.description}</p>
        <div className="flex -space-x-1.5 mb-3">
          {members.slice(0, 6).map(m => (
            <div key={m.id} className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-tiny font-bold text-white"
              style={{ background: team.color }}>
              {m.firstName[0]}
            </div>
          ))}
          {members.length > 6 && (
            <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-tiny font-semibold text-muted-foreground">
              +{members.length - 6}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-micro text-muted-foreground">Leader</p>
            <p className="text-xs font-semibold">{team.leaderName}</p>
          </div>
          <div className="text-right">
            <p className="text-micro text-muted-foreground">Avg Performance</p>
            <p className={cn('text-sm font-bold', PERF_COLOR(avgPerf))}>{avgPerf}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamModule({ hotelId, searchQuery }: { hotelId: string; searchQuery: string }) {
  const [selectedAnimator, setSelectedAnimator] = useState<Animator | null>(null)
  const [view, setView] = useState<'animators' | 'teams'>('animators')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterTeam, setFilterTeam] = useState('ALL')

  const ANIMATORS = getHotelAnimators(hotelId)
  const TEAMS     = getHotelTeams(hotelId)

  const filtered = ANIMATORS.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.nationality.toLowerCase().includes(q) ||
      a.teamName.toLowerCase().includes(q)
    const matchRole = filterRole === 'ALL' || a.role === filterRole
    const matchTeam = filterTeam === 'ALL' || a.teamId === filterTeam
    return matchSearch && matchRole && matchTeam
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button onClick={() => setView('animators')} className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all', view === 'animators' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Animators
          </button>
          <button onClick={() => setView('teams')} className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all', view === 'teams' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Teams
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Teams</option>
            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Member
          </Button>
        </div>
      </div>

      {view === 'animators' ? (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filtered.length} animators found</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(a => {
              const teamColor = TEAMS.find(t => t.id === a.teamId)?.color
              return <AnimatorCard key={a.id} animator={a} teamColor={teamColor} onSelect={() => setSelectedAnimator(a)} />
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TEAMS.map(t => <TeamCard key={t.id} team={t} allAnimators={ANIMATORS} />)}
        </div>
      )}

      {selectedAnimator && (
        <AnimatorModal
          animator={selectedAnimator}
          teamColor={TEAMS.find(t => t.id === selectedAnimator.teamId)?.color}
          onClose={() => setSelectedAnimator(null)}
        />
      )}
    </div>
  )
}
