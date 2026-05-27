'use client'

import { useState, useEffect } from 'react'
import { Plus, Zap, Clock, Users, MapPin, Tag, Package, Star, MessageSquarePlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ACTIVITIES, type Activity } from '@/lib/mock-data'
import {
  addFeedback, getFeedbackForActivity, subscribe as subscribeFeedback,
} from '@/lib/feedback'
import { cn } from '@/lib/utils'

// Subtle category tints — softer than pastel so they don't dominate the card.
// `bg-<color>-500/15` gives a translucent fill that reads on the dark
// platform surface; `text-<color>-300` keeps labels legible at small sizes.
const TYPE_COLORS: Record<string, string> = {
  SPORTS:        'bg-green-500/15 text-green-300 border-green-500/20',
  WATER_SPORTS:  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  AQUA_GYM:      'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  KIDS_ACTIVITY: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  EVENING_SHOW:  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  DANCE_CLASS:   'bg-pink-500/15 text-pink-300 border-pink-500/20',
  GAME:          'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  EXCURSION:     'bg-teal-500/15 text-teal-300 border-teal-500/20',
  CULTURAL:      'bg-amber-500/15 text-amber-300 border-amber-500/20',
  FITNESS:       'bg-red-500/15 text-red-300 border-red-500/20',
  ENTERTAINMENT: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
}

const AGE_COLORS: Record<string, string> = {
  KIDS:    'bg-orange-500/10 text-orange-300',
  TEENS:   'bg-purple-500/10 text-purple-300',
  ADULTS:  'bg-blue-500/10 text-blue-300',
  SENIORS: 'bg-zinc-500/10 text-zinc-300',
  ALL:     'bg-green-500/10 text-green-300',
  FAMILY:  'bg-pink-500/10 text-pink-300',
}

const ALL_TYPES = ['ALL', 'SPORTS', 'WATER_SPORTS', 'AQUA_GYM', 'KIDS_ACTIVITY', 'EVENING_SHOW', 'DANCE_CLASS', 'GAME', 'EXCURSION', 'CULTURAL', 'FITNESS', 'ENTERTAINMENT']

// Compact star rating input used inside the rating dialog.
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={cn('w-7 h-7', (hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
        </button>
      ))}
    </div>
  )
}

function RatingDialog({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [done, setDone] = useState(false)

  function submit() {
    addFeedback({
      activityId: activity.id,
      activityName: activity.name,
      rating,
      comment: comment.trim(),
      guestName: guestName.trim() || 'Guest',
    })
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-500/15">
              <Star className="w-6 h-6 fill-green-500 text-green-500" />
            </div>
            <p className="font-bold text-foreground">Thanks for the feedback!</p>
            <p className="text-sm text-muted-foreground mt-1">It now counts toward this hotel&apos;s guest satisfaction score.</p>
            <Button size="sm" className="mt-4 h-8 text-xs" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-foreground mb-1">Rate this activity</h3>
            <p className="text-sm text-muted-foreground mb-4">{activity.name}</p>
            <div className="flex justify-center mb-4"><StarPicker value={rating} onChange={setRating} /></div>
            <input
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Leave a comment (optional)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={submit}>Submit rating</Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={onClose}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ActivityCard({ activity, onEdit, onSchedule, onRate }: { activity: Activity; onEdit: (a: Activity) => void; onSchedule: (a: Activity) => void; onRate: (a: Activity) => void }) {
  const typeLabel = activity.type.replace(/_/g, ' ')

  // Live guest rating for this activity.
  const [summary, setSummary] = useState<{ count: number; avg: number }>({ count: 0, avg: 0 })
  useEffect(() => {
    const refresh = () => {
      const list = getFeedbackForActivity(activity.id)
      const avg = list.length ? Math.round((list.reduce((s, f) => s + f.rating, 0) / list.length) * 10) / 10 : 0
      setSummary({ count: list.length, avg })
    }
    refresh()
    return subscribeFeedback(refresh)
  }, [activity.id])

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all duration-150 group">
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-13 font-bold leading-tight text-foreground group-hover:text-primary transition-colors">{activity.name}</p>
            {activity.nameAr && (
              <p className="text-mini text-muted-foreground mt-0.5 font-arabic" dir="rtl">{activity.nameAr}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn('text-tiny px-1.5 py-0.5 border h-auto font-semibold', TYPE_COLORS[activity.type] ?? 'bg-muted text-muted-foreground border-muted')}>
              {typeLabel}
            </Badge>
            <div className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-tiny font-semibold', AGE_COLORS[activity.ageGroup])}>
              {activity.ageGroup}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{activity.duration}min</span>
          </div>
          <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
            <Users className="w-3 h-3 shrink-0" />
            <span>Min {activity.minAnimators}</span>
          </div>
          {activity.maxGuests && (
            <div className="flex items-center gap-1.5 text-mini text-muted-foreground">
              <Users className="w-3 h-3 shrink-0 text-accent" />
              <span>{activity.maxGuests} guests</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-mini text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{activity.venue}</span>
        </div>

        {activity.equipment.length > 0 && (
          <div className="flex items-start gap-1.5">
            <Package className="w-3 h-3 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {activity.equipment.map(eq => (
                <span key={eq} className="text-tiny bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{eq}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          {summary.count > 0 ? (
            <div className="flex items-center gap-1 text-micro font-medium text-amber-600" title={`${summary.count} guest ratings`}>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold">{summary.avg}</span>
              <span className="text-muted-foreground">({summary.count})</span>
            </div>
          ) : (
            <div className={cn('flex items-center gap-1.5 text-micro font-medium', activity.isActive ? 'text-green-600' : 'text-muted-foreground')}>
              <div className={cn('w-1.5 h-1.5 rounded-full', activity.isActive ? 'bg-green-500' : 'bg-gray-400')} />
              {activity.isActive ? 'Active' : 'Inactive'}
            </div>
          )}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-mini px-2.5 gap-1 border-amber-400/40 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              onClick={e => { e.stopPropagation(); onRate(activity) }}
            >
              <MessageSquarePlus className="w-3 h-3" /> Rate
            </Button>
            <Button
              size="sm"
              className="h-7 text-mini px-2.5"
              onClick={e => { e.stopPropagation(); onSchedule(activity) }}
            >
              Schedule
            </Button>
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
  const [ratingActivity, setRatingActivity] = useState<Activity | null>(null)

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
            <p className="text-tiny text-muted-foreground mt-0.5 leading-tight">{t.replace(/_/g, ' ')}</p>
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
            onRate={act => setRatingActivity(act)}
          />
        ))}
      </div>

      {/* Guest rating dialog */}
      {ratingActivity && (
        <RatingDialog activity={ratingActivity} onClose={() => setRatingActivity(null)} />
      )}

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
