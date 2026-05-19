'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Check, X, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getHotelSchedule, getHotelAnimators, getHotelTeams, type ScheduleEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { TaskCardActions } from '@/components/task-card-actions'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-primary/10 text-primary border-primary/20', icon: Clock },
  COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: X },
  MISSED: { label: 'Missed', cls: 'bg-red-100 text-red-600 border-red-200', icon: AlertTriangle },
}

const ATTENDANCE_CONFIG: Record<string, { label: string; cls: string }> = {
  PRESENT: { label: 'Present', cls: 'bg-green-500 text-white' },
  ABSENT: { label: 'Absent', cls: 'bg-red-500 text-white' },
  LATE: { label: 'Late', cls: 'bg-yellow-500 text-white' },
  EXCUSED: { label: 'Excused', cls: 'bg-blue-400 text-white' },
  HALF_DAY: { label: 'Half Day', cls: 'bg-purple-400 text-white' },
}

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function fmt(d: Date) { return d.toISOString().split('T')[0] }
function shortDate(d: Date) { return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' }) }

type ViewMode = 'week' | 'list' | 'animator'

export function ScheduleModule({ hotelId, searchQuery }: { hotelId: string; searchQuery: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [weekOffset, setWeekOffset] = useState(0)
  const [filterTeam, setFilterTeam] = useState('ALL')
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({ animatorId: '', date: fmt(new Date()), startTime: '09:00', endTime: '10:00', type: 'ACTIVITY', venue: '' })

  const SCHEDULE_ENTRIES = getHotelSchedule(hotelId)
  const ANIMATORS        = getHotelAnimators(hotelId)
  const TEAMS            = getHotelTeams(hotelId)

  const baseDate = addDays(new Date(), weekOffset * 7)
  const weekStart = addDays(baseDate, -baseDate.getDay() + 1) // Mon
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const allEntries = SCHEDULE_ENTRIES.filter(e => {
    const matchTeam = filterTeam === 'ALL' || e.teamId === filterTeam
    const matchSearch = !searchQuery ||
      e.animatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.activityName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchTeam && matchSearch
  })

  const weekEntries = allEntries.filter(e => weekDays.some(d => fmt(d) === e.date))

  function getEntriesForDay(day: Date) {
    return allEntries.filter(e => e.date === fmt(day)).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  function EntryCard({ entry }: { entry: ScheduleEntry }) {
    const cfg = STATUS_CONFIG[entry.status]
    const attCfg = entry.attendance ? ATTENDANCE_CONFIG[entry.attendance] : null
    const isActionable = entry.type !== 'OFF_DUTY' && entry.type !== 'BREAK'
    return (
      <div className={cn('p-3 rounded-lg border hover:shadow-sm transition-shadow', cfg.cls)}>
        <div className="flex items-start gap-3">
          <div className="text-center w-12 shrink-0">
            <p className="text-[11px] font-bold leading-none">{entry.startTime}</p>
            <p className="text-[9px] opacity-70 mt-0.5">{entry.endTime}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-tight">{entry.activityName ?? entry.type}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <User className="w-2.5 h-2.5 opacity-60" />
              <p className="text-[10px] opacity-80 truncate">{entry.animatorName}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 opacity-60" />
              <p className="text-[10px] opacity-80">{entry.venue}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn('text-[9px] px-1.5 border-0', cfg.cls.replace('border-', ''))}>
              {cfg.label}
            </Badge>
            {attCfg && (
              <Badge className={cn('text-[9px] px-1.5 border-0', attCfg.cls)}>
                {attCfg.label}
              </Badge>
            )}
          </div>
        </div>
        {isActionable && (
          <div className="mt-2 pt-2 border-t border-current/10">
            <TaskCardActions kind="schedule" id={entry.id} originalStatus={entry.status} compact />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {weekStart.toLocaleDateString('en', { month: 'long', day: 'numeric' })} – {addDays(weekStart, 6).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Teams</option>
            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {(['week', 'list', 'animator'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={cn('px-3 py-1 rounded-md text-xs font-medium capitalize transition-all',
                  viewMode === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowNewEntry(v => !v)}>
            <Plus className="w-3.5 h-3.5" />New Entry
          </Button>
        </div>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Add Schedule Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Animator</label>
              <select value={newEntry.animatorId} onChange={e => setNewEntry(p => ({ ...p, animatorId: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select animator...</option>
                {ANIMATORS.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</label>
              <input type="date" value={newEntry.date} onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Venue</label>
              <input type="text" placeholder="e.g. Main Pool" value={newEntry.venue} onChange={e => setNewEntry(p => ({ ...p, venue: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Time</label>
              <input type="time" value={newEntry.startTime} onChange={e => setNewEntry(p => ({ ...p, startTime: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Time</label>
              <input type="time" value={newEntry.endTime} onChange={e => setNewEntry(p => ({ ...p, endTime: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={() => setShowNewEntry(false)}>Add to Schedule</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNewEntry(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { label: 'Total Entries', value: weekEntries.length, color: 'text-foreground' },
          { label: 'Completed', value: weekEntries.filter(e => e.status === 'COMPLETED').length, color: 'text-green-600' },
          { label: 'In Progress', value: weekEntries.filter(e => e.status === 'IN_PROGRESS').length, color: 'text-primary' },
          { label: 'Scheduled', value: weekEntries.filter(e => e.status === 'SCHEDULED').length, color: 'text-blue-600' },
        ]).map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayEntries = getEntriesForDay(day)
            const isToday = fmt(day) === fmt(new Date())
            return (
              <div key={fmt(day)} className={cn('rounded-xl border overflow-hidden', isToday ? 'border-primary shadow-sm shadow-primary/20' : 'border-border')}>
                <div className={cn('px-2 py-2 text-center', isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50')}>
                  <p className="text-[10px] font-medium opacity-80">{day.toLocaleDateString('en', { weekday: 'short' })}</p>
                  <p className={cn('text-lg font-black leading-none mt-0.5', isToday ? 'text-primary-foreground' : 'text-foreground')}>{day.getDate()}</p>
                </div>
                <div className="p-1.5 space-y-1 min-h-20">
                  {dayEntries.length === 0 && (
                    <p className="text-[9px] text-muted-foreground/50 text-center pt-2">No entries</p>
                  )}
                  {dayEntries.map(entry => (
                    <div key={entry.id}
                      className={cn('px-1.5 py-1 rounded text-[9px] font-medium leading-tight truncate',
                        STATUS_CONFIG[entry.status]?.cls ?? 'bg-muted text-muted-foreground'
                      )}>
                      <p className="truncate">{entry.startTime} {entry.activityName ?? entry.type}</p>
                      <p className="truncate opacity-70">{entry.animatorName.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {weekDays.map(day => {
            const dayEntries = getEntriesForDay(day)
            if (dayEntries.length === 0) return null
            const isToday = fmt(day) === fmt(new Date())
            return (
              <div key={fmt(day)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('px-3 py-1 rounded-full text-xs font-bold',
                    isToday ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {isToday ? 'Today' : shortDate(day)}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{dayEntries.length} entries</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {dayEntries.map(e => <EntryCard key={e.id} entry={e} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Animator View */}
      {viewMode === 'animator' && (
        <div className="space-y-3">
          {ANIMATORS.filter(a => filterTeam === 'ALL' || a.teamId === filterTeam).map(animator => {
            const animEntries = weekEntries.filter(e => e.animatorId === animator.id)
            if (animEntries.length === 0) return null
            const team = TEAMS.find(t => t.id === animator.teamId)
            return (
              <Card key={animator.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: team?.color ?? 'var(--color-primary)' }}>
                      {animator.firstName[0]}{animator.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{animator.firstName} {animator.lastName}</p>
                      <p className="text-[11px] text-muted-foreground">{animator.teamName}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-[10px]">{animEntries.length} sessions</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {animEntries.map(e => <EntryCard key={e.id} entry={e} />)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
