// ─── AnimaPro — Guest hotel picker ─────────────────────────────────────────────
//
// Public landing for a guest who arrives without a hotel pre-selected (e.g. via
// the marketing CTA). Lists every hotel and routes to /guest/[hotelId]. A real
// guest reaches /guest/[hotelId] directly by scanning the QR poster in their
// room — this picker is the catch-all for the demo + the link in app/page.tsx.

'use client'

import Link from 'next/link'
import { MapPin, Star, ArrowRight } from 'lucide-react'
import { ALL_HOTELS } from '@/lib/mock-data'
import { useTranslation } from '@/lib/i18n'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

export default function GuestHotelPicker(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-lg tracking-tight">
            AnimaPro
          </Link>
          <p className="text-mini text-muted-foreground uppercase tracking-wide">{t('guest.picker.eyebrow')}</p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('guest.picker.title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('guest.picker.subtitle')}</p>
        </div>
        <ul className="space-y-2">
          {ALL_HOTELS.map(h => (
            <li key={h.id}>
              <Link
                href={`/guest/${h.id}`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{h.name}</p>
                  <p className="text-13 text-muted-foreground flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {h.city}
                    <span className="text-muted-foreground/40">·</span>
                    <Star className="w-3.5 h-3.5 fill-current text-primary" />
                    {h.tripAdvisorRating.toFixed(1)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <PWAInstallPrompt />
    </div>
  )
}
