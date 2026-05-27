'use client'

import { useState } from 'react'
import { Check, X, Clock, Calendar, Plus, ChevronDown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getHotelLeaveRequests, getHotelAnimators, type LeaveRequest } from '@/lib/mock-data'
import { getPermissions, type AppUser } from '@/lib/roles'
import { StatusBadge } from '@/components/ui/status-badge'
import { getStatusVisual } from '@/lib/status-config'

// Filter-chip dot only — the row badge itself uses <StatusBadge domain="leave" />.
const FILTER_DOT_CLS: Record<'PENDING' | 'APPROVED' | 'REJECTED', string> = {
  PENDING:  'bg-yellow-400',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
}

const TYPE_LABELS: Record<string, string> = {
  ANNUAL:    'Annual Leave',
  SICK:      'Sick Leave',
  EMERGENCY: 'Emergency',
  UNPAID:    'Unpaid Leave',
  DAY_OFF:   'Day Off',
}

const TYPE_COLORS: Record<string, string> = {
  ANNUAL:    'bg-blue-100 text-blue-700',
  SICK:      'bg-rose-100 text-rose-700',
  EMERGENCY: 'bg-red-100  text-red-700',
  UNPAID:    'bg-gray-100 text-gray-700',
  DAY_OFF:   'bg-purple-100 text-purple-700',
}

interface LeaveModuleProps {
  hotelId: string
  currentUser: AppUser
  searchQuery: string
}

export function LeaveModule({ hotelId, currentUser, searchQuery }: LeaveModuleProps) {
  const perms      = getPermissions(currentUser.role)
  const animators  = getHotelAnimators(hotelId)
  const allLeave   = getHotelLeaveRequests(hotelId)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [requests, setRequests] = useState<LeaveRequest[]>(allLeave)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ animatorId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' })

  const filtered = requests.filter(r => {
    const matchStatus = filter === 'ALL' || r.status === filter
    const animator    = animators.find(a => a.id === r.animatorId)
    const fullName = animator ? `${animator.firstName} ${animator.lastName}` : ''
    const matchSearch = !searchQuery || fullName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    ALL:      requests.length,
    PENDING:  requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  }

  function handleAction(id: string, action: 'APPROVED' | 'REJECTED') {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const anim = animators.find(a => a.id === form.animatorId)
    if (!anim || !form.startDate || !form.endDate) return
    const newReq: LeaveRequest = {
      id:          `lr-new-${Date.now()}`,
      hotelId,
      animatorId:  form.animatorId,
      animatorName: `${anim.firstName} ${anim.lastName}`,
      type:        form.type as LeaveRequest['type'],
      startDate:   form.startDate,
      endDate:     form.endDate,
      reason:      form.reason,
      status:      'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setRequests(prev => [newReq, ...prev])
    setShowForm(false)
    setForm({ animatorId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leave Requests</h2>
          <p className="text-sm text-muted-foreground">
            {counts.PENDING} pending approval
          </p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Submit Leave Request</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Animator</label>
              <select
                required
                value={form.animatorId}
                onChange={e => setForm(p => ({ ...p, animatorId: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select animator...</option>
                {animators.map(a => (
                  <option key={a.id} value={a.id}>{a.firstName} {a.lastName} — {a.role}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leave Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Date</label>
              <input
                type="date" required
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Date</label>
              <input
                type="date" required
                value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reason (optional)</label>
              <textarea
                rows={2}
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Brief reason for leave..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-1">
              <Button type="submit" size="sm">Submit Request</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              filter === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            )}
          >
            {s !== 'ALL' && (
              <span className={cn('w-1.5 h-1.5 rounded-full', FILTER_DOT_CLS[s])} />
            )}
            {s === 'ALL' ? 'All' : getStatusVisual('leave', s).label}
            <span className="ml-0.5 bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-micro font-bold">
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Leave requests list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No leave requests found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const animator = animators.find(a => a.id === req.animatorId)
            const start  = new Date(req.startDate)
            const end    = new Date(req.endDate)
            const days   = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1

            return (
              <div
                key={req.id}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {(animator ? `${animator.firstName} ${animator.lastName}` : req.animatorName ?? 'AN').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {animator ? `${animator.firstName} ${animator.lastName}` : req.animatorName ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">{animator?.role ?? ''}</p>
                    </div>
                    <StatusBadge domain="leave" status={req.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={cn('text-micro font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[req.type] ?? 'bg-gray-100 text-gray-700')}>
                      {TYPE_LABELS[req.type] ?? req.type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {req.startDate} — {req.endDate}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {days} day{days !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {req.reason && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{req.reason}</p>
                  )}

                  <p className="text-micro text-muted-foreground mt-1.5">
                    Submitted {req.createdAt}
                  </p>
                </div>

                {/* Action buttons for approvers */}
                {perms.canApproveLeave && req.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      className="flex items-center gap-1 text-mini font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="flex items-center gap-1 text-mini font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
