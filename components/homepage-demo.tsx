// ─── Animipro — Homepage interactive mini-demo ──────────────────────────────
//
// A self-contained mock animator card that lets visitors try the new task
// flow (Start → live timer → Photo proof → Complete) without leaving the
// marketing page. No backend, no localStorage — purely useState-driven so
// re-mounting resets the demo to its initial state.
//
// The visual design intentionally MIRRORS the production card style so the
// "try it here" experience matches what the user will see at /platform.

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, CheckCircle2, Camera, Video, Clock, MapPin, User,
  BellRing, Sparkles, RotateCcw, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type DemoStatus = 'scheduled' | 'in_progress' | 'completed'

interface DemoProof {
  id: string
  kind: 'photo' | 'video'
  // Tailwind gradient classes for the fake thumbnail
  gradient: string
}

const FAKE_PHOTO_GRADIENTS = [
  { gradient: 'from-amber-400 via-orange-500 to-pink-500' },
  { gradient: 'from-cyan-400 via-blue-500 to-indigo-600' },
  { gradient: 'from-teal-400 via-emerald-500 to-cyan-600' },
  { gradient: 'from-purple-400 via-pink-500 to-rose-500' },
]
const FAKE_VIDEO_GRADIENTS = [
  { gradient: 'from-slate-600 via-zinc-700 to-slate-900' },
  { gradient: 'from-rose-500 via-red-600 to-orange-700' },
]

function formatElapsed(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m < 1) return `${s}s`
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export function HomepageDemo() {
  const [status, setStatus] = useState<DemoStatus>('scheduled')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [completedAt, setCompletedAt] = useState<number | null>(null)
  const [proofs, setProofs] = useState<DemoProof[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [reminderFlash, setReminderFlash] = useState(false)
  const proofIdRef = useRef(0)

  // Live ticker while in progress
  useEffect(() => {
    if (status !== 'in_progress') return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [status])

  // Auto-fire reminder banner 4s after mount (only if still scheduled)
  useEffect(() => {
    if (status !== 'scheduled') return
    const t = window.setTimeout(() => setReminderFlash(true), 3500)
    return () => window.clearTimeout(t)
  }, [status])

  const handleStart = useCallback(() => {
    const t = Date.now()
    setStartedAt(t)
    setNow(t)
    setStatus('in_progress')
    setReminderFlash(false)
  }, [])

  const handleComplete = useCallback(() => {
    setCompletedAt(Date.now())
    setStatus('completed')
  }, [])

  const handleAddProof = useCallback((kind: 'photo' | 'video') => {
    // Auto-start if user tapped Photo/Video first
    if (status === 'scheduled') {
      const t = Date.now()
      setStartedAt(t)
      setNow(t)
      setStatus('in_progress')
      setReminderFlash(false)
    }
    const pool = kind === 'photo' ? FAKE_PHOTO_GRADIENTS : FAKE_VIDEO_GRADIENTS
    const pick = pool[proofIdRef.current % pool.length]
    proofIdRef.current++
    setProofs(prev => [
      ...prev,
      { id: `proof-${proofIdRef.current}`, kind, gradient: pick.gradient },
    ])
  }, [status])

  const handleReset = useCallback(() => {
    setStatus('scheduled')
    setStartedAt(null)
    setCompletedAt(null)
    setProofs([])
    setNow(Date.now())
    setReminderFlash(false)
    proofIdRef.current = 0
  }, [])

  const removeProof = useCallback((id: string) => {
    setProofs(prev => prev.filter(p => p.id !== id))
  }, [])

  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0
    return (completedAt ?? now) - startedAt
  }, [startedAt, completedAt, now])

  const statusConfig = {
    scheduled:   { label: 'Scheduled',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    in_progress: { label: 'In Progress', cls: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    completed:   { label: 'Completed',   cls: 'bg-green-100 text-green-700 border-green-200' },
  }[status]

  return (
    <div className="relative">
      {/* Glow halo behind the card */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-fuchsia-500/30 rounded-3xl blur-2xl opacity-60" />

      <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-zinc-900/10 overflow-hidden">

        {/* Reminder banner — appears 3.5s after mount, slides in from top */}
        <AnimatePresence>
          {reminderFlash && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-2"
            >
              <BellRing className="w-3.5 h-3.5 animate-pulse" />
              <span className="flex-1">In 12 min: <span className="font-extrabold">Aqua Gym</span> at Main Pool</span>
              <button
                type="button"
                onClick={() => setReminderFlash(false)}
                className="w-5 h-5 rounded-full hover:bg-white/15 flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card content */}
        <div className="p-4 sm:p-5">
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="text-center shrink-0">
              <p className="text-sm font-black text-zinc-900 leading-none">10:00</p>
              <p className="text-micro text-zinc-400 mt-0.5 font-medium">10:45</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-zinc-900 leading-tight">Aqua Gym</p>
              <div className="flex items-center gap-3 mt-1 text-mini text-zinc-500">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Amira Hassan</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Main Pool</span>
              </div>
            </div>
            <span className={cn('text-micro font-bold border px-2 py-0.5 rounded-full shrink-0', statusConfig.cls)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
            {status === 'scheduled' && (
              <motion.button
                type="button"
                onClick={handleStart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md shadow-cyan-500/30"
              >
                <Play className="w-3.5 h-3.5" /> Start
              </motion.button>
            )}

            {status === 'in_progress' && (
              <motion.button
                type="button"
                onClick={handleComplete}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md shadow-green-500/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </motion.button>
            )}

            {(status === 'in_progress' || status === 'completed') && (
              <>
                <motion.button
                  type="button"
                  onClick={() => handleAddProof('photo')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold px-3 py-2 rounded-lg"
                >
                  <Camera className="w-3.5 h-3.5" /> Photo
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleAddProof('video')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold px-3 py-2 rounded-lg"
                >
                  <Video className="w-3.5 h-3.5" /> Video
                </motion.button>
              </>
            )}

            {status !== 'scheduled' && (
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto inline-flex items-center gap-1 text-mini text-zinc-500 hover:text-zinc-900 font-medium"
                aria-label="Reset demo"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Status line */}
          <AnimatePresence>
            {startedAt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-3 text-mini text-zinc-500"
              >
                <Clock className="w-3 h-3" />
                {completedAt ? (
                  <>
                    <span className="font-semibold text-green-600">Done in {formatElapsed(completedAt - startedAt)}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-cyan-600 tabular-nums">{formatElapsed(elapsedMs)}</span>
                    <span className="text-zinc-300">•</span>
                    <span>Running live</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Proof thumbnails */}
          <AnimatePresence>
            {proofs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-zinc-100"
              >
                {proofs.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative group"
                  >
                    <div className={cn(
                      'w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br shadow-md flex items-center justify-center text-white',
                      p.gradient,
                    )}>
                      {p.kind === 'video'
                        ? <Play className="w-5 h-5 drop-shadow" />
                        : <Camera className="w-5 h-5 drop-shadow opacity-90" />
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProof(p.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove proof"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Onboarding hint */}
          <AnimatePresence>
            {status === 'scheduled' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 text-mini text-zinc-400 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Try it. Tap <span className="font-bold text-cyan-600">Start</span> to begin the activity
              </motion.p>
            )}
            {status === 'completed' && proofs.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-mini text-zinc-400 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-green-500" />
                Nicely done! Add a photo or video to show proof of activity.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
