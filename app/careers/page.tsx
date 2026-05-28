'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Sun, Waves, Music, Baby, LifeBuoy,
  Globe, Sparkles, CheckCircle2, Upload, X, Plane, HeartHandshake, Trophy,
} from 'lucide-react'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { LanguageSwitcher } from '@/components/language-switcher'
import { saveBlob } from '@/lib/media-store'
import { addApplication, EMAIL_PATTERN, type ApplicantRole } from '@/lib/applications'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Exponential ease-out — same brand-law curve as the homepage hero.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
})

// ─── Open roles ────────────────────────────────────────────────────────────────

const OPEN_ROLES: {
  role: ApplicantRole
  icon: typeof Waves
  titleKey: string
  blurbKey: string
  gradient: string
}[] = [
  { role: 'ANIMATOR',    icon: Waves,    titleKey: 'careers.roleAnimator',    blurbKey: 'careers.roleAnimatorBlurb',    gradient: 'from-[oklch(0.7_0.15_150)] to-[oklch(0.55_0.12_190)]' },
  { role: 'ENTERTAINER', icon: Music,    titleKey: 'careers.roleEntertainer', blurbKey: 'careers.roleEntertainerBlurb', gradient: 'from-[oklch(0.68_0.18_320)] to-[oklch(0.6_0.2_30)]' },
  { role: 'KIDS_CLUB',   icon: Baby,     titleKey: 'careers.roleKids',        blurbKey: 'careers.roleKidsBlurb',        gradient: 'from-[oklch(0.72_0.16_20)] to-[oklch(0.7_0.17_350)]' },
  { role: 'LIFEGUARD',   icon: LifeBuoy, titleKey: 'careers.roleLifeguard',   blurbKey: 'careers.roleLifeguardBlurb',   gradient: 'from-[oklch(0.75_0.15_60)] to-[oklch(0.62_0.18_35)]' },
]

const PERKS = [
  { icon: Plane,          labelKey: 'careers.perkFlights' },
  { icon: HeartHandshake, labelKey: 'careers.perkAccommodation' },
  { icon: Trophy,         labelKey: 'careers.perkGrowth' },
  { icon: Sun,            labelKey: 'careers.perkRedSea' },
]

// ─── Apply form ──────────────────────────────────────────────────────────────

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  role: ApplicantRole
  languages: string
  specialties: string
  yearsExperience: string
  pitch: string
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  role: 'ANIMATOR',
  languages: '',
  specialties: '',
  yearsExperience: '',
  pitch: '',
}

const ROLE_OPTIONS: { value: ApplicantRole; labelKey: string }[] = [
  { value: 'ANIMATOR', labelKey: 'careers.roleAnimator' },
  { value: 'ENTERTAINER', labelKey: 'careers.roleEntertainer' },
  { value: 'KIDS_CLUB', labelKey: 'careers.roleKids' },
  { value: 'LIFEGUARD', labelKey: 'careers.roleLifeguard' },
]

function splitList(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

function ApplyForm({ initialRole }: { initialRole: ApplicantRole }) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, role: initialRole })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    EMAIL_PATTERN.test(form.email.trim()) &&
    !submitting

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      let cvMediaId: string | undefined
      let cvName: string | undefined
      let cvMime: string | undefined
      if (file) {
        cvMediaId = await saveBlob(file)
        cvName = file.name
        cvMime = file.type
      }
      addApplication({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        nationality: form.nationality.trim() || 'Not specified',
        role: form.role,
        languages: splitList(form.languages),
        specialties: splitList(form.specialties),
        yearsExperience: Number(form.yearsExperience) || 0,
        pitch: form.pitch.trim(),
        hotelName: 'Any Red Sea resort',
        cvMediaId,
        cvName,
        cvMime,
      })
      setSent(true)
    } catch {
      setError(t('careers.formError'))
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl bg-white/80 ring-1 ring-[oklch(0.5_0.1_212_/_0.15)] p-8 sm:p-10 text-center shadow-[0_24px_60px_-30px_oklch(0.3_0.05_220_/_0.4)]">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[oklch(0.7_0.16_150_/_0.15)] ring-2 ring-[oklch(0.65_0.16_150_/_0.3)]">
          <CheckCircle2 className="h-8 w-8 text-[oklch(0.55_0.15_150)]" />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-[oklch(0.27_0.055_220)]">{t('careers.successTitle')}</h3>
        <p className="mt-3 text-[oklch(0.42_0.03_220)] leading-relaxed max-w-md mx-auto">
          {t('careers.successBody', { name: form.firstName })}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { setForm({ ...EMPTY_FORM, role: initialRole }); setFile(null); setSubmitting(false); setSent(false) }}
            className="rounded-2xl bg-[oklch(0.5_0.1_212)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[oklch(0.45_0.1_212)]"
          >
            {t('careers.successAgain')}
          </button>
          <Link href="/" className="text-sm font-semibold text-[oklch(0.42_0.03_220)] hover:text-[oklch(0.27_0.055_220)] transition-colors">
            {t('careers.successHome')}
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
        <div>
          <label className={labelCls} htmlFor="ap-first">{t('careers.formFirst')} *</label>
          <input id="ap-first" className={fieldCls} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Sofia" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-last">{t('careers.formLast')} *</label>
          <input id="ap-last" className={fieldCls} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Marchetti" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-email">{t('careers.formEmail')} *</label>
          <input id="ap-email" type="email" className={fieldCls} value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-phone">{t('careers.formPhone')}</label>
          <input id="ap-phone" type="tel" className={fieldCls} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+20 100 000 0000" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-nat">{t('careers.formNationality')}</label>
          <input id="ap-nat" className={fieldCls} value={form.nationality} onChange={e => update('nationality', e.target.value)} placeholder="Italian" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-role">{t('careers.formRole')} *</label>
          <select id="ap-role" className={cn(fieldCls, 'appearance-none')} value={form.role} onChange={e => update('role', e.target.value as ApplicantRole)}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-langs">{t('careers.formLanguages')}</label>
          <input id="ap-langs" className={fieldCls} value={form.languages} onChange={e => update('languages', e.target.value)} placeholder="English, Italian, Spanish" />
        </div>
        <div>
          <label className={labelCls} htmlFor="ap-exp">{t('careers.formExperience')}</label>
          <input id="ap-exp" type="number" min={0} max={40} className={fieldCls} value={form.yearsExperience} onChange={e => update('yearsExperience', e.target.value)} placeholder="3" />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelCls} htmlFor="ap-spec">{t('careers.formSpecialties')}</label>
        <input id="ap-spec" className={fieldCls} value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Aqua Gym, Beach Volleyball, Dance" />
      </div>

      <div className="mt-4">
        <label className={labelCls} htmlFor="ap-pitch">{t('careers.formPitch')}</label>
        <textarea
          id="ap-pitch"
          rows={4}
          className={cn(fieldCls, 'resize-none')}
          value={form.pitch}
          onChange={e => update('pitch', e.target.value)}
          placeholder={t('careers.formPitchPlaceholder')}
        />
      </div>

      {/* Optional CV / intro media upload */}
      <div className="mt-4">
        <label className={labelCls}>{t('careers.formCv')}</label>
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.5_0.1_212_/_0.25)] bg-[oklch(0.5_0.1_212_/_0.06)] px-4 py-3">
            <Upload className="h-4 w-4 text-[oklch(0.45_0.09_210)] shrink-0" />
            <span className="flex-1 truncate text-sm font-medium text-[oklch(0.3_0.05_220)]">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="grid h-6 w-6 place-items-center rounded-full text-[oklch(0.5_0.03_220)] hover:bg-[oklch(0.4_0.04_215_/_0.1)]" aria-label="Remove file">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[oklch(0.4_0.04_215_/_0.3)] bg-white/40 px-4 py-3 text-sm text-[oklch(0.5_0.03_220)] transition-colors hover:border-[oklch(0.5_0.1_212_/_0.5)] hover:text-[oklch(0.45_0.09_210)]">
            <Upload className="h-4 w-4 shrink-0" />
            <span>{t('careers.formCvAttach')}</span>
            <input
              type="file"
              accept=".pdf,image/*,video/*"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-4 text-sm font-medium text-[oklch(0.55_0.2_25)]">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_oklch(0.5_0.1_212_/_0.7)] transition-all hover:bg-[oklch(0.45_0.1_212)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? t('careers.formSubmitting') : t('careers.formSubmit')}
        {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
      <p className="mt-3 text-center text-mini text-[oklch(0.55_0.03_220)]">
        {t('careers.formDemoNote')}
      </p>
    </form>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<ApplicantRole>('ANIMATOR')

  function chooseRole(role: ApplicantRole) {
    setSelectedRole(role)
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
              <ArrowLeft className="h-4 w-4" /> Animipro
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

          {/* Sun behind the hero copy */}
          <div aria-hidden className="hero-sun pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full" />

          <div className="relative mt-12 sm:mt-16 max-w-2xl">
            <motion.div
              {...rise(0.05)}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 ring-1 ring-[oklch(0.52_0.1_210_/_0.18)] backdrop-blur-sm"
            >
              <Sun className="h-3.5 w-3.5 text-[oklch(0.7_0.16_60)]" />
              <span className="text-13 font-semibold text-[oklch(0.34_0.05_215)]">{t('careers.nowHiring')}</span>
            </motion.div>

            <motion.h1
              {...rise(0.12)}
              className="mt-6 font-display font-extrabold leading-[0.95] tracking-[-0.03em] text-[oklch(0.27_0.055_220)] text-balance"
              style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.75rem)' }}
            >
              {t('careers.titleLead')}
              <br className="hidden sm:block" />{' '}
              <span className="text-[oklch(0.58_0.19_36)]">{t('careers.titleAccent')}</span>
            </motion.h1>

            <motion.p {...rise(0.2)} className="mt-6 text-lg leading-relaxed text-[oklch(0.42_0.03_220)] max-w-[52ch]">
              {t('careers.intro')}
            </motion.p>

            <motion.div {...rise(0.28)} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#apply"
                className="group inline-flex items-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_oklch(0.5_0.1_212_/_0.7)] transition-all hover:bg-[oklch(0.45_0.1_212)] active:translate-y-px"
              >
                {t('careers.applyNow')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#roles" className="rounded-2xl px-6 py-4 text-base font-semibold text-[oklch(0.36_0.05_215)] ring-1 ring-[oklch(0.4_0.04_215_/_0.2)] transition-colors hover:bg-white/60">
                {t('careers.seeRoles')}
              </a>
            </motion.div>

            {/* Perks */}
            <motion.div {...rise(0.36)} className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {PERKS.map(p => (
                <span key={p.labelKey} className="inline-flex items-center gap-2 text-sm text-[oklch(0.42_0.03_220)]">
                  <p.icon className="h-4 w-4 text-[oklch(0.5_0.1_212)]" />
                  {t(p.labelKey)}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Open roles ───────────────────────────────────────────────────────── */}
      <section id="roles" className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[oklch(0.5_0.1_212)]">{t('careers.rolesKicker')}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[oklch(0.27_0.055_220)] text-balance">
            {t('careers.rolesTitle')}
          </h2>
          <p className="mt-4 text-[oklch(0.42_0.03_220)] leading-relaxed">
            {t('careers.rolesIntro')}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {OPEN_ROLES.map(r => (
            <button
              key={r.role}
              onClick={() => chooseRole(r.role)}
              className="group flex items-start gap-4 rounded-2xl bg-white/70 p-6 text-left ring-1 ring-[oklch(0.4_0.04_215_/_0.12)] transition-all hover:-translate-y-0.5 hover:ring-[oklch(0.5_0.1_212_/_0.3)] hover:shadow-[0_20px_40px_-24px_oklch(0.3_0.05_220_/_0.4)]"
            >
              <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/30', r.gradient)}>
                <r.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-[oklch(0.27_0.055_220)]">{t(r.titleKey)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[oklch(0.45_0.03_220)]">{t(r.blurbKey)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[oklch(0.5_0.1_212)]">
                  {t('careers.applyForRole')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Apply ────────────────────────────────────────────────────────────── */}
      <section id="apply" className="mx-auto max-w-3xl px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-8">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[oklch(0.5_0.1_212)]">
            <Sparkles className="h-3.5 w-3.5" /> {t('careers.applicationKicker')}
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[oklch(0.27_0.055_220)]">
            {t('careers.applicationTitle')}
          </h2>
          <p className="mt-3 text-[oklch(0.42_0.03_220)]">{t('careers.applicationIntro')}</p>
        </div>

        <ApplyForm key={selectedRole} initialRole={selectedRole} />

        <p className="mt-8 flex items-center justify-center gap-1.5 text-sm text-[oklch(0.5_0.03_220)]">
          <Globe className="h-4 w-4 text-[oklch(0.5_0.1_212)]" />
          {t('careers.hiringAcross')}
        </p>
      </section>

      <PWAInstallPrompt />
    </div>
  )
}
