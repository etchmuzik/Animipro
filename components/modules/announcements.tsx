'use client'

import { useState } from 'react'
import { Plus, AlertCircle, Info, Calendar, GraduationCap, FileText, PartyPopper, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getHotelAnnouncements, getHotelLeaveRequests, type Announcement, type LeaveRequest } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ANN_TYPE_CONFIG: Record<string, { icon: React.ElementType; cls: string; barColor: string }> = {
  GENERAL: { icon: Info, cls: 'bg-blue-50 border-blue-100', barColor: 'bg-blue-400' },
  URGENT: { icon: AlertCircle, cls: 'bg-red-50 border-red-100', barColor: 'bg-red-500' },
  SCHEDULE_CHANGE: { icon: Calendar, cls: 'bg-yellow-50 border-yellow-100', barColor: 'bg-yellow-400' },
  TRAINING: { icon: GraduationCap, cls: 'bg-green-50 border-green-100', barColor: 'bg-green-500' },
  POLICY: { icon: FileText, cls: 'bg-gray-50 border-gray-100', barColor: 'bg-gray-400' },
  EVENT: { icon: PartyPopper, cls: 'bg-purple-50 border-purple-100', barColor: 'bg-purple-500' },
}

const LEAVE_STATUS_CONFIG: Record<string, { cls: string; label: string }> = {
  PENDING: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
  APPROVED: { cls: 'bg-green-100 text-green-700 border-green-200', label: 'Approved' },
  REJECTED: { cls: 'bg-red-100 text-red-600 border-red-200', label: 'Rejected' },
  CANCELLED: { cls: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Cancelled' },
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Annual Leave', SICK: 'Sick Leave', EMERGENCY: 'Emergency', UNPAID: 'Unpaid', DAY_OFF: 'Day Off'
}

function AnnouncementCard({ ann }: { ann: Announcement }) {
  const tc = ANN_TYPE_CONFIG[ann.type]
  const Icon = tc.icon
  const isExpiring = ann.expiresAt && new Date(ann.expiresAt) < new Date(Date.now() + 3 * 86400000)
  return (
    <Card className={cn('overflow-hidden border', tc.cls)}>
      <div className={cn('h-1', tc.barColor)} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-1.5 rounded-lg shrink-0', tc.barColor.replace('bg-', 'bg-').replace('-500', '-100').replace('-400', '-100'))}>
            <Icon className={cn('w-4 h-4', tc.barColor.replace('bg-', 'text-'))} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <p className="text-sm font-bold flex-1 leading-tight">{ann.title}</p>
              {ann.priority === 'URGENT' && <Badge className="bg-red-500 text-white border-0 text-tiny shrink-0">URGENT</Badge>}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ann.content}</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-micro text-muted-foreground">{ann.authorName}</span>
                <span className="text-micro text-muted-foreground/50">·</span>
                <span className="text-micro text-muted-foreground">{new Date(ann.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
              </div>
              {ann.expiresAt && (
                <div className={cn('flex items-center gap-1 text-micro', isExpiring ? 'text-red-500' : 'text-muted-foreground')}>
                  <Clock className="w-3 h-3" />
                  <span>Expires {new Date(ann.expiresAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {ann.targetRoles.slice(0, 3).map(r => (
                <span key={r} className="text-tiny bg-white/60 border border-current/20 px-1.5 py-0.5 rounded text-muted-foreground">{r.replace('_', ' ')}</span>
              ))}
              {ann.targetRoles.length > 3 && <span className="text-tiny text-muted-foreground/60">+{ann.targetRoles.length - 3}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LeaveCard({ req, onAction }: { req: LeaveRequest; onAction: (id: string, action: 'APPROVED' | 'REJECTED') => void }) {
  const sc = LEAVE_STATUS_CONFIG[req.status]
  const days = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000) + 1
  return (
    <Card className="hover:shadow-sm transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-semibold">{req.animatorName}</p>
            <p className="text-mini text-muted-foreground">{LEAVE_TYPE_LABELS[req.type]}</p>
          </div>
          <Badge className={cn('text-micro border shrink-0', sc.cls)}>{sc.label}</Badge>
        </div>
        <p className="text-mini text-muted-foreground mb-2 italic">&ldquo;{req.reason}&rdquo;</p>
        <div className="flex items-center justify-between text-micro text-muted-foreground">
          <span>{new Date(req.startDate).toLocaleDateString('en', { day: 'numeric', month: 'short' })} – {new Date(req.endDate).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
          <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
        </div>
        {req.status === 'PENDING' && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1 h-7 text-mini bg-green-600 hover:bg-green-700" onClick={() => onAction(req.id, 'APPROVED')}>Approve</Button>
            <Button size="sm" variant="outline" className="flex-1 h-7 text-mini border-red-200 text-red-600 hover:bg-red-50" onClick={() => onAction(req.id, 'REJECTED')}>Reject</Button>
          </div>
        )}
        {req.reviewedBy && (
          <p className="text-tiny text-muted-foreground mt-2">Reviewed by {req.reviewedBy}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AnnouncementsModule({ hotelId, searchQuery }: { hotelId: string; searchQuery: string }) {
  const ANNOUNCEMENTS  = getHotelAnnouncements(hotelId)
  const [tab, setTab] = useState<'announcements' | 'leave'>('announcements')
  const [filterType, setFilterType] = useState('ALL')
  const [leaveRequests, setLeaveRequests] = useState(() => getHotelLeaveRequests(hotelId))
  const LEAVE_REQUESTS = leaveRequests

  function handleLeaveAction(id: string, action: 'APPROVED' | 'REJECTED') {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: action, reviewedBy: 'Current User' } : r))
  }

  const filteredAnn = ANNOUNCEMENTS.filter(a => {
    const q = searchQuery.toLowerCase()
    return (!q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)) &&
      (filterType === 'ALL' || a.type === filterType) && a.isActive
  })

  const filteredLeave = LEAVE_REQUESTS.filter(r => {
    const q = searchQuery.toLowerCase()
    return !q || r.animatorName.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q)
  })

  const pendingLeaves = LEAVE_REQUESTS.filter(r => r.status === 'PENDING').length
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'GENERAL' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button onClick={() => setTab('announcements')} className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-all', tab === 'announcements' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Announcements
          </button>
          <button onClick={() => setTab('leave')} className={cn('relative px-3 py-1.5 rounded-md text-sm font-medium transition-all', tab === 'leave' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Leave Requests
            {pendingLeaves > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-tiny font-bold flex items-center justify-center">{pendingLeaves}</span>
            )}
          </button>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowAnnForm(v => !v)}>
          <Plus className="w-3.5 h-3.5" />
          {tab === 'announcements' ? 'Post Announcement' : 'Submit Request'}
        </Button>
      </div>

      {/* Post Announcement form */}
      {showAnnForm && tab === 'announcements' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Post Announcement</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</label>
              <input
                type="text" placeholder="Announcement title..."
                value={annForm.title}
                onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</label>
              <select
                value={annForm.type}
                onChange={e => setAnnForm(p => ({ ...p, type: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.keys(ANN_TYPE_CONFIG).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message</label>
              <textarea
                rows={3} placeholder="Write your message..."
                value={annForm.content}
                onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={() => { setShowAnnForm(false); setAnnForm({ title: '', content: '', type: 'GENERAL' }) }}>Post Announcement</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAnnForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {tab === 'announcements' ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilterType('ALL')}
              className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                filterType === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground')}>
              All
            </button>
            {Object.keys(ANN_TYPE_CONFIG).map(t => (
              <button key={t} onClick={() => setFilterType(filterType === t ? 'ALL' : t)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  filterType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground')}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredAnn.map(a => <AnnouncementCard key={a.id} ann={a} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map(s => (
              <Card key={s}><CardContent className="p-3 text-center">
                <p className="text-2xl font-black text-foreground">{LEAVE_REQUESTS.filter(r => r.status === s).length}</p>
                <p className="text-mini text-muted-foreground">{LEAVE_STATUS_CONFIG[s].label}</p>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredLeave.sort((a, b) => {
              const order = { PENDING: 0, APPROVED: 1, REJECTED: 2, CANCELLED: 3 }
              return order[a.status] - order[b.status]
            }).map(r => <LeaveCard key={r.id} req={r} onAction={handleLeaveAction} />)}
          </div>
        </>
      )}
    </div>
  )
}
