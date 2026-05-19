'use client'

import { useState } from 'react'
import { Plus, Clock, User, Flag, CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getHotelAssignments, getHotelAnimators, getHotelTeams, type Assignment } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { TaskCardActions } from '@/components/task-card-actions'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Circle },
  ACCEPTED: { label: 'Accepted', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-primary/10 text-primary border-primary/20', icon: Loader2 },
  COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
  REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-600 border-red-200', icon: XCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  LOW: { label: 'Low', cls: 'text-gray-700', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', cls: 'text-blue-600', dot: 'bg-blue-400' },
  HIGH: { label: 'High', cls: 'text-orange-600', dot: 'bg-orange-400' },
  URGENT: { label: 'Urgent', cls: 'text-red-600', dot: 'bg-red-500' },
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const sc = STATUS_CONFIG[assignment.status]
  const pc = PRIORITY_CONFIG[assignment.priority]
  const StatusIcon = sc.icon
  const isOverdue = new Date(assignment.date) < new Date() && assignment.status !== 'COMPLETED' && assignment.status !== 'CANCELLED'
  return (
    <Card className={cn('hover:shadow-sm transition-all', isOverdue && assignment.status === 'PENDING' && 'border-red-200')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold leading-tight flex-1">{assignment.title}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={cn('w-2 h-2 rounded-full', pc.dot)} />
            <span className={cn('text-[10px] font-semibold', pc.cls)}>{pc.label}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>
        <div className="grid grid-cols-2 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{assignment.assignedToName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{assignment.startTime} – {assignment.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground col-span-2">
            <Flag className="w-3 h-3 shrink-0" />
            <span>{new Date(assignment.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            {isOverdue && assignment.status === 'PENDING' && (
              <span className="text-red-500 font-semibold ml-1">OVERDUE</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={cn('text-[10px] border gap-1', sc.cls)}>
            <StatusIcon className="w-2.5 h-2.5" />
            {sc.label}
          </Badge>
          {assignment.activityName && (
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{assignment.activityName}</span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <TaskCardActions kind="assignment" id={assignment.id} originalStatus={assignment.status} compact />
        </div>
      </CardContent>
    </Card>
  )
}

type KanbanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export function AssignmentsModule({ hotelId, searchQuery }: { hotelId: string; searchQuery: string }) {
  const ASSIGNMENTS = getHotelAssignments(hotelId)
  const ANIMATORS   = getHotelAnimators(hotelId)
  const TEAMS       = getHotelTeams(hotelId)
  const [view, setView] = useState<'list' | 'kanban'>('kanban')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterAnimator, setFilterAnimator] = useState('ALL')

  const filtered = ASSIGNMENTS.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.assignedToName.toLowerCase().includes(q) || (a.description ?? '').toLowerCase().includes(q)
    const matchP = filterPriority === 'ALL' || a.priority === filterPriority
    const matchA = filterAnimator === 'ALL' || a.assignedToId === filterAnimator
    return matchSearch && matchP && matchA
  })

  const KANBAN_COLS: { status: string; label: string; cls: string }[] = [
    { status: 'PENDING', label: 'Pending', cls: 'border-t-yellow-400' },
    { status: 'ACCEPTED', label: 'Accepted', cls: 'border-t-blue-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', cls: 'border-t-primary' },
    { status: 'COMPLETED', label: 'Completed', cls: 'border-t-green-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Priorities</option>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterAnimator} onChange={e => setFilterAnimator(e.target.value)}
            className="h-8 text-xs border border-border rounded-md px-2 bg-card text-foreground">
            <option value="ALL">All Animators</option>
            {ANIMATORS.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {(['kanban', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1 rounded-md text-xs font-medium capitalize transition-all',
                  view === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KANBAN_COLS.map(col => (
          <Card key={col.status} className={cn('border-t-2', col.cls)}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-black text-foreground">{filtered.filter(a => a.status === col.status).length}</p>
              <p className="text-[11px] text-muted-foreground">{col.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_COLS.map(col => {
            const colItems = filtered.filter(a => a.status === col.status)
            return (
              <div key={col.status} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{col.label}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{colItems.length}</Badge>
                </div>
                <div className="space-y-2 min-h-24">
                  {colItems.map(a => <AssignmentCard key={a.id} assignment={a} />)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.sort((a, b) => {
            const pOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
            return pOrder[a.priority] - pOrder[b.priority]
          }).map(a => <AssignmentCard key={a.id} assignment={a} />)}
        </div>
      )}
    </div>
  )
}
