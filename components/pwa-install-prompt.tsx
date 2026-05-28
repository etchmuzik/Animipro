'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Register the service worker once per session. Lives here because
  // PWAInstallPrompt is already mounted on every top-level route and we don't
  // want to duplicate registration code in 6 layouts.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    // Defer to idle so it never blocks the first paint or the install prompt.
    const reg = (): void => {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* silent — SW is best-effort */ })
    }
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
    if (ric) {
      ric(reg)
    } else {
      window.setTimeout(reg, 2000)
    }
  }, [])

  useEffect(() => {
    // Check if already installed as standalone
    // `navigator.standalone` is a non-standard iOS Safari flag not in lib.dom.
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)
    if (standalone) return

    // Check if dismissed recently (24h cooldown)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return

    // Detect iOS
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(ios)

    if (ios) {
      // On iOS, show the manual install guide after a short delay
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android / Desktop: listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt, isIOS])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    setShowIOSGuide(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  if (isStandalone || !showBanner) return null

  return (
    <>
      {/* Install banner */}
      <div className={cn(
        'fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50',
        'bg-brand-navy-elev2 text-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10',
        'animate-in slide-in-from-bottom-4 fade-in duration-500',
      )}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">Install AnimaPro</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Add to your home screen for the full app experience — offline access, instant launch, no browser bar.
              </p>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="text-white/30 hover:text-white/70 transition-colors shrink-0 grid place-items-center -m-2 p-2 w-10 h-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              {isIOS ? 'How to Install' : 'Install App'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/40 hover:text-white/70 text-xs font-semibold px-3 py-2.5 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      {/* iOS install guide overlay */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden mb-4 animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-brand-navy-elev2 px-5 py-4 flex items-center justify-between">
              <p className="text-white font-bold text-sm">Install AnimaPro on iPhone</p>
              <button onClick={handleDismiss} aria-label="Close" className="text-white/40 hover:text-white transition-colors grid place-items-center -m-2 p-2 w-10 h-10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { step: '1', text: 'Tap the Share button', sub: 'The square with an arrow at the bottom of Safari' },
                { step: '2', text: 'Scroll down and tap "Add to Home Screen"', sub: 'You may need to scroll the action sheet' },
                { step: '3', text: 'Tap "Add" in the top right', sub: 'AnimaPro will appear on your home screen' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{s.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy-elev2">{s.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={handleDismiss}
                className="w-full bg-brand-navy-elev2 text-white font-bold py-3 rounded-xl text-sm hover:bg-brand-navy-elev1 transition-colors mt-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
