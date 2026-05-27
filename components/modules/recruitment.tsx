'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  UserPlus, Search, Globe, Clock, Mail, Phone, FileText,
  CheckCircle2, XCircle, Star, Inbox, ExternalLink, Sparkles,
  CheckSquare, Square, ListChecks,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getApplications, setApplicationStatus, subscribe,
  type JobApplication, type ApplicationStatus,
} from '@/lib/applications'
import { getObjectUrl, revokeObjectUrl } from '@/lib/media-store'
import {
  ONBOARDING_STEPS, getOnboarding, toggleOnboardingStep, getOnboardingProgress,
  subscribe as subscribeOnboarding,
} from '@/lib/onboarding'
import { getPermissions, type AppUser } from '@/lib/roles'
import { cn } from '@/lib/utils'

// ─── Display maps ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<JobApplication['role'], string> = {
  ANIMATOR: 'Animator',
  ENTERTAINER: 'Entertainer',
  LIFEGUARD: 'Lifeguard',
  KIDS_CLUB: 'Kids Club',
}

const ROLE_COLORS: Record<JobApplication['role'], string> = {
  ANIMATOR: 'bg-green-100 text-green-800 border-green-300',
  ENTERTAINER: 'bg-purple-100 text-purple-800 border-purple-300',
  LIFEGUARD: 'bg-orange-100 text-orange-800 border-orange-300',
  KIDS_CLUB: 'bg-pink-100 text-pink-800 border-pink-300',
}

const STATUS_META: Record<ApplicationStatus, { label: string; cls: string }> = {
  NEW:         { label: 'New',         cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  SHORTLISTED: { label: 'Shortlisted', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  ACCEPTED:    { label: 'Accepted',    cls: 'bg-green-100 text-green-700 border-green-200' },
  REJECTED:    { label: 'Rejected',    cls: 'bg-red-100 text-red-700 border-red-200' },
}

const STATUS_FILTERS: { key: ApplicationStatus | 'ALL'; label: string }[] = [
  { key: 'ALL',         label: 'All' },
  { key: 'NEW',         label: 'New' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'ACCEPTED',    label: 'Accepted' },
  { key: 'REJECTED',    label: 'Rejected' },
]

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString()
}

// ─── Applicant card ──────────────────────────────────────────────────────────

function ApplicantCard({ app, onSelect }: { app: JobApplication; onSelect: () => void }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-150"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0">
            {app.firstName[0]}{app.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none truncate">{app.firstName} {app.lastName}</p>
                <p className="text-mini text-muted-foreground mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {app.nationality}
                </p>
              </div>
              <Badge className={cn('text-tiny px-1.5 py-0.5 border shrink-0', ROLE_COLORS[app.role])}>
                {ROLE_LABELS[app.role]}
              </Badge>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1">
              {app.languages.slice(0, 3).map(l => (
                <Badge key={l} variant="secondary" className="text-tiny px-1.5 py-0">{l}</Badge>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-micro text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" />{app.yearsExperience}y exp</span>
                {app.cvMediaId && (
                  <span className="flex items-center gap-1 text-primary"><FileText className="w-3 h-3" />CV</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className={cn('text-tiny px-1.5 py-0.5 border', STATUS_META[app.status].cls)}>
                  {STATUS_META[app.status].label}
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-micro text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {relativeDate(app.submittedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── CV preview link (resolves the IndexedDB blob to an object URL) ───────────

function CvLink({ app }: { app: JobApplication }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const mediaId = app.cvMediaId
    if (!mediaId) return
    let cancelled = false
    getObjectUrl(mediaId)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(() => { /* IndexedDB unavailable — link stays inert */ })
    // Release the cached object URL when this card/modal unmounts so Blob
    // memory isn't pinned across opening many CV-bearing applicants.
    return () => {
      cancelled = true
      revokeObjectUrl(mediaId)
    }
  }, [app.cvMediaId])

  if (!app.cvMediaId) return null

  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => { if (!url) e.preventDefault() }}
      className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
    >
      <FileText className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{app.cvName ?? 'Attached CV'}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
    </a>
  )
}

// ─── Onboarding checklist (shown once an applicant is ACCEPTED) ───────────────

function OnboardingChecklist({ applicationId, canManage }: { applicationId: string; canManage: boolean }) {
  const [state, setState] = useState(() => getOnboarding(applicationId))
  useEffect(() => {
    const refresh = () => setState(getOnboarding(applicationId))
    refresh()
    return subscribeOnboarding(refresh)
  }, [applicationId])

  const progress = getOnboardingProgress(applicationId)
  const pct = Math.round((progress.done / progress.total) * 100)

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-green-600" /> Onboarding
        </p>
        <span className="text-mini font-bold text-green-600">{progress.done}/{progress.total} done</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted mb-3 overflow-hidden">
        <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-1">
        {ONBOARDING_STEPS.map(step => {
          const done = !!state[step.id]
          return (
            <button
              key={step.id}
              type="button"
              disabled={!canManage}
              onClick={() => setState(toggleOnboardingStep(applicationId, step.id))}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                canManage ? 'hover:bg-muted/60' : 'cursor-default',
              )}
            >
              {done
                ? <CheckSquare className="w-4 h-4 shrink-0 text-green-600" />
                : <Square className="w-4 h-4 shrink-0 text-muted-foreground" />}
              <span className={cn(done ? 'text-muted-foreground line-through' : 'text-foreground')}>{step.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Detail modal ────────────────────────────────────────────────────────────

function ApplicantModal({
  app, canManage, onClose,
}: {
  app: JobApplication
  canManage: boolean
  onClose: () => void
}) {
  function decide(status: ApplicationStatus) {
    setApplicationStatus(app.id, status)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-lg font-black text-primary shrink-0">
              {app.firstName[0]}{app.lastName[0]}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base">{app.firstName} {app.lastName}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={cn('text-micro border', ROLE_COLORS[app.role])}>{ROLE_LABELS[app.role]}</Badge>
                <Badge className={cn('text-micro border', STATUS_META[app.status].cls)}>{STATUS_META[app.status].label}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact + meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href={`mailto:${app.email}`} className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />Email</p>
              <p className="font-semibold text-xs truncate">{app.email}</p>
            </a>
            <a href={`tel:${app.phone}`} className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</p>
              <p className="font-semibold text-xs truncate">{app.phone}</p>
            </a>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Nationality</p>
              <p className="font-semibold text-xs">{app.nationality}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-micro text-muted-foreground uppercase tracking-widest mb-1">Experience</p>
              <p className="font-semibold text-xs">{app.yearsExperience} years</p>
            </div>
          </div>

          {app.hotelName && (
            <p className="text-xs text-muted-foreground">Applied to: <span className="font-semibold text-foreground">{app.hotelName}</span> · {relativeDate(app.submittedAt)}</p>
          )}

          <div>
            <p className="text-micro text-muted-foreground uppercase tracking-widest mb-2">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {app.languages.map(l => <Badge key={l} variant="secondary" className="text-micro">{l}</Badge>)}
            </div>
          </div>

          <div>
            <p className="text-micro text-muted-foreground uppercase tracking-widest mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1.5">
              {app.specialties.map(s => <Badge key={s} className="text-micro bg-primary/10 text-primary border-0">{s}</Badge>)}
            </div>
          </div>

          <div>
            <p className="text-micro text-muted-foreground uppercase tracking-widest mb-2">Pitch</p>
            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 rounded-lg p-3">{app.pitch}</p>
          </div>

          <CvLink app={app} />

          {/* Onboarding — appears once the candidate is hired, bridging to Team */}
          {app.status === 'ACCEPTED' && (
            <OnboardingChecklist applicationId={app.id} canManage={canManage} />
          )}

          {/* Decision actions */}
          {canManage ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 h-9 text-xs gap-1.5 bg-green-600 hover:bg-green-700"
                disabled={app.status === 'ACCEPTED'}
                onClick={() => decide('ACCEPTED')}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 text-xs gap-1.5"
                disabled={app.status === 'SHORTLISTED'}
                onClick={() => decide('SHORTLISTED')}
              >
                <Star className="w-3.5 h-3.5" /> Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                disabled={app.status === 'REJECTED'}
                onClick={() => decide('REJECTED')}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            </div>
          ) : (
            <p className="text-mini text-muted-foreground text-center pt-1">You have view-only access to applications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Pipeline stat chip ──────────────────────────────────────────────────────

function StatChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={cn('rounded-xl border px-3 py-2 min-w-[84px]', tone)}>
      <p className="text-xl font-black font-mono leading-none">{value}</p>
      <p className="text-micro font-semibold uppercase tracking-wide mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Module ──────────────────────────────────────────────────────────────────

export function RecruitmentModule({
  currentUser, searchQuery,
}: {
  // Applications are company-wide in the demo (candidates apply to "any resort"),
  // so this module intentionally does not filter by the selected hotel.
  currentUser: AppUser
  searchQuery: string
}) {
  // Subscribe to the applications store so submissions from the public form and
  // status changes re-render the list live (same pattern as task-card-actions).
  const [apps, setApps] = useState<JobApplication[]>(() => getApplications())
  useEffect(() => {
    const unsub = subscribe(() => setApps(getApplications()))
    return unsub
  }, [])

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [selected, setSelected] = useState<JobApplication | null>(null)

  const canManage = getPermissions(currentUser.role).canManageRecruitment
  // Derive stats from the already-fetched list so the chips and the visible
  // cards can never disagree (avoids a second localStorage read per mutation).
  const stats = useMemo(() => ({
    total:       apps.length,
    new:         apps.filter(a => a.status === 'NEW').length,
    shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
    accepted:    apps.filter(a => a.status === 'ACCEPTED').length,
    rejected:    apps.filter(a => a.status === 'REJECTED').length,
  }), [apps])

  const filtered = apps.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.nationality.toLowerCase().includes(q) ||
      ROLE_LABELS[a.role].toLowerCase().includes(q) ||
      a.specialties.some(s => s.toLowerCase().includes(q))
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  // Keep the open modal in sync with store updates (e.g. after a decision).
  const selectedLive = selected ? apps.find(a => a.id === selected.id) ?? null : null

  return (
    <div className="space-y-4">
      {/* Pipeline overview */}
      <div className="flex flex-wrap items-center gap-2">
        <StatChip label="Total"       value={stats.total}       tone="bg-card border-border text-foreground" />
        <StatChip label="New"         value={stats.new}         tone="bg-blue-500/10 border-blue-500/20 text-blue-300" />
        <StatChip label="Shortlisted" value={stats.shortlisted} tone="bg-amber-500/10 border-amber-500/20 text-amber-300" />
        <StatChip label="Accepted"    value={stats.accepted}    tone="bg-green-500/10 border-green-500/20 text-green-300" />
        <StatChip label="Rejected"    value={stats.rejected}    tone="bg-red-500/10 border-red-500/20 text-red-300" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                statusFilter === f.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserPlus className="w-4 h-4" />
        <span>{filtered.length} application{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No applications here yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              When candidates apply through the careers page, they land in this inbox for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(a => (
            <ApplicantCard key={a.id} app={a} onSelect={() => setSelected(a)} />
          ))}
        </div>
      )}

      {/* Demo hint */}
      <p className="text-mini text-muted-foreground flex items-center gap-1.5 pt-2">
        <Sparkles className="w-3 h-3 text-accent" />
        Tip: open the <span className="font-semibold text-foreground">Careers</span> page on the website and submit an application — it appears here instantly.
      </p>

      {selectedLive && (
        <ApplicantModal
          app={selectedLive}
          canManage={canManage}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
