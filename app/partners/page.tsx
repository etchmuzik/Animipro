'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Sun, Building2, Globe2, Code2,
  Sparkles, CheckCircle2,
} from 'lucide-react'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
  addPartnerApplication, type PartnerTier,
} from '@/lib/partner-applications'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Same brand-law curve as the homepage hero and careers page.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
})

// ─── Tier definitions ─────────────────────────────────────────────────────────

const TIERS: {
  id: PartnerTier
  icon: typeof Building2
  nameKey: string
  priceKey: string
  priceSubKey: string
  blurbKey: string
  featuresKey: string
  gradient: string
  highlight?: boolean
}[] = [
  {
    id: 'STUDIO',
    icon: Building2,
    nameKey: 'partners.studioName',
    priceKey: 'partners.studioPrice',
    priceSubKey: 'partners.studioPriceSub',
    blurbKey: 'partners.studioBlurb',
    featuresKey: 'partners.studioFeatures',
    gradient: 'from-[oklch(0.72_0.14_220)] to-[oklch(0.55_0.12_215)]',
  },
  {
    id: 'COUNTRY',
    icon: Globe2,
    nameKey: 'partners.countryName',
    priceKey: 'partners.countryPrice',
    priceSubKey: 'partners.countryPriceSub',
    blurbKey: 'partners.countryBlurb',
    featuresKey: 'partners.countryFeatures',
    gradient: 'from-[oklch(0.68_0.18_36)] to-[oklch(0.6_0.2_25)]',
    highlight: true,
  },
  {
    id: 'SOURCE',
    icon: Code2,
    nameKey: 'partners.sourceName',
    priceKey: 'partners.sourcePrice',
    priceSubKey: 'partners.sourcePriceSub',
    blurbKey: 'partners.sourceBlurb',
    featuresKey: 'partners.sourceFeatures',
    gradient: 'from-[oklch(0.7_0.14_150)] to-[oklch(0.5_0.12_180)]',
  },
]

// ─── Apply form ──────────────────────────────────────────────────────────────

interface FormState {
  companyName: string
  contactName: string
  email: string
  phone: string
  country: string
  hotelsServed: string
  tier: PartnerTier
  pitch: string
  websiteUrl: string
}

const EMPTY_FORM: FormState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  hotelsServed: '',
  tier: 'STUDIO',
  pitch: '',
  websiteUrl: '',
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function ApplyForm({ initialTier }: { initialTier: PartnerTier }) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, tier: initialTier })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    form.companyName.trim().length > 0 &&
    form.contactName.trim().length > 0 &&
    EMAIL_PATTERN.test(form.email.trim()) &&
    !submitting

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      addPartnerApplication({
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim() || 'Not specified',
        hotelsServed: Number(form.hotelsServed) || 0,
        tier: form.tier,
        pitch: form.pitch.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
      })
      setSent(true)
    } catch {
      setError(t('partners.formError'))
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl bg-white/80 ring-1 ring-[oklch(0.5_0.1_212_/_0.15)] p-8 sm:p-10 text-center shadow-[0_24px_60px_-30px_oklch(0.3_0.05_220_/_0.4)]">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[oklch(0.7_0.16_150_/_0.15)] ring-2 ring-[oklch(0.65_0.16_150_/_0.3)]">
          <CheckCircle2 className="h-8 w-8 text-[oklch(0.55_0.15_150)]" />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-[oklch(0.27_0.055_220)]">{t('partners.successTitle')}</h3>
        <p className="mt-3 text-[oklch(0.42_0.03_220)] leading-relaxed max-w-md mx-auto">
          {t('partners.successBody', { name: form.contactName })}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { setForm({ ...EMPTY_FORM, tier: initialTier }); setSubmitting(false); setSent(false) }}
            className="rounded-2xl bg-[oklch(0.5_0.1_212)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[oklch(0.45_0.1_212)]"
          >
            {t('partners.successAgain')}
          </button>
          <Link href="/" className="text-sm font-semibold text-[oklch(0.42_0.03_220)] hover:text-[oklch(0.27_0.055_220)] transition-colors">
            {t('partners.successHome')}
          </Link>
        </div>
      </div>
    )
  }

  // text-base on mobile (16px) is intentional: it prevents iOS Safari from
  // auto-zooming the page when the user focuses an input. From sm: up we drop
  // back to text-sm for visual rhythm on bigger screens.
  const fieldCls =
    'w-full rounded-xl border border-[oklch(0.4_0.04_215_/_0.18)] bg-white/70 px-4 py-2.5 text-base sm:text-sm text-[oklch(0.27_0.055_220)] placeholder:text-[oklch(0.6_0.02_220)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.5_0.1_212_/_0.3)] focus:border-[oklch(0.5_0.1_212)] transition-colors'
  const labelCls = 'mb-1.5 block text-xs font-bold text-[oklch(0.36_0.04_218)]'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white/80 ring-1 ring-[oklch(0.5_0.1_212_/_0.15)] p-6 sm:p-8 shadow-[0_24px_60px_-30px_oklch(0.3_0.05_220_/_0.4)]"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="pa-company">{t('partners.formCompany')} *</label>
          <input id="pa-company" className={fieldCls} value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Red Sea Digital" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-name">{t('partners.formContact')} *</label>
          <input id="pa-name" className={fieldCls} value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Mahmoud Selim" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-email">{t('partners.formEmail')} *</label>
          <input id="pa-email" type="email" className={fieldCls} value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@agency.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-phone">{t('partners.formPhone')}</label>
          <input id="pa-phone" type="tel" className={fieldCls} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+20 100 000 0000" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-country">{t('partners.formCountry')}</label>
          <input id="pa-country" className={fieldCls} value={form.country} onChange={e => update('country', e.target.value)} placeholder="Egypt" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-hotels">{t('partners.formHotelsServed')}</label>
          <input id="pa-hotels" type="number" min={0} max={9999} className={fieldCls} value={form.hotelsServed} onChange={e => update('hotelsServed', e.target.value)} placeholder="12" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pa-tier">{t('partners.formTier')} *</label>
          <select id="pa-tier" className={cn(fieldCls, 'appearance-none')} value={form.tier} onChange={e => update('tier', e.target.value as PartnerTier)}>
            {TIERS.map(tier => (
              <option key={tier.id} value={tier.id}>{t(tier.nameKey)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={labelCls} htmlFor="pa-website">{t('partners.formWebsite')}</label>
        <input id="pa-website" type="url" className={fieldCls} value={form.websiteUrl} onChange={e => update('websiteUrl', e.target.value)} placeholder="https://" />
      </div>

      <div className="mt-4">
        <label className={labelCls} htmlFor="pa-pitch">{t('partners.formPitch')}</label>
        <textarea
          id="pa-pitch"
          rows={4}
          className={cn(fieldCls, 'resize-none')}
          value={form.pitch}
          onChange={e => update('pitch', e.target.value)}
          placeholder={t('partners.formPitchPlaceholder')}
        />
      </div>

      {error && <p className="mt-4 text-sm font-medium text-[oklch(0.55_0.2_25)]">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_oklch(0.5_0.1_212_/_0.7)] transition-all hover:bg-[oklch(0.45_0.1_212)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? t('partners.formSubmitting') : t('partners.formSubmit')}
        {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
      <p className="mt-3 text-center text-mini text-[oklch(0.55_0.03_220)]">
        {t('partners.formDemoNote')}
      </p>
    </form>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const { t } = useTranslation()
  const [selectedTier, setSelectedTier] = useState<PartnerTier>('COUNTRY')

  function chooseTier(tier: PartnerTier) {
    setSelectedTier(tier)
    if (typeof document !== 'undefined') {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.013_84)]">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero-canvas hero-grain relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-8 pb-16 sm:pt-10 sm:pb-24">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[oklch(0.42_0.03_220)] transition-colors hover:text-[oklch(0.27_0.055_220)]">
              <ArrowLeft className="h-4 w-4" /> AnimaPro
            </Link>
            <div className="flex items-center gap-1">
              <LanguageSwitcher variant="light" />
              <Link
                href="/platform"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[oklch(0.36_0.05_215)] ring-1 ring-[oklch(0.4_0.04_215_/_0.2)] transition-colors hover:bg-white/60"
              >
                {t('common.liveDemo')}
              </Link>
            </div>
          </div>

          <div aria-hidden className="hero-sun pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full" />

          <div className="relative mt-12 sm:mt-16 max-w-2xl">
            <motion.div
              {...rise(0.05)}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 ring-1 ring-[oklch(0.52_0.1_210_/_0.18)] backdrop-blur-sm"
            >
              <Sun className="h-3.5 w-3.5 text-[oklch(0.7_0.16_60)]" />
              <span className="text-13 font-semibold text-[oklch(0.34_0.05_215)]">{t('partners.kicker')}</span>
            </motion.div>

            <motion.h1
              {...rise(0.12)}
              className="mt-6 font-display font-extrabold leading-[0.95] tracking-[-0.03em] text-[oklch(0.27_0.055_220)] text-balance"
              style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.75rem)' }}
            >
              {t('partners.titleLead')}
              <br className="hidden sm:block" />{' '}
              <span className="text-[oklch(0.58_0.19_36)]">{t('partners.titleAccent')}</span>
            </motion.h1>

            <motion.p {...rise(0.2)} className="mt-6 text-lg leading-relaxed text-[oklch(0.42_0.03_220)] max-w-[54ch]">
              {t('partners.intro')}
            </motion.p>

            <motion.div {...rise(0.28)} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#apply"
                className="group inline-flex items-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_oklch(0.5_0.1_212_/_0.7)] transition-all hover:bg-[oklch(0.45_0.1_212)] active:translate-y-px"
              >
                {t('partners.applyAsPartner')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#tiers" className="rounded-2xl px-6 py-4 text-base font-semibold text-[oklch(0.36_0.05_215)] ring-1 ring-[oklch(0.4_0.04_215_/_0.2)] transition-colors hover:bg-white/60">
                {t('partners.seeTiers')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────────── */}
      <section id="tiers" className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[oklch(0.5_0.1_212)]">{t('partners.tiersKicker')}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[oklch(0.27_0.055_220)] text-balance">
            {t('partners.tiersTitle')}
          </h2>
          <p className="mt-4 text-[oklch(0.42_0.03_220)] leading-relaxed">
            {t('partners.tiersIntro')}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map(tier => {
            const featuresList = t(tier.featuresKey).split(' · ')
            return (
              <button
                key={tier.id}
                onClick={() => chooseTier(tier.id)}
                className={cn(
                  'group flex flex-col rounded-2xl bg-white/80 p-6 text-start ring-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_oklch(0.3_0.05_220_/_0.4)]',
                  tier.highlight
                    ? 'ring-[oklch(0.5_0.1_212_/_0.4)] shadow-[0_14px_30px_-18px_oklch(0.5_0.1_212_/_0.5)]'
                    : 'ring-[oklch(0.4_0.04_215_/_0.12)] hover:ring-[oklch(0.5_0.1_212_/_0.3)]',
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/30', tier.gradient)}>
                    <tier.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[oklch(0.27_0.055_220)]">{t(tier.nameKey)}</h3>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-black text-[oklch(0.27_0.055_220)] tabular-nums">{t(tier.priceKey)}</span>
                </div>
                <p className="text-xs font-semibold text-[oklch(0.5_0.03_220)] mb-4">{t(tier.priceSubKey)}</p>
                <p className="text-sm leading-relaxed text-[oklch(0.45_0.03_220)] mb-5 flex-1">{t(tier.blurbKey)}</p>
                <ul className="space-y-2 text-sm mb-5">
                  {featuresList.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[oklch(0.36_0.04_218)]">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[oklch(0.55_0.15_150)]" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[oklch(0.5_0.1_212)]">
                  {t('partners.pickThisTier')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Apply ────────────────────────────────────────────────────────────── */}
      <section id="apply" className="mx-auto max-w-3xl px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-8">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[oklch(0.5_0.1_212)]">
            <Sparkles className="h-3.5 w-3.5" /> {t('partners.applicationKicker')}
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[oklch(0.27_0.055_220)]">
            {t('partners.applicationTitle')}
          </h2>
          <p className="mt-3 text-[oklch(0.42_0.03_220)]">{t('partners.applicationIntro')}</p>
        </div>

        <ApplyForm key={selectedTier} initialTier={selectedTier} />
      </section>

      <PWAInstallPrompt />
    </div>
  )
}
