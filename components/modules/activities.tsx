'use client'

import { useState } from 'react'
import { Plus, Zap, Clock, Users, MapPin, Tag, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ACTIVITIES, type Activity } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  SPORTS: 'bg-green-100 text-green-700 border-green-200',
  WATER_SPORTS: 'bg-blue-100 text-blue-700 border-blue-200',
  AQUA_GYM: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  KIDS_ACTIVITY: 'bg-orange-100 text-orange-700 border-orange-200',
  EVENING_SHOW: 'bg-purple-100 text-purple-700 border-purple-200',
  DANCE_CLASS: 'bg-pink-100 text-pink-700 border-pink-200',
  GAME: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EXCURSION: 'bg-teal-100 text-teal-700 border-teal-200',
  CULTURAL: 'bg-amber-100 text-amber-700 border-amber-200',
  FITNESS: 'bg-red-100 text-red-700 border-red-200',
  ENTERTAINMENT: 'bg-violet-100 text-violet-700 border-violet-200',
}

const AGE_COLORS: Record<string, string> = {
  KIDS: 'bg-orange-50 text-orange-600',
  TEENS: 'bg-purple-50 text-purple-600',
  ADULTS: 'bg-blue-50 text-blue-600',
  SENIORS: 'bg-gray-50 text-gray-600',
  ALL: 'bg-green-50 text-green-600',
  FAMILY: 'bg-pink-50 text-pink-600',
}

const ALL_TYPES = ['ALL', 'SPORTS', 'WATER_SPORTS', 'AQUA_GYM', 'KIDS_ACTIVITY', 'EVENING_SHOW', 'DANCE_CLASS', 'GAME', 'EXCURSION', 'CULTURAL', 'FITNESS', 'ENTERTAINMENT']

function ActivityCard({ activity, onEdit, onSchedule }: { activity: Activity; onEdit: (a: Activity) => void; onSchedule: (a: Activity) => void }) {
  const typeLabel = activity.type.replace(/_/g, ' ')
  return (
    <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-150 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{activity.name}</p>
            {activity.nameAr && (
              <p className="text-xs text-muted-foreground mt-0.5 font-arabic" dir="rtl">{activity.nameAr}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn('text-[9px] px-1.5 py-0.5 border', TYPE_COLORS[activity.type] ?? 'bg-muted text-muted-foreground border-muted')}>
              {typeLabel}
            </Badge>
            <div className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium', AGE_COLORS[activity.ageGroup])}>
              {activity.ageGroup}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{activity.duration}min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="w-3 h-3 shrink-0" />
            <span>Min {activity.minAnimators}</span>
          </div>
          {activity.maxGuests && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="w-3 h-3 shrink-0 text-accent" />
              <span>{activity.maxGuests} guests</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{activity.venue}</span>
        </div>

        {activity.equipment.length > 0 && (
          <div className="flex items-start gap-1.5">
            <Package className="w-3 h-3 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {activity.equipment.map(eq => (
                <span key={eq} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{eq}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className={cn('flex items-center gap-1.5 text-[10px] font-medium', activity.isActive ? 'text-green-600' : 'text-muted-foreground')}>
            <div className={cn('w-1.5 h-1.5 rounded-full', activity.isActive ? 'bg-green-500' : 'bg-gray-400')} />
            {activity.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); onEdit(activity) }}>Edit</Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary" onClick={e => { e.stopPropagation(); onSchedule(activity) }}>Schedule</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivitiesModule({ searchQuery }: { searchQuery: string }) {
  const [filterType, setFilterType] = useState('ALL')
  const [filterAge, setFilterAge] = useState('ALL')
  const [actionActivity, setActionActivity] = useState<{ activity: Activity; mode: 'edit' | 'schedule' } | null>(null)

  const filtered = ACTIVITIES.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.venue.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
    const matchType = filterType === 'ALL' || a.type === filterType
    const matchAge = filterAge === 'ALL' || a.ageGroup === filterAge
    return matchSearch && matchType && matchAge
  })

  const byType = ALL_TYPES.slice(1).reduce((acc, t) => {
    acc[t] = ACTIVITIES.filter(a => a.type === t).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Types</option>
            {ALL_TYPES.slice(1).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filterAge} onChange={e => setFilterAge(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Age Groups</option>
            {['KIDS', 'TEENS', 'ADULTS', 'SENIORS', 'FAMILY'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />New Activity
        </Button>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
        {ALL_TYPES.slice(1).map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? 'ALL' : t)}
            className={cn('p-2 rounded-lg border text-center transition-all', filterType === t ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30')}>
            <p className={cn('text-sm font-black', filterType === t ? 'text-primary' : 'text-foreground')}>{byType[t]}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{t.replace(/_/g, ' ')}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4" />
        <span>{filtered.length} activities</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(a => (
          <ActivityCard
            key={a.id} activity={a}
            onEdit={act => setActionActivity({ activity: act, mode: 'edit' })}
            onSchedule={act => setActionActivity({ activity: act, mode: 'schedule' })}
          />
        ))}
      </div>

      {/* Activity action modal */}
      {actionActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActionActivity(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-1">
              {actionActivity.mode === 'edit' ? 'Edit Activity' : 'Schedule Activity'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{actionActivity.activity.name}</p>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold">{actionActivity.activity.duration} min</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground mb-1">Venue</p>
                <p className="font-semibold truncate">{actionActivity.activity.venue}</p>
              </div>
            </div>
            {actionActivity.mode === 'schedule' && (
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Date & Time</label>
                <input type="datetime-local" className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => setActionActivity(null)}>
                {actionActivity.mode === 'edit' ? 'Save Changes' : 'Add to Schedule'}
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setActionActivity(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
