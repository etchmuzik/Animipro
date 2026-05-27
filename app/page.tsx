'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  ArrowRight, Check, Menu, X, Star, Users, Calendar,
  BarChart3, Bell, Shield, ChevronRight, Building2,
  TrendingUp, Globe, Zap, CheckCircle2, Phone, Mail,
  LayoutDashboard, ClipboardList, Megaphone, PartyPopper,
  Activity, UserCheck, BarChart2, CalendarCheck,
  MapPin, Waves, Fish, Palmtree, Anchor, Sunset,
  Landmark, Sailboat, CreditCard, Smartphone, Banknote,
  Play, Camera, BellRing, Timer, ShieldCheck, Video, Sparkles,
  Cloud, Server, HardDrive, MessageSquarePlus, ListChecks, UserPlus,
} from 'lucide-react'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { HomepageDemo } from '@/components/homepage-demo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslation } from '@/lib/i18n'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'nav.forAnimators', href: '#workflow' },
  { key: 'nav.features',     href: '#features' },
  { key: 'nav.pricing',      href: '#pricing' },
  { key: 'nav.partners',     href: '/partners' },
  { key: 'nav.careers',      href: '/careers' },
  { key: 'nav.contact',      href: '#contact' },
]

const STATS = [
  { value: '147',     label: 'Hotels across Egypt' },
  { value: '4,187',   label: 'Animators managed' },
  { value: '+0.38★',  label: 'Avg TripAdvisor lift' },
  { value: '48h',     label: 'Setup to first activity' },
]

const CITIES = [
  { name: 'Sharm El Sheikh', hotels: 61,  icon: Waves,    desc: 'Naama Bay, Sharks Bay, Ras Mohammed' },
  { name: 'Hurghada',        hotels: 103, icon: Anchor,   desc: 'Sahl Hasheesh, Makadi Bay, El Gouna' },
  { name: 'Marsa Alam',      hotels: 34,  icon: Fish,     desc: 'Port Ghalib, Reef diving capital' },
  { name: 'Ain Sokhna',      hotels: 42,  icon: Sunset,   desc: 'Closest resort to Cairo, Red Sea' },
  { name: 'Dahab',           hotels: 31,  icon: Sailboat, desc: 'Blue Hole, Bedouin culture, diving' },
  { name: 'Taba',            hotels: 9,   icon: MapPin,   desc: 'Gulf of Aqaba, Sinai border resorts' },
  { name: 'Alexandria',      hotels: 18,  icon: Landmark, desc: 'Mediterranean coast, historic city' },
  { name: 'Safaga',          hotels: 12,  icon: Palmtree, desc: 'Red Sea diving and windsurfing' },
]

// 12 features arranged so the asymmetric zig-zag layout below puts the two
// highest-value, buyer-resonant claims (positions 0 and 3) in the wide hero
// slots: live guest feedback (the TripAdvisor lift mechanism) and the full
// hiring loop (the workflow that justifies the 25K floor).
const FEATURES = [
  {
    icon: MessageSquarePlus,
    title: 'Guest ratings that move TripAdvisor',
    desc: 'Capture a guest rating + comment on every activity, see the live average on the dashboard, and link team performance directly to the review score that fills your beds next season.',
  },
  {
    icon: Play,
    title: 'One-Tap Activity Start',
    desc: 'Animators tap Start when they begin — every shift gets a real timestamp. No paper sign-in, no excuses.',
  },
  {
    icon: Camera,
    title: 'Photo & Video Proof',
    desc: 'Each activity card carries photo or short-video proof. Management sees what actually happened.',
  },
  {
    icon: UserPlus,
    title: 'End-to-end hiring, in the platform',
    desc: 'Public careers page collects applications with CVs. Hotel admins review, shortlist, accept, then walk new hires through an onboarding checklist — contract, uniform, training, system access, added to the team. The whole hiring loop in one tool.',
  },
  {
    icon: BellRing,
    title: 'Smart Pre-Shift Reminders',
    desc: '15-minute and 5-minute browser notifications before every activity. Installed PWA — no missed shifts.',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Weekly Scheduling',
    desc: 'Build weekly schedules per team and property. Publish to animators instantly with one click.',
  },
  {
    icon: Bell,
    title: 'Live Notifications Inbox',
    desc: 'A single dropdown in the topbar aggregates new applications, leave requests, and announcements. One click jumps to the section that needs your attention.',
  },
  {
    icon: ListChecks,
    title: 'Onboarding Checklists',
    desc: 'Accepted candidates get a real onboarding checklist tied to their application. Track contract, uniform, training, and access in one place — bridges hiring straight into the team roster.',
  },
  {
    icon: Building2,
    title: 'Multi-Hotel Dashboard',
    desc: 'One company, many hotels. Cross-hotel analytics, schedule + team + score in one unified view.',
  },
  {
    icon: Star,
    title: 'TripAdvisor + Google + Booking Live',
    desc: 'Track all three review platforms on the dashboard. Spot rating drops before they hurt your bookings.',
  },
  {
    icon: Globe,
    title: '4 Languages + RTL Arabic',
    desc: 'Full interface in English, Arabic, Russian and Italian. Right-to-left flips the whole shell for Arabic guests and staff.',
  },
  {
    icon: Zap,
    title: 'Live White-Label + Reseller Programme',
    desc: 'Change app name, brand colour, and contact details from the Settings screen and watch the whole platform reskin instantly. Run it as your own agency product — see our partner tiers.',
  },
]

const PRICING_TIERS = [
  {
    id: 'single',
    name: 'Single Hotel',
    price: '25,000',
    currency: 'EGP',
    usd: '~$500',
    desc: 'One property, one animation team. Own it forever.',
    highlight: false,
    features: [
      'One hotel property',
      'Up to 50 animators',
      'All 4 languages (EN / AR / RU / IT)',
      'Smart schedule builder',
      'Attendance, leave & announcements',
      'TripAdvisor live dashboard',
      'Guest feedback & ratings',
      '12 months support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'group',
    name: 'Hotel Group',
    price: '75,000',
    currency: 'EGP',
    usd: '~$1,500',
    desc: 'Multiple hotels, one platform.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 10 hotel properties',
      'Unlimited animators',
      'Everything in Single Hotel',
      'Cross-hotel analytics',
      'Company-level reports',
      'Role-based access control',
      'Custom branding pack included',
      '18 months priority support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '150,000',
    currency: 'EGP',
    usd: '~$3,000',
    desc: 'For the largest resort chains.',
    highlight: false,
    features: [
      'Unlimited hotels & animators',
      'Everything in Hotel Group',
      'Dedicated onboarding manager',
      '2-day on-site setup & training',
      'Phone & WhatsApp SLA (4h response)',
      'Custom integrations available',
      'Annual on-call SLA included',
      '24 months support',
    ],
    cta: 'Buy Now',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Before AnimaPro we managed 40 animators on WhatsApp groups. Now everything is in one place — schedules, attendance, scores. Our TripAdvisor rating went from 4.2 to 4.7 in one season.',
    name: 'Mohamed El-Sayed',
    title: 'Animation Director',
    hotel: 'Rixos Premium Seagate, Sharm El Sheikh',
    initials: 'ME',
  },
  {
    quote: 'We manage 3 hotels and 90 animators. AnimaPro gives us the full picture across all properties in real time. The white-label option is exactly what we needed for our group.',
    name: 'Katarzyna Wojcik',
    title: 'HR & Operations Manager',
    hotel: 'Pickalbatros Palace Resort, Hurghada',
    initials: 'KW',
  },
  {
    quote: 'The one-off payment was the deciding factor. No monthly fees, no surprises. We set it up in a week and it paid for itself in the first month.',
    name: 'Tarek Nasser',
    title: 'General Manager',
    hotel: 'Steigenberger Pure Lifestyle, Hurghada',
    initials: 'TN',
  },
]

const TODAY_LABEL = new Date().toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
})

// ─── CHECKOUT MODAL ────────────────────────────────────────────────────────────

function CheckoutModal({
  tier,
  onClose,
}: {
  tier: (typeof PRICING_TIERS)[0] | null
  onClose: () => void
}) {
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form')
  const [form, setForm] = useState({ name: '', hotel: '', email: '', phone: '' })
  const [hosted, setHosted] = useState<'self' | 'starter' | 'pro'>('self')
  const canContinue = form.name.trim().length > 0 && form.email.includes('@')

  if (!tier) return null

  const hostedOptions: { key: 'self' | 'starter' | 'pro'; label: string; sub: string; price: string }[] = [
    { key: 'self',    label: 'Self-hosted',    sub: 'Run it yourself, no recurring fee', price: 'Free' },
    { key: 'starter', label: 'Hosted Starter', sub: 'Sync + backups, 10 GB media',       price: '+750 EGP/mo' },
    { key: 'pro',     label: 'Hosted Pro',     sub: 'Push, 50 GB, 99.5% SLA',            price: '+1,500 EGP/mo' },
  ]
  const hostedLabel = hostedOptions.find(h => h.key === hosted)!.label
  const hostedPrice = hostedOptions.find(h => h.key === hosted)!.price

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">

        {/* Header */}
        <div className="bg-brand-navy px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Order Summary</p>
            <p className="text-white font-black text-xl leading-tight">{tier.name}</p>
            <p className="text-white/40 text-xs mt-1">Licence — yours forever</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-2xl tabular-nums">{tier.price}</p>
            <p className="text-white/50 text-sm font-semibold">{tier.currency} <span className="text-white/30">({tier.usd})</span></p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-border">
          {[
            { key: 'form',    label: '1. Your Details' },
            { key: 'payment', label: '2. Payment' },
            { key: 'done',    label: '3. Confirm' },
          ].map(s => (
            <div
              key={s.key}
              className={cn(
                'flex-1 text-center py-2.5 text-mini font-bold border-b-2 transition-colors',
                step === s.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400'
              )}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-4">
              {[
                { key: 'name',  label: 'Full Name',             placeholder: 'Ahmed Mohamed',      type: 'text'  },
                { key: 'hotel', label: 'Hotel / Company Name',  placeholder: 'Grand Seas Resort',  type: 'text'  },
                { key: 'email', label: 'Email Address',         placeholder: 'ahmed@resort.com',   type: 'email' },
                { key: 'phone', label: 'WhatsApp Number',       placeholder: '+20 100 000 0000',   type: 'tel'   },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-slate-300"
                  />
                </div>
              ))}

              {/* Hosted Edition — optional, defaults to self-hosted (free). */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-600">Hosted Edition (optional)</p>
                  <p className="text-micro text-slate-400">Skip if you'll self-host</p>
                </div>
                <div className="space-y-1.5">
                  {hostedOptions.map(o => {
                    const isActive = hosted === o.key
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setHosted(o.key)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
                          isActive
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/40 hover:bg-[#f0fdff]',
                        )}
                      >
                        <span className={cn(
                          'grid h-5 w-5 place-items-center rounded-full border shrink-0',
                          isActive ? 'border-primary bg-primary' : 'border-[#cbd5e1]',
                        )}>
                          {isActive && <span className="block h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-navy leading-tight">{o.label}</p>
                          <p className="text-mini text-muted-foreground mt-0.5">{o.sub}</p>
                        </div>
                        <span className={cn('text-xs font-bold shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}>
                          {o.price}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={!canContinue}
                className="w-full bg-brand-navy text-white font-black py-3.5 rounded-xl mt-1 hover:bg-brand-navy-elev1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Continue to Payment
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-brand-navy mb-4">Choose your payment method</p>
              {[
                { label: 'InstaPay / Bank Transfer', sub: 'Instant EGP bank transfer — license delivered in 2 hours', icon: Banknote },
                { label: 'Vodafone Cash',             sub: 'Mobile wallet — license delivered instantly',              icon: Smartphone },
                { label: 'Credit / Debit Card',       sub: 'Visa or Mastercard — secure online payment',              icon: CreditCard },
              ].map(m => (
                <button
                  key={m.label}
                  onClick={() => setStep('done')}
                  className="w-full flex items-center gap-4 border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-[#f0fdff] text-left transition-all group active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <m.icon className="w-5 h-5 text-brand-navy group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-navy">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{m.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-primary transition-colors" />
                </button>
              ))}
              <button
                onClick={() => setStep('form')}
                className="text-xs text-slate-400 hover:text-brand-navy w-full text-center pt-2 transition-colors"
              >
                Back to details
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xl font-black text-brand-navy mb-2">Order Received</p>
              <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
                Thank you, <strong className="text-brand-navy">{form.name || 'there'}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                We will contact you at <strong className="text-brand-navy">{form.phone || form.email}</strong> within 2 hours to confirm payment and deliver your license key.
              </p>
              <div className="bg-[#f8fafc] border border-border rounded-xl p-4 mb-6 text-left space-y-1.5">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Order Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Licence</span>
                  <span className="font-bold text-brand-navy">{tier.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">One-off</span>
                  <span className="font-bold text-brand-navy tabular-nums">{tier.price} {tier.currency}</span>
                </div>
                <div className="flex justify-between text-sm pt-1.5 border-t border-border/60">
                  <span className="text-muted-foreground">Hosting</span>
                  <span className="font-bold text-brand-navy">{hostedLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recurring</span>
                  <span className={cn('font-bold tabular-nums', hosted === 'self' ? 'text-muted-foreground' : 'text-primary')}>{hostedPrice}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-brand-navy text-white font-black px-10 py-3 rounded-xl hover:bg-brand-navy-elev1 transition-colors text-sm w-full active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar({ onBuy }: { onBuy: () => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Adaptive header: transparent with dark ink over the sunlit hero, then a
  // frosted sand bar once the user scrolls past the fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[oklch(0.965_0.013_84_/_0.8)] backdrop-blur-xl border-b border-[oklch(0.4_0.04_215_/_0.1)] shadow-[0_1px_20px_-12px_oklch(0.3_0.05_220_/_0.5)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[oklch(0.5_0.1_212)] flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight text-[oklch(0.27_0.055_220)]">AnimaPro</span>
          <span className="hidden sm:inline-block text-micro font-bold text-[oklch(0.45_0.09_210)] bg-[oklch(0.5_0.1_212_/_0.1)] border border-[oklch(0.5_0.1_212_/_0.25)] px-2 py-0.5 rounded-full">for Egypt</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.key}
              href={l.href}
              className="text-[oklch(0.42_0.03_220)] hover:text-[oklch(0.27_0.055_220)] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[oklch(0.4_0.04_215_/_0.07)] transition-all"
            >
              {t(l.key)}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher variant="light" />
          <Link
            href="/platform"
            className="text-[oklch(0.42_0.03_220)] hover:text-[oklch(0.27_0.055_220)] text-sm font-semibold transition-colors px-2"
          >
            {t('common.liveDemo')}
          </Link>
          <button
            onClick={onBuy}
            className="bg-[oklch(0.5_0.1_212)] hover:bg-[oklch(0.45_0.1_212)] text-white text-sm font-bold px-5 py-2 rounded-xl transition-all active:scale-[0.98] shadow-[0_8px_20px_-10px_oklch(0.5_0.1_212_/_0.8)]"
          >
            {t('common.buyNow')}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageSwitcher variant="light" />
          <button
            className="text-[oklch(0.36_0.04_218)] hover:text-[oklch(0.27_0.055_220)] p-1.5 rounded-lg hover:bg-[oklch(0.4_0.04_215_/_0.07)] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[oklch(0.965_0.013_84_/_0.95)] backdrop-blur-xl border-t border-[oklch(0.4_0.04_215_/_0.1)] px-5 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-[oklch(0.42_0.03_220)] hover:text-[oklch(0.27_0.055_220)] text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-[oklch(0.4_0.04_215_/_0.07)] transition-all"
            >
              {t(l.key)}
            </a>
          ))}
          <div className="pt-3 border-t border-[oklch(0.4_0.04_215_/_0.1)] flex flex-col gap-2 mt-2">
            <Link href="/platform" onClick={() => setOpen(false)} className="text-center text-[oklch(0.42_0.03_220)] text-sm font-semibold py-2.5 hover:text-[oklch(0.27_0.055_220)] transition-colors">
              {t('common.liveDemo')}
            </Link>
            <button
              onClick={() => { onBuy(); setOpen(false) }}
              className="bg-[oklch(0.5_0.1_212)] hover:bg-[oklch(0.45_0.1_212)] text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-[0_8px_20px_-10px_oklch(0.5_0.1_212_/_0.8)]"
            >
              {t('common.buyNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

// Exponential ease-out — the brand-law curve. No spring bounce on the hero.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

function Hero({ onBuy }: { onBuy: () => void }) {
  const { t } = useTranslation()
  // Each element animates itself with a direct initial→animate transition and an
  // explicit delay. We deliberately avoid parent `variants` orchestration here:
  // for above-the-fold content, self-contained `animate` is the reliable path
  // (variant inheritance through the tree was leaving content stuck hidden).
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
  })

  return (
    <section className="hero-canvas hero-grain relative overflow-hidden -mt-16">
      {/* Sea horizon line: a thin band of turquoise where water meets the sand. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, oklch(0.6 0.11 205 / 0.4), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-36 relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-x-12 gap-y-16 items-center">
          {/* ── Left: the message ───────────────────────────────────────────── */}
          <div className="max-w-2xl">
            {/* Live status — a real signal, not a tracked-caps label */}
            <motion.div
              {...rise(0.05)}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/70 ring-1 ring-[oklch(0.52_0.1_210_/_0.18)] backdrop-blur-sm pl-2.5 pr-4 py-1.5 mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.55_0.18_35)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.6_0.19_35)]" />
              </span>
              <span className="text-13 font-semibold text-[oklch(0.34_0.05_215)]">
                {t('hero.badge', { count: '147' })}
              </span>
            </motion.div>

            {/* Headline — the hero. Display face, one phrase carries the coral. */}
            <motion.h1
              {...rise(0.12)}
              className="font-display font-extrabold tracking-[-0.03em] leading-[0.95] text-[oklch(0.27_0.055_220)] text-balance"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)' }}
            >
              {t('hero.titleLead')}
              <br className="hidden sm:block" />{' '}
              <span className="text-[oklch(0.58_0.19_36)]">{t('hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              {...rise(0.2)}
              className="mt-7 text-[oklch(0.42_0.03_220)] text-lg sm:text-xl leading-relaxed font-medium max-w-[54ch]"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...rise(0.28)}
              className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <button
                onClick={onBuy}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_oklch(0.5_0.1_212_/_0.7)] transition-all hover:bg-[oklch(0.45_0.1_212)] hover:shadow-[0_18px_36px_-12px_oklch(0.5_0.1_212_/_0.8)] active:translate-y-px"
              >
                {t('hero.ctaPrimary', { price: '25,000 EGP' })}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/platform"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-[oklch(0.36_0.05_215)] ring-1 ring-[oklch(0.4_0.04_215_/_0.2)] transition-colors hover:bg-white/60 hover:ring-[oklch(0.4_0.04_215_/_0.35)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {t('hero.ctaSecondary')}
              </Link>
            </motion.div>

            {/* Proof line — numbers + cities woven into one confident sentence */}
            <motion.div {...rise(0.36)} className="mt-12">
              <div className="flex items-center gap-5">
                <div className="flex -space-x-2.5">
                  {[
                    'oklch(0.7 0.15 50)', 'oklch(0.62 0.13 210)',
                    'oklch(0.68 0.16 145)', 'oklch(0.66 0.17 30)',
                  ].map((c, i) => (
                    <span
                      key={i}
                      className="grid h-8 w-8 place-items-center rounded-full text-mini font-bold text-white ring-2 ring-[oklch(0.965_0.013_84)]"
                      style={{ background: c }}
                    >
                      {['SS', 'HU', 'EG', 'MA'][i]}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-snug text-[oklch(0.46_0.03_220)]">
                  {t('hero.proof', { count: '4,187' })}
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: the product, as a real object in the light ───────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.3 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* The sun, low and warm, behind the device */}
            <div
              aria-hidden
              className="hero-sun pointer-events-none absolute -right-10 -top-14 h-72 w-72 rounded-full sm:h-80 sm:w-80"
            />

            {/* Floating proof satellite — a captured photo */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 1 }}
              className="hero-float-a absolute -left-3 top-10 z-20 hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-[0_18px_40px_-16px_oklch(0.3_0.05_220_/_0.45)] ring-1 ring-black/5 backdrop-blur"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.14_60)] to-[oklch(0.6_0.18_30)] text-lg">
                🏊
              </div>
              <div className="leading-tight">
                <p className="text-mini font-bold text-[oklch(0.3_0.05_220)]">Proof captured</p>
                <p className="text-micro text-[oklch(0.55_0.02_220)]">Aqua Gym · 2 photos</p>
              </div>
            </motion.div>

            {/* Floating proof satellite — a fired reminder */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 1.25 }}
              className="hero-float-b absolute -right-2 bottom-12 z-20 hidden sm:flex items-center gap-2 rounded-2xl bg-[oklch(0.5_0.1_212)] px-3 py-2 shadow-[0_18px_40px_-16px_oklch(0.5_0.1_212_/_0.6)] ring-1 ring-white/15"
            >
              <BellRing className="h-4 w-4 text-white" />
              <div className="leading-tight">
                <p className="text-mini font-bold text-white">Starts in 5 min</p>
                <p className="text-micro text-white/70">Kids Disco · Main Stage</p>
              </div>
            </motion.div>

            {/* The interactive demo — real working proof, not a fake screenshot.
                A subtle 3D tilt on large screens that straightens on hover to
                invite touch; flat on mobile where the card is full-width. */}
            <div className="relative z-10 transition-transform duration-500 ease-out lg:[transform:perspective(1400px)_rotateY(-7deg)_rotateX(3deg)] lg:hover:[transform:perspective(1400px)_rotateY(0deg)_rotateX(0deg)]">
              <HomepageDemo />
            </div>

            <p className="relative z-10 mt-5 text-center text-13 font-medium text-[oklch(0.5_0.03_220)]">
              <Sparkles className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-[oklch(0.7_0.16_60)]" />
              {t('hero.demoLive', { action: t('hero.demoStart') })}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── STATS BAR ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  return (
    <section className="bg-gradient-to-br from-[#0a0a1a] via-[#0f172a] to-[#0a1628] border-b border-white/10 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-black text-white mb-2 tabular-nums">{s.value}</p>
                <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-tight">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── ANIMATOR WORKFLOW (NEW) ──────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  {
    icon: BellRing,
    badge: '15 + 5 min before',
    title: 'Smart reminders, never miss a shift',
    desc: 'Push notifications fire 15 and 5 minutes before every activity. Plus a live banner inside the app counts down to the next session.',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    icon: Play,
    badge: 'One tap',
    title: 'Start the activity, capture the timestamp',
    desc: 'When the animator arrives, they tap Start. The card switches to In Progress, a live timer ticks, and the time is logged forever.',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
  },
  {
    icon: Camera,
    badge: 'Photo or video',
    title: 'Proof of every session',
    desc: 'A real photo or short video gets attached to each activity. Hotel management opens any card and sees what guests actually experienced.',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
]

function AnimatorWorkflowSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 90, damping: 18 },
    },
  }

  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-gradient-to-br from-[#0a0a1a] via-[#0d1d3a] to-[#0a1f2e] py-20 sm:py-28 lg:py-36 border-b border-white/10"
    >
      {/* Vibrant background orbs */}
      <div className="absolute -top-32 left-1/4 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-fuchsia-500/15 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 rounded-full blur-3xl opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,10,30,0.4))]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-1.5 bg-cyan-500/15 text-cyan-300 text-mini font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-cyan-400/20 mb-5">
            <Sparkles className="w-3 h-3" /> New for animators
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] max-w-4xl mx-auto text-balance">
            Built for the animator&apos;s pocket.
          </h2>
          <p className="mt-6 text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Three changes that turn every activity into accountable, measurable work — without adding paperwork.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: workflow steps */}
          <motion.ol
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                variants={itemVariants}
                className="group relative bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-1 ring-white/20',
                    step.gradient,
                  )}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-micro font-black uppercase tracking-widest text-white/40">
                        Step {i + 1}
                      </span>
                      <span className="text-micro font-bold uppercase tracking-wide text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-1.5">{step.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ol>

          {/* Right: live interactive mini-demo */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-center text-mini font-bold uppercase tracking-widest text-cyan-300/80 mb-3">
              ↓ Live — tap it yourself
            </p>
            <HomepageDemo />
            <p className="mt-4 text-center text-xs text-zinc-500">
              This is a working demo. Your animators see the same buttons inside the app.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── FEATURES ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  return (
    <section id="features" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-primary text-xs font-black uppercase tracking-[0.15em] mb-4">Features</p>
          <h2 className="text-5xl sm:text-6xl font-black text-brand-navy leading-tight tracking-tighter text-balance">
            Everything your team needs.
          </h2>
          <p className="text-muted-foreground text-lg mt-6 max-w-[55ch] leading-relaxed">
            Built specifically for Egyptian resort hotels. Not a generic tool — a platform that understands your industry.
          </p>
        </div>

        {/* Asymmetric 2-col zig-zag layout */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Row 1: Left wide */}
          <div className="grid lg:grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white border border-border rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[0].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              </div>
              <h3 className="font-black text-brand-navy text-xl mb-2">{FEATURES[0].title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed max-w-[55ch]">{FEATURES[0].desc}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-border rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[1].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              </div>
              <h3 className="font-black text-brand-navy text-lg mb-2">{FEATURES[1].title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{FEATURES[1].desc}</p>
            </motion.div>
          </div>

          {/* Row 2: Right wide */}
          <div className="grid lg:grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="bg-white border border-border rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[2].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              </div>
              <h3 className="font-black text-brand-navy text-lg mb-2">{FEATURES[2].title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{FEATURES[2].desc}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white border border-border rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[3].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              </div>
              <h3 className="font-black text-brand-navy text-xl mb-2">{FEATURES[3].title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed max-w-[55ch]">{FEATURES[3].desc}</p>
            </motion.div>
          </div>

          {/* Row 3: 3-col equal */}
          <div className="grid lg:grid-cols-3 gap-4">
            {FEATURES.slice(4).map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="bg-white border border-border rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-black text-brand-navy text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── TRIPADVISOR SECTION ───────────────────────────────────────────────────────

function TripAdvisorSection() {
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  const headingVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="bg-brand-navy py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-primary text-xs font-black uppercase tracking-[0.15em] mb-4"
            >
              Review Intelligence
            </motion.p>
            <motion.h2
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter text-balance mb-8"
            >
              Your ratings, live.
            </motion.h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-[55ch]">
              Every hotel shows its live TripAdvisor, Google, and Booking.com scores on the main dashboard. See trends, spot issues early, and link team performance directly to guest reviews.
            </p>
            <div className="space-y-3">
              {[
                'Live TripAdvisor rating with trend',
                'Google Maps score on dashboard',
                'Booking.com animation sub-score',
                'Travelers\' Choice badge display',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-white/70 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { platform: 'TripAdvisor', score: '4.7', sub: '#4 of 61 hotels in Sharm', color: '#00aa6c' },
              { platform: 'Google', score: '4.6', sub: 'Based on verified reviews', color: '#4285f4' },
              { platform: 'Booking.com', score: '9.1', sub: 'Exceptional rating', color: '#003580' },
            ].map(r => (
              <motion.div
                key={r.platform}
                variants={itemVariants}
                className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-5 flex items-center gap-5 backdrop-blur-sm"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-xl"
                  style={{ background: r.color + '22', border: `1px solid ${r.color}33` }}
                >
                  <span style={{ color: r.color }}>{r.platform.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">{r.platform}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tabular-nums">{r.score}</span>
                    <span className="text-white/40 text-sm">/ {r.platform === 'Booking.com' ? '10' : '5'}</span>
                  </div>
                  <p className="text-white/35 text-xs mt-1">{r.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── CITIES COVERAGE ──────────────────────────────────────────────────────────

function CitiesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  const headingVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          className="text-left max-w-2xl mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headingVariants}
        >
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xs font-black text-primary uppercase tracking-[0.15em] mb-4"
          >
            Where We Operate
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-brand-navy tracking-tighter text-balance mb-6"
          >
            Every major Egyptian resort destination.
          </motion.h2>
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-[60ch] font-medium leading-relaxed"
          >
            From the Red Sea Riviera to the Mediterranean coast — AnimaPro runs across all of Egypt's tourist zones.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {CITIES.map(city => (
            <motion.div
              key={city.name}
              variants={itemVariants}
              className="border border-border rounded-2xl p-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-primary/20 transition-all bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <city.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-black text-brand-navy text-sm mb-1">{city.name}</h3>
              <p className="text-micro text-primary font-bold mb-2">{city.hotels}+ hotels</p>
              <p className="text-mini text-muted-foreground leading-relaxed">{city.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  const headingVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="testimonials" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          className="text-left max-w-2xl mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headingVariants}
        >
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xs font-black text-primary uppercase tracking-[0.15em] mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-brand-navy tracking-tighter text-balance"
          >
            Hotels trust us.
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {TESTIMONIALS.map(t => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              className="bg-white border border-border rounded-2xl p-8 flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f97316] text-[#f97316]" />
                ))}
              </div>
              <p className="text-slate-700 text-base leading-relaxed flex-1 mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-border pt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-xs font-black text-white shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-brand-navy text-sm">{t.name}</p>
                  <p className="text-primary text-xs font-semibold">{t.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t.hotel}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function PricingSection({ onBuy }: { onBuy: (tier: (typeof PRICING_TIERS)[0]) => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  }

  const headingVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="pricing" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          className="text-left max-w-2xl mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headingVariants}
        >
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-primary text-xs font-black uppercase tracking-[0.15em] mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-brand-navy leading-tight tracking-tighter text-balance mb-6"
          >
            Own your licence forever.
          </motion.h2>
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg font-medium"
          >
            Buy once. Host it yourself, or let us run it for you.
          </motion.p>
        </motion.div>

        {/* Asymmetric pricing grid: 2fr 1fr emphasis */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[1fr_1.2fr_0.9fr] gap-6 max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {PRICING_TIERS.map(tier => (
            <motion.div
              key={tier.id}
              variants={itemVariants}
              className={cn(
                'relative rounded-2xl p-8 flex flex-col transition-all',
                tier.highlight
                  ? 'bg-brand-navy text-white ring-2 ring-primary shadow-[0_20px_40px_-15px_rgba(14,116,144,0.2)]'
                  : 'bg-white border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]'
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-mini font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              <div className="mb-8">
                <p className={cn('text-xs font-black uppercase tracking-widest mb-3', tier.highlight ? 'text-primary' : 'text-slate-400')}>
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={cn('text-5xl font-black tabular-nums', tier.highlight ? 'text-white' : 'text-brand-navy')}>
                    {tier.price}
                  </span>
                  <span className={cn('text-sm font-semibold', tier.highlight ? 'text-white/50' : 'text-slate-400')}>
                    {tier.currency}
                  </span>
                </div>
                <p className={cn('text-sm', tier.highlight ? 'text-white/60' : 'text-muted-foreground')}>
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-3.5 flex-1 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span className={tier.highlight ? 'text-white/80' : 'text-slate-700'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onBuy(tier)}
                className={cn(
                  'w-full py-4 rounded-xl font-black text-sm transition-all active:scale-[0.98]',
                  tier.highlight
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_20px_40px_-15px_rgba(14,116,144,0.3)]'
                    : 'bg-brand-navy text-white hover:bg-brand-navy-elev1'
                )}
              >
                {tier.cta} <span className="tabular-nums">— {tier.price} {tier.currency}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Hosted Edition strip ────────────────────────────────────────────
            The licence is forever. Hosting is an opt-in convenience: keep your
            data in sync across devices, get push notifications, and skip the
            DevOps. Per-hotel monthly fee. */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-primary mb-3">Optional — Hosted Edition</p>
            <h3 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight text-balance">
              Host it yourself, or let us run it for you.
            </h3>
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">
              Your licence above is yours forever. Want multi-device sync, daily backups, and push notifications without the DevOps? Pick a hosted plan, billed per hotel per month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: HardDrive,
                name: 'Self-hosted',
                price: 'Free',
                priceSub: 'with any licence',
                desc: 'Run it on your own server or static host. You own the data, you handle the backups.',
                features: ['Full offline / single-tenant', 'Localhost or your hosting', 'No recurring fee, ever'],
                tone: 'border-border',
                accent: 'text-muted-foreground',
              },
              {
                icon: Cloud,
                name: 'Hosted Starter',
                price: '750',
                priceSub: 'EGP / hotel / month',
                desc: 'We host it on our cloud. Multi-device sync and daily backups out of the box.',
                features: ['Multi-device sync', 'Daily backups', '10 GB media storage', 'Email support'],
                tone: 'border-primary/30 ring-1 ring-primary/20',
                accent: 'text-primary',
              },
              {
                icon: Server,
                name: 'Hosted Pro',
                price: '1,500',
                priceSub: 'EGP / hotel / month',
                desc: 'Everything in Starter, plus push notifications that survive a closed tab and a 99.5% uptime SLA.',
                features: ['Everything in Starter', 'Push notifications', '50 GB media storage', 'Priority support + 99.5% SLA'],
                tone: 'border-border',
                accent: 'text-primary',
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={cn(
                  'bg-white border rounded-2xl p-6 flex flex-col',
                  plan.tone,
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10', plan.accent)}>
                    <plan.icon className="w-4 h-4" />
                  </div>
                  <p className="font-black text-brand-navy text-base">{plan.name}</p>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-black text-brand-navy tabular-nums">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.priceSub}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{plan.desc}</p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            Annual hosted plans save 15%. Group of 10+ hotels? <Link href="/partners" className="text-primary font-bold hover:underline">Talk to us about partner pricing →</Link>
          </p>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-400 text-sm font-semibold mb-4">Egyptian payment methods accepted</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['InstaPay', 'Vodafone Cash', 'Bank Transfer', 'Visa / Mastercard'].map(m => (
              <span key={m} className="bg-[#f8fafc] border border-border text-muted-foreground text-xs font-bold px-4 py-2 rounded-xl">
                {m}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const [sent, setSent] = useState(false)

  const headingVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="contact" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={contentVariants}
          >
            <motion.p
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-primary text-xs font-black uppercase tracking-[0.15em] mb-4"
            >
              Contact
            </motion.p>
            <motion.h2
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-black text-brand-navy leading-tight tracking-tighter text-balance mb-8"
            >
              Have questions?
            </motion.h2>
            <p className="text-muted-foreground text-lg max-w-[55ch] leading-relaxed mb-10">
              We speak Arabic, English, Polish, Russian, and more. Our team responds within 2 hours during business hours.
            </p>
            <div className="space-y-5">
              {[
                { icon: Phone,     label: 'WhatsApp',  value: '+20 100 000 0000',          href: 'https://wa.me/20100000000' },
                { icon: Mail,      label: 'Email',     value: 'sales@animapro.io',          href: 'mailto:sales@animapro.io' },
                { icon: Building2, label: 'Offices',   value: 'Sharm El Sheikh & Hurghada', href: undefined },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-brand-navy text-sm font-bold hover:text-primary transition-colors py-1 -my-1 inline-block">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-brand-navy text-sm font-bold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-border rounded-2xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xl font-black text-brand-navy mb-2">Message sent!</p>
                <p className="text-muted-foreground text-sm leading-relaxed">We will get back to you within 2 hours during business hours.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <p className="font-black text-brand-navy text-lg mb-6">Send us a message</p>
                {[
                  { id: 'cf-name',  label: 'Your Name',        placeholder: 'Mohamed Ahmed',              type: 'text'  },
                  { id: 'cf-hotel', label: 'Hotel / Company',  placeholder: 'Grand Seas Resort, Hurghada', type: 'text'  },
                  { id: 'cf-email', label: 'Email Address',    placeholder: 'you@resort.com',              type: 'email' },
                ].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="text-xs font-bold text-slate-600 mb-1.5 block">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      required
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-slate-300"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="cf-msg" className="text-xs font-bold text-slate-600 mb-1.5 block">Message</label>
                  <textarea
                    id="cf-msg"
                    rows={4}
                    placeholder="Tell us about your hotel and team size..."
                    required
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none placeholder:text-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-navy hover:bg-brand-navy-elev1 text-white font-black py-3.5 rounded-xl transition-colors text-sm active:scale-[0.98]"
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ─────────────────────────────────────────────────────────────────

function FinalCTA({ onBuy }: { onBuy: () => void }) {
  return (
    <section className="bg-brand-navy py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 20 }}
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter text-balance mb-6">
            Ready to run your animation program?
          </h2>
          <p className="text-white/50 text-lg mb-10 font-medium max-w-[55ch] mx-auto leading-relaxed">
            Join 147 hotels across Egypt. From 25,000 EGP. Setup in 48 hours. Yours forever.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <button
              onClick={onBuy}
              className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_20px_40px_-15px_rgba(14,116,144,0.3)] text-base active:-translate-y-[1px]"
            >
              Buy Now — From <span className="tabular-nums">25,000 EGP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/platform" className="flex items-center justify-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors border border-white/[0.12] hover:border-white/30 rounded-xl px-6 py-4">
              See Live Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/30 text-xs font-semibold">
            {['Own it for life', 'Self-host or cloud', '48h setup', 'Reseller programme'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-white border-t border-border py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-brand-navy font-black text-base tracking-tight">AnimaPro</span>
              <p className="text-slate-400 text-xs mt-0.5">Resort Animation Management</p>
            </div>
          </div>
          {/* py-2 on each link gives a 44px+ tap target without changing visual size — important for mobile. */}
          <nav className="flex items-center gap-5 text-xs font-semibold">
            <Link href="/partners" className="text-primary hover:text-primary/90 transition-colors py-2 -my-2">
              {t('footer.partners')}
            </Link>
            <Link href="/careers" className="text-muted-foreground hover:text-brand-navy transition-colors py-2 -my-2">
              {t('footer.hiring')}
            </Link>
            <Link href="/platform" className="text-muted-foreground hover:text-brand-navy transition-colors py-2 -my-2">
              {t('common.liveDemo')}
            </Link>
          </nav>
          <p className="text-slate-400 text-xs text-center">
            {t('footer.builtFor')}
          </p>
          <p className="text-slate-400 text-xs shrink-0">
            &copy; {new Date().getFullYear()} AnimaPro. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [checkoutTier, setCheckoutTier] = useState<(typeof PRICING_TIERS)[0] | null>(null)

  const openCheckout = (tier?: (typeof PRICING_TIERS)[0]) =>
    setCheckoutTier(tier ?? PRICING_TIERS[1])

  return (
    <div className="min-h-screen">
      <Navbar onBuy={() => openCheckout()} />
      <main>
        <Hero onBuy={() => openCheckout()} />
        <StatsBar />
        <AnimatorWorkflowSection />
        <FeaturesSection />
        <TripAdvisorSection />
        <CitiesSection />
        <TestimonialsSection />
        <PricingSection onBuy={openCheckout} />
        <ContactSection />
        <FinalCTA onBuy={() => openCheckout()} />
      </main>
      <Footer />
      {checkoutTier && (
        <CheckoutModal tier={checkoutTier} onClose={() => setCheckoutTier(null)} />
      )}
      <PWAInstallPrompt />
    </div>
  )
}
