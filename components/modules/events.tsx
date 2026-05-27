'use client'

import { useState } from 'react'
import { Plus, Calendar, Clock, MapPin, Users, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getHotelEvents, getHotelAnimators, type EventItem, type EventStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { TaskCardActions } from '@/components/task-card-actions'
import { StatusBadge } from '@/components/ui/status-badge'
import { getStatusVisual } from '@/lib/status-config'

const EVENT_STATUSES: EventStatus[] = ['PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

const TYPE_ICONS: Record<string, string> = {
  GALA_DINNER: '🎭',
  THEME_NIGHT: '🌙',
  KIDS_PARTY: '🎈',
  SPORTS_TOURNAMENT: '🏆',
  CULTURAL_SHOW: '🌍',
  FAREWELL_PARTY: '👋',
  WELCOME_PARTY: '🥂',
  SPECIAL_PERFORMANCE: '⭐',
}

const TYPE_COLORS: Record<string, string> = {
  GALA_DINNER: 'from-purple-500/20 to-purple-500/5',
  THEME_NIGHT: 'from-indigo-500/20 to-indigo-500/5',
  KIDS_PARTY: 'from-orange-500/20 to-orange-500/5',
  SPORTS_TOURNAMENT: 'from-green-500/20 to-green-500/5',
  CULTURAL_SHOW: 'from-amber-500/20 to-amber-500/5',
  FAREWELL_PARTY: 'from-pink-500/20 to-pink-500/5',
  WELCOME_PARTY: 'from-teal-500/20 to-teal-500/5',
  SPECIAL_PERFORMANCE: 'from-yellow-500/20 to-yellow-500/5',
}

function EventCard({ event, allAnimators, onEdit }: { event: EventItem; allAnimators: ReturnType<typeof getHotelAnimators>; onEdit: (e: EventItem) => void }) {
  const assignedAnimators = allAnimators.filter(a => event.assignedAnimators.includes(a.id))
  const isToday = event.date === new Date().toISOString().split('T')[0]
  const isFuture = new Date(event.date) > new Date()

  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-all', isToday && 'ring-1 ring-primary')}>
      <div className={cn('h-1.5', isToday ? 'bg-primary' : isFuture ? 'bg-accent' : 'bg-muted')} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br', TYPE_COLORS[event.type])}>
            <span>{TYPE_ICONS[event.type]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold leading-tight flex-1">{event.name}</p>
              <StatusBadge domain="event" status={event.status} size="sm" />
            </div>
            <p className="text-mini text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            {isToday && <span className="text-primary font-semibold">Today</span>}
          </div>
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{event.startTime} – {event.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <Users className="w-3 h-3 shrink-0" />
            <span>{event.expectedGuests} guests</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-micro text-muted-foreground">Crew:</span>
            <div className="flex -space-x-1">
              {assignedAnimators.slice(0, 5).map(a => (
                <div key={a.id} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-tiny font-bold text-primary-foreground border border-card">
                  {a.firstName[0]}
                </div>
              ))}
              {assignedAnimators.length > 5 && (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-tiny font-semibold text-muted-foreground border border-card">
                  +{assignedAnimators.length - 5}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-micro px-2" onClick={() => onEdit(event)}>Edit</Button>
            <Button size="sm" className="h-6 text-micro px-2" onClick={() => onEdit(event)}>Manage</Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <TaskCardActions kind="event" id={event.id} originalStatus={event.status} compact />
        </div>
      </CardContent>
    </Card>
  )
}

export function EventsModule({ hotelId, searchQuery }: { hotelId: string; searchQuery: string }) {
  const EVENTS    = getHotelEvents(hotelId)
  const ANIMATORS = getHotelAnimators(hotelId)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)

  const filtered = EVENTS.filter(e => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'ALL' || e.status === filterStatus
    return matchSearch && matchStatus
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const statusCounts = EVENT_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = EVENTS.filter(e => e.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterStatus('ALL')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filterStatus === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
            )}>
            All ({EVENTS.length})
          </button>
          {EVENT_STATUSES.map(s => (
            statusCounts[s] > 0 && (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                )}>
                {getStatusVisual('event', s).label} ({statusCounts[s]})
              </button>
            )
          ))}
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />New Event
        </Button>
      </div>

      {/* Timeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-black text-primary">{EVENTS.filter(e => e.date === new Date().toISOString().split('T')[0]).length}</p><p className="text-mini text-muted-foreground">Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-black text-accent">{EVENTS.filter(e => new Date(e.date) > new Date()).length}</p><p className="text-mini text-muted-foreground">Upcoming</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-black text-green-600">{EVENTS.filter(e => e.status === 'CONFIRMED').length}</p><p className="text-mini text-muted-foreground">Confirmed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-black text-foreground">{EVENTS.reduce((s, e) => s + e.expectedGuests, 0)}</p><p className="text-mini text-muted-foreground">Total Guests</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(e => <EventCard key={e.id} event={e} allAnimators={ANIMATORS} onEdit={setEditingEvent} />)}
      </div>

      {/* Event detail / edit modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingEvent(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-base">{editingEvent.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{editingEvent.venue} · {editingEvent.date}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingEvent(null)}>✕</Button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <p className="font-semibold">{getStatusVisual('event', editingEvent.status).label}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                  <p className="font-semibold">{editingEvent.startTime} – {editingEvent.endTime}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Expected Guests</p>
                  <p className="font-semibold">{editingEvent.expectedGuests}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Crew Size</p>
                  <p className="font-semibold">{editingEvent.assignedAnimators.length} animators</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{editingEvent.description}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => setEditingEvent(null)}>Save Changes</Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setEditingEvent(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
