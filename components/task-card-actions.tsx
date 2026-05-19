// ─── AnimaPro — Task card actions (Start / Complete / Proof upload) ─────────
//
// Drop this into any card that represents an animator-actionable item:
//   - ScheduleEntry  (kind='schedule')
//   - Assignment     (kind='assignment')
//   - EventItem      (kind='event')
//
// The component is self-contained — it reads/writes runtime state via
// lib/task-state and stores media blobs via lib/media-store. Parents do NOT
// need to manage its state.

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Video, Play, CheckCircle2, X, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  addProof,
  completeTask,
  effectiveStatus,
  getTaskState,
  removeProof,
  resetTask,
  startTask,
  subscribe,
  type ProofRef,
  type TaskKind,
  type TaskState,
} from '@/lib/task-state'
import { deleteBlob, getObjectUrl, revokeObjectUrl, saveBlob } from '@/lib/media-store'

export interface TaskCardActionsProps {
  kind: TaskKind
  id: string
  /** Original status from mock data. Used so a "future" assignment doesn't show Complete. */
  originalStatus?: string
  /** Compact layout for dense kanban cards. */
  compact?: boolean
  /** Optional class to apply to the outer wrapper. */
  className?: string
}

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB per file — keeps short clips fine, stops 4K mistakes

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatStartedTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}

function formatElapsed(startedIso: string, endedIso?: string): string {
  const start = new Date(startedIso).getTime()
  const end = endedIso ? new Date(endedIso).getTime() : Date.now()
  const sec = Math.max(0, Math.floor((end - start) / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m < 1) return `${s}s`
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`
  const h = Math.floor(m / 60)
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`
}

// ─── Proof thumbnail ─────────────────────────────────────────────────────────

function ProofThumb({ proof, onRemove }: { proof: ProofRef; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let resolvedId: string | null = null
    getObjectUrl(proof.mediaId).then(u => {
      if (cancelled) return
      resolvedId = proof.mediaId
      setUrl(u)
    })
    return () => {
      cancelled = true
      // We don't revoke immediately because the URL may be reused on re-mount;
      // revoke explicitly when the proof is removed instead.
      void resolvedId
    }
  }, [proof.mediaId])

  const isVideo = proof.mime.startsWith('video/')
  const isImage = proof.mime.startsWith('image/')

  return (
    <div className="relative group flex-shrink-0">
      <a
        href={url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-14 h-14 rounded-md overflow-hidden bg-muted border border-border"
        onClick={e => { if (!url) e.preventDefault() }}
        aria-label={`Open ${proof.name}`}
      >
        {url && isImage && (
          <img src={url} alt={proof.name} className="w-full h-full object-cover" />
        )}
        {url && isVideo && (
          <div className="relative w-full h-full bg-black">
            <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="w-5 h-5 text-white drop-shadow" />
            </div>
          </div>
        )}
        {!url && (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </a>
      <button
        type="button"
        onClick={e => { e.preventDefault(); onRemove() }}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label={`Remove ${proof.name}`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function TaskCardActions({ kind, id, originalStatus, compact, className }: TaskCardActionsProps) {
  const [state, setState] = useState<TaskState>(() => getTaskState(kind, id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  // Subscribe so two cards for the same id (or two PWA windows) stay in sync.
  useEffect(() => {
    const unsub = subscribe(() => setState(getTaskState(kind, id)))
    return unsub
  }, [kind, id])

  // Live tick for elapsed time when running
  const [, force] = useState(0)
  useEffect(() => {
    if (!state.startedAt || state.completedAt) return
    const t = window.setInterval(() => force(n => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [state.startedAt, state.completedAt])

  const status = useMemo(
    () => effectiveStatus(kind, id, (originalStatus ?? 'SCHEDULED') as string),
    [kind, id, originalStatus, state.startedAt, state.completedAt],
  )

  const isCompletedOriginal = originalStatus === 'COMPLETED' || originalStatus === 'CANCELLED' || originalStatus === 'REJECTED'

  const handleStart = useCallback(() => {
    setError(null)
    setState(startTask(kind, id))
  }, [kind, id])

  const handleComplete = useCallback(() => {
    setError(null)
    setState(completeTask(kind, id))
  }, [kind, id])

  const handleUndo = useCallback(() => {
    setError(null)
    setState(resetTask(kind, id))
  }, [kind, id])

  const handleFile = useCallback(async (file: File): Promise<void> => {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError(`File too big — max ${formatBytes(MAX_BYTES)}`)
      return
    }
    setBusy(true)
    try {
      const mediaId = await saveBlob(file)
      const proof: ProofRef = {
        mediaId,
        mime: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
      // Auto-start the task on first proof upload — animator skipped Start.
      if (!state.startedAt && !state.completedAt) startTask(kind, id)
      setState(addProof(kind, id, proof))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }, [kind, id, state.startedAt, state.completedAt])

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // allow re-picking the same file
    for (const f of files) void handleFile(f)
  }, [handleFile])

  const removeProofHandler = useCallback(async (mediaId: string): Promise<void> => {
    try {
      await deleteBlob(mediaId)
    } catch { /* swallow — record cleanup still happens */ }
    revokeObjectUrl(mediaId)
    setState(removeProof(kind, id, mediaId))
  }, [kind, id])

  const showStart    = !state.startedAt && !state.completedAt && !isCompletedOriginal
  const showComplete = !!state.startedAt && !state.completedAt
  const showProof    = !!state.startedAt || !!state.completedAt
  const showUndo     = (!!state.startedAt || !!state.completedAt) && !isCompletedOriginal

  return (
    <div className={cn('space-y-2', className)}>
      {/* Action row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {showStart && (
          <Button
            size="sm"
            onClick={handleStart}
            className={cn('h-7 gap-1.5 text-[11px] font-semibold', compact && 'h-6 text-[10px] px-2')}
          >
            <Play className="w-3 h-3" />
            Start
          </Button>
        )}

        {showComplete && (
          <Button
            size="sm"
            onClick={handleComplete}
            className={cn('h-7 gap-1.5 text-[11px] font-semibold bg-green-600 hover:bg-green-700 text-white', compact && 'h-6 text-[10px] px-2')}
          >
            <CheckCircle2 className="w-3 h-3" />
            Complete
          </Button>
        )}

        {showProof && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
              disabled={busy}
              className={cn('h-7 gap-1.5 text-[11px]', compact && 'h-6 text-[10px] px-2')}
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              Photo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              disabled={busy}
              className={cn('h-7 gap-1.5 text-[11px]', compact && 'h-6 text-[10px] px-2')}
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
              Video
            </Button>
          </>
        )}

        {showUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 ml-auto"
          >
            Undo
          </button>
        )}
      </div>

      {/* Status line */}
      {state.startedAt && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {state.completedAt ? (
            <>
              <span>Done in {formatElapsed(state.startedAt, state.completedAt)}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>Started {formatStartedTime(state.startedAt)}</span>
            </>
          ) : (
            <>
              <span className="text-primary font-semibold">{formatElapsed(state.startedAt)}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>Started {formatStartedTime(state.startedAt)}</span>
            </>
          )}
        </div>
      )}

      {/* Proof strip */}
      {state.proofs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {state.proofs.map(p => (
            <ProofThumb key={p.mediaId} proof={p} onRemove={() => void removeProofHandler(p.mediaId)} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-500" role="alert">{error}</p>
      )}

      {/* Hidden file inputs.
          Photo input omits `capture` so `multiple` works: some mobile browsers
          ignore `multiple` when `capture` is set, forcing one photo at a time.
          Without `capture` the OS picker still offers the camera ("Take Photo")
          alongside the library, and lets animators attach several at once.
          Video keeps `capture="environment"` for a one-tap rear-camera record. */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
        multiple
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
    </div>
  )
}
