// ─── AnimaPro — Tickets · Scan tab ──────────────────────────────────────────
//
// Door staff hit this tab to validate guest QR codes. Two paths:
//   1. Camera scanner (html5-qrcode) — preferred on mobile.
//   2. Manual entry — type/paste the short ticket code if the camera fails.
//
// Result is rendered with a big colored panel + ticket details. Auto-resets
// after 5 seconds so the scanner is ready for the next guest.

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera, CameraOff, KeyRound, CheckCircle2, XCircle, AlertTriangle,
  Loader2, RefreshCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getClub,
  getClubNight,
  scanTicket,
  type ScanResult,
} from '@/lib/club-tickets'
import type { AppUser } from '@/lib/roles'

// Lazy-load html5-qrcode only when the camera is started. The package is
// fairly heavy (~50KB) and isn't needed if the user only types codes.
import type { Html5Qrcode as Html5QrcodeT } from 'html5-qrcode'

interface ScanPanelProps {
  currentUser: AppUser
}

const SCANNER_ELEMENT_ID = 'animapro-qr-scanner'

export function ScanPanel({ currentUser }: ScanPanelProps): React.ReactElement {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const scannerRef = useRef<Html5QrcodeT | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  const handleResult = useCallback((res: ScanResult) => {
    setResult(res)
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(() => setResult(null), 5000)
  }, [])

  const onScanned = useCallback((decoded: string) => {
    const res = scanTicket(decoded, {
      scannerUserId: currentUser.id,
      scannerName: currentUser.name,
    })
    handleResult(res)
  }, [currentUser.id, currentUser.name, handleResult])

  // Start / stop camera lifecycle. Re-runs whenever mode flips to/from camera.
  useEffect(() => {
    if (mode !== 'camera') {
      // Tear down any running scanner.
      const inst = scannerRef.current
      if (inst) {
        inst.stop().catch(() => { /* swallow */ })
        scannerRef.current = null
      }
      setCameraActive(false)
      return
    }

    let cancelled = false
    setCameraStarting(true)
    setCameraError(null)

    import('html5-qrcode')
      .then(mod => {
        if (cancelled) return
        const inst = new mod.Html5Qrcode(SCANNER_ELEMENT_ID)
        scannerRef.current = inst
        return inst.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 240 },
          (decoded: string) => onScanned(decoded),
          undefined,
        ).then(() => {
          if (!cancelled) {
            setCameraActive(true)
            setCameraStarting(false)
          }
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCameraStarting(false)
        const msg = err instanceof Error ? err.message : String(err)
        setCameraError(msg.includes('Permission')
          ? 'Camera permission denied. Allow camera access or switch to manual entry.'
          : 'Could not start camera. Try manual entry instead.')
      })

    return () => {
      cancelled = true
      const inst = scannerRef.current
      if (inst) {
        inst.stop().catch(() => { /* swallow */ })
        scannerRef.current = null
      }
    }
  }, [mode, onScanned])

  function handleManualSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!manualInput.trim()) return
    const res = scanTicket(manualInput.trim(), {
      scannerUserId: currentUser.id,
      scannerName: currentUser.name,
    })
    handleResult(res)
    setManualInput('')
  }

  function handleClear(): void {
    setResult(null)
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
  }

  // Read ?scan= deep link on mount (phone-camera shortcut from QR URL).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const scan = params.get('scan')
    if (scan) {
      const res = scanTicket(scan, {
        scannerUserId: currentUser.id,
        scannerName: currentUser.name,
      })
      handleResult(res)
      // Clean the URL so a reload doesn't re-scan.
      params.delete('scan')
      const next = params.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${next ? '?' + next : ''}`)
    }
  }, [currentUser.id, currentUser.name, handleResult])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 max-w-5xl">
      {/* Left: scanner */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={cn(
              'flex-1 h-9 rounded-md border text-mini font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
              mode === 'camera' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            <Camera className="w-3.5 h-3.5" /> Camera
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 h-9 rounded-md border text-mini font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
              mode === 'manual' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            <KeyRound className="w-3.5 h-3.5" /> Manual code
          </button>
        </div>

        {mode === 'camera' ? (
          <div className="relative aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden bg-black border border-border">
            <div id={SCANNER_ELEMENT_ID} className="w-full h-full" />
            {cameraStarting && (
              <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-mini">Starting camera…</p>
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 grid place-items-center bg-black/80 text-white p-6 text-center">
                <div>
                  <CameraOff className="w-8 h-8 mx-auto mb-3 text-red-400" />
                  <p className="text-sm font-semibold mb-2">{cameraError}</p>
                  <Button size="sm" variant="outline" className="text-foreground" onClick={() => setMode('manual')}>
                    Enter code manually
                  </Button>
                </div>
              </div>
            )}
            {cameraActive && !cameraError && (
              <div className="absolute bottom-3 left-3 right-3 text-center bg-black/50 backdrop-blur-sm rounded-md py-1.5 px-2 text-mini text-white">
                Hold the QR steady inside the frame
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3 max-w-md mx-auto">
            <label className="text-mini font-semibold text-muted-foreground block">
              Ticket code or scan URL
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="e.g. A3F92B1C.7K2P or https://…?scan=…"
              autoFocus
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" className="w-full h-10" disabled={!manualInput.trim()}>
              Validate
            </Button>
            <p className="text-tiny text-muted-foreground text-center">
              Paste the code printed on the guest's ticket — case doesn't matter.
            </p>
          </form>
        )}
      </div>

      {/* Right: result panel */}
      <div>
        <p className="text-eyebrow mb-2">Result</p>
        {result ? <ResultCard result={result} onClear={handleClear} /> : <IdlePanel />}
        <p className="mt-3 text-tiny text-muted-foreground text-center">
          Scanning as <span className="font-semibold text-foreground">{currentUser.name}</span> · result auto-clears after 5s
        </p>
      </div>
    </div>
  )
}

function IdlePanel(): React.ReactElement {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
      <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p className="text-sm">Ready for the next ticket.</p>
    </div>
  )
}

function ResultCard({ result, onClear }: { result: ScanResult; onClear: () => void }): React.ReactElement {
  const tone = useMemo(() => {
    switch (result.outcome) {
      case 'OK':              return { Icon: CheckCircle2,   ring: 'ring-green-500/60', fill: 'bg-green-500/15',  text: 'text-green-300', label: 'Entry granted'  }
      case 'ALREADY_SCANNED': return { Icon: AlertTriangle,  ring: 'ring-amber-500/60', fill: 'bg-amber-500/15',  text: 'text-amber-300', label: 'Already used'    }
      case 'REFUNDED':        return { Icon: XCircle,        ring: 'ring-red-500/60',   fill: 'bg-red-500/15',    text: 'text-red-300',   label: 'Refunded'        }
      case 'TAMPERED':        return { Icon: XCircle,        ring: 'ring-red-500/60',   fill: 'bg-red-500/15',    text: 'text-red-300',   label: 'Invalid code'    }
      case 'NOT_FOUND':       return { Icon: XCircle,        ring: 'ring-red-500/60',   fill: 'bg-red-500/15',    text: 'text-red-300',   label: 'Not found'       }
    }
  }, [result.outcome])

  const ticket = result.ticket
  const night = ticket ? getClubNight(ticket.clubNightId) : null
  const club = night ? getClub(night.clubId) : null

  return (
    <div className={cn('rounded-xl border border-border ring-2 overflow-hidden', tone.ring)}>
      <div className={cn('p-5 flex items-center gap-3', tone.fill, tone.text)}>
        <tone.Icon className="w-8 h-8 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold leading-tight">{tone.label}</p>
          <p className="text-mini opacity-90">{result.message}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 h-7 px-2 rounded-md text-mini font-semibold border border-current/30 hover:bg-current/10 transition-colors"
        >
          Clear
        </button>
      </div>

      {ticket && club && night && (
        <div className="p-4 bg-card">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-13">
            <dt className="text-muted-foreground">Guest</dt>
            <dd className="text-foreground font-semibold truncate">
              {ticket.guestName} {ticket.guestRoom && <span className="text-muted-foreground font-normal">· Room {ticket.guestRoom}</span>}
            </dd>
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="text-foreground font-semibold">{ticket.guestCount}</dd>
            <dt className="text-muted-foreground">Club</dt>
            <dd className="text-foreground font-semibold">{club.name}</dd>
            <dt className="text-muted-foreground">Night</dt>
            <dd className="text-foreground font-semibold">{night.theme}</dd>
            <dt className="text-muted-foreground">Sold by</dt>
            <dd className="text-foreground font-semibold">{ticket.sellerName}</dd>
          </dl>
          <button
            type="button"
            onClick={onClear}
            className="mt-3 w-full h-9 rounded-md border border-border text-mini font-semibold text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Ready for next guest
          </button>
        </div>
      )}
    </div>
  )
}
