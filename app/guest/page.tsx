// ─── Animipro — Guest hotel picker ─────────────────────────────────────────────
//
// Public landing for a guest who arrives without a hotel pre-selected (e.g. via
// the marketing CTA). Lists every hotel and routes to /guest/[hotelId]. A real
// guest reaches /guest/[hotelId] directly by scanning the QR poster in their
// room — this picker is the catch-all for the demo + the link in app/page.tsx.

'use client'

import Link from 'next/link'
import { MapPin, Star, ArrowRight, Waves } from 'lucide-react'
import { ALL_HOTELS } from '@/lib/mock-data'
import { useTranslation } from '@/lib/i18n'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

// Curated coastal/resort photos per city. Unsplash for the demo — swap to
// hosted assets later. Falls back to a single Red-Sea shot when unknown.
const CITY_IMAGE: Record<string, string> = {
  SHARM_EL_SHEIKH: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=70',
  HURGHADA:        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=70',
  EL_GOUNA:        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=70',
  MARSA_ALAM:      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70',
  DAHAB:           'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=70',
  AIN_SOKHNA:      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=70',
  TABA:            'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=70',
  MAKADI_BAY:      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=70',
  SOMA_BAY:        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=70',
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70'

export default function GuestHotelPicker(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <div data-theme="guest" className="min-h-[100dvh] bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-lg tracking-tight">
            Animipro
          </Link>
          <p className="text-mini text-muted-foreground uppercase tracking-[0.18em]">{t('guest.picker.eyebrow')}</p>
        </div>
      </header>

      {/* Hero band — coastal photo with brand wash */}
      <section className="relative overflow-hidden border-b border-border/60">
        <img
          src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1600&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-teal-800)/0.85)] via-[hsl(var(--brand-teal)/0.7)] to-[hsl(var(--brand-navy-elev1)/0.85)] mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 text-white text-mini font-semibold mb-4">
            <Waves className="w-3 h-3" />
            {t('guest.picker.eyebrow')}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] text-white max-w-xl">
            {t('guest.picker.title')}
          </h1>
          <p className="mt-3 text-white/85 max-w-lg text-sm sm:text-base">
            {t('guest.picker.subtitle')}
          </p>
        </div>
      </section>

      {/* Hotel grid — photo card per hotel */}
      <main className="max-w-4xl mx-auto px-5 py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_HOTELS.map(h => {
            const img = CITY_IMAGE[h.city] ?? FALLBACK_IMG
            return (
              <li key={h.id}>
                <Link
                  href={`/guest/${h.id}`}
                  className="group block overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-foreground/10"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={img}
                      alt={h.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-foreground text-mini font-bold shadow">
                      <Star className="w-3 h-3 fill-current text-amber-500" />
                      {h.tripAdvisorRating.toFixed(1)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-tiny font-bold uppercase tracking-[0.18em] opacity-85 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {h.city.replaceAll('_', ' ')}
                      </p>
                      <h3 className="font-display text-lg font-extrabold leading-tight mt-0.5">{h.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-13 text-muted-foreground">
                    <span className="font-semibold">{t('guest.picker.enterCta')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
      <PWAInstallPrompt />
    </div>
  )
}
