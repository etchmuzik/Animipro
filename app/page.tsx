'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact',      href: '#contact' },
]

const STATS = [
  { value: '147',     label: 'Hotels across Egypt' },
  { value: '4,187',   label: 'Animators managed' },
  { value: '+0.38★',  label: 'Avg TripAdvisor lift' },
  { value: '0 EGP',   label: 'Monthly fees forever' },
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

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Smart Scheduling',
    desc: 'Build weekly schedules for every team and property. Publish to animators instantly with one click.',
  },
  {
    icon: Building2,
    title: 'Multi-Hotel & Multi-Team',
    desc: 'One company, many hotels. Manage all teams from a single unified dashboard with cross-hotel analytics.',
  },
  {
    icon: Star,
    title: 'TripAdvisor Live Scores',
    desc: 'Track TripAdvisor, Google, and Booking.com ratings live — all in one screen. Spot drops before they hurt.',
  },
  {
    icon: BarChart2,
    title: 'Performance Reports',
    desc: 'Weekly KPIs: attendance, punctuality, guest satisfaction. Automated reports, zero manual work.',
  },
  {
    icon: Megaphone,
    title: 'Instant Announcements',
    desc: 'Push urgent notices by role. Approve or reject leave requests from anywhere in seconds.',
  },
  {
    icon: UserCheck,
    title: 'Role-Based Access',
    desc: '8 built-in roles from Super Admin to Animator. Everyone sees only what they need — nothing more.',
  },
  {
    icon: Globe,
    title: 'Arabic + English',
    desc: 'Full bilingual support. Interface, announcements, and reports available in both languages.',
  },
  {
    icon: Zap,
    title: 'White-Label Ready',
    desc: 'Remove all AnimaPro branding. Add your logo and colors. Ship it as your own product to your clients.',
  },
]

const PRICING_TIERS = [
  {
    id: 'single',
    name: 'Single Hotel',
    price: '5,000',
    currency: 'EGP',
    usd: '~$100',
    desc: 'One property, one animation team.',
    highlight: false,
    features: [
      'Up to 30 animators',
      '1 hotel property',
      'Smart schedule builder',
      'Attendance tracking',
      'TripAdvisor dashboard',
      'Leave management',
      'Team announcements',
      '6 months support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'group',
    name: 'Hotel Group',
    price: '12,000',
    currency: 'EGP',
    usd: '~$240',
    desc: 'Multiple hotels, one platform.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 5 hotels',
      'Unlimited animators',
      'Everything in Single Hotel',
      'Cross-hotel analytics',
      'Company-level reports',
      'Role-based access control',
      'Priority support',
      '12 months support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'whitelabel',
    name: 'White Label',
    price: '25,000',
    currency: 'EGP',
    usd: '~$500',
    desc: 'Your brand. Your product. Full source.',
    highlight: false,
    features: [
      'Unlimited hotels',
      'Unlimited animators',
      'Everything in Hotel Group',
      'Remove all AnimaPro branding',
      'Your logo & colors',
      'Arabic UI included',
      'Full source code delivery',
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
  const canContinue = form.name.trim().length > 0 && form.email.includes('@')

  if (!tier) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">

        {/* Header */}
        <div className="bg-[#121318] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Order Summary</p>
            <p className="text-white font-black text-xl leading-tight">{tier.name}</p>
            <p className="text-white/40 text-xs mt-1">One-off payment — yours forever</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-2xl font-mono">{tier.price}</p>
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
        <div className="flex border-b border-[#e2e8f0]">
          {[
            { key: 'form',    label: '1. Your Details' },
            { key: 'payment', label: '2. Payment' },
            { key: 'done',    label: '3. Confirm' },
          ].map(s => (
            <div
              key={s.key}
              className={cn(
                'flex-1 text-center py-2.5 text-[11px] font-bold border-b-2 transition-colors',
                step === s.key
                  ? 'border-[#0e7490] text-[#0e7490]'
                  : 'border-transparent text-[#94a3b8]'
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
                  <label className="text-xs font-bold text-[#475569] mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm text-[#121318] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-colors placeholder:text-[#c0ccda]"
                  />
                </div>
              ))}
              <button
                onClick={() => setStep('payment')}
                disabled={!canContinue}
                className="w-full bg-[#121318] text-white font-black py-3.5 rounded-xl mt-1 hover:bg-[#1a2540] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Continue to Payment
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#121318] mb-4">Choose your payment method</p>
              {[
                { label: 'InstaPay / Bank Transfer', sub: 'Instant EGP bank transfer — license delivered in 2 hours', icon: Banknote },
                { label: 'Vodafone Cash',             sub: 'Mobile wallet — license delivered instantly',              icon: Smartphone },
                { label: 'Credit / Debit Card',       sub: 'Visa or Mastercard — secure online payment',              icon: CreditCard },
              ].map(m => (
                <button
                  key={m.label}
                  onClick={() => setStep('done')}
                  className="w-full flex items-center gap-4 border border-[#e2e8f0] rounded-xl p-4 hover:border-[#0e7490]/50 hover:bg-[#f0fdff] text-left transition-all group active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#121318]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0e7490]/10 transition-colors">
                    <m.icon className="w-5 h-5 text-[#121318] group-hover:text-[#0e7490] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#121318]">{m.label}</p>
                    <p className="text-xs text-[#64748b] mt-0.5 leading-tight">{m.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94a3b8] shrink-0 group-hover:text-[#0e7490] transition-colors" />
                </button>
              ))}
              <button
                onClick={() => setStep('form')}
                className="text-xs text-[#94a3b8] hover:text-[#121318] w-full text-center pt-2 transition-colors"
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
              <p className="text-xl font-black text-[#121318] mb-2">Order Received</p>
              <p className="text-sm text-[#64748b] mb-1 leading-relaxed">
                Thank you, <strong className="text-[#121318]">{form.name || 'there'}</strong>.
              </p>
              <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
                We will contact you at <strong className="text-[#121318]">{form.phone || form.email}</strong> within 2 hours to confirm payment and deliver your license key.
              </p>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-6 text-left space-y-1.5">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-2">Order Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">Plan</span>
                  <span className="font-bold text-[#121318]">{tier.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">Amount</span>
                  <span className="font-bold text-[#121318] font-mono">{tier.price} {tier.currency}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-[#121318] text-white font-black px-10 py-3 rounded-xl hover:bg-[#1a2540] transition-colors text-sm w-full active:scale-[0.98]"
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
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#0e7490] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">AnimaPro</span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-[#0e7490] bg-[#0e7490]/15 border border-[#0e7490]/30 px-2 py-0.5 rounded-full">for Egypt</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/platform"
            className="text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            Live Demo
          </Link>
          <button
            onClick={onBuy}
            className="bg-[#0e7490] hover:bg-[#0c6a84] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors active:scale-[0.98] shadow-[0_0_30px_rgba(14,116,144,0.3)]"
          >
            Buy Now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/40 backdrop-blur-md border-t border-white/10 px-5 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2 mt-2">
            <Link href="/platform" onClick={() => setOpen(false)} className="text-center text-white/70 text-sm font-semibold py-2.5 hover:text-white transition-colors">
              Live Demo
            </Link>
            <button
              onClick={() => { onBuy(); setOpen(false) }}
              className="bg-[#0e7490] hover:bg-[#0c6a84] text-white text-sm font-bold py-3 rounded-xl transition-colors active:scale-[0.98] shadow-[0_0_30px_rgba(14,116,144,0.3)]"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

function Hero({ onBuy }: { onBuy: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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

  return (
    <section className="bg-gradient-to-br from-[#0a0a1a] via-[#0f172a] to-[#0a1628] relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-[#0e7490]/20 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-[#0e7490]/15 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-28 lg:py-36 relative z-10">
        <motion.div
          className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left: Text & CTA */}
          <div>
            {/* Pill badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white backdrop-blur-sm text-xs font-semibold px-4 py-2 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0" />
              One-off payment — no monthly fees, ever
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter max-w-3xl text-balance mb-6"
            >
              Run your hotel animation team like a pro.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-zinc-300 text-lg sm:text-xl max-w-[60ch] leading-relaxed mb-10 font-medium"
            >
              The only management platform built for Egyptian resort hotels. Schedule teams, track TripAdvisor scores, and manage performance — across all your properties.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
            >
              <button
                onClick={onBuy}
                className="group flex items-center justify-center gap-2 bg-[#0e7490] hover:bg-[#0c6a84] text-white font-black text-base px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(14,116,144,0.3)] active:-translate-y-[1px]"
              >
                Buy Now — Own It Forever
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/platform"
                className="flex items-center justify-center gap-2 text-white hover:text-white text-sm font-semibold transition-colors border border-white/20 hover:bg-white/10 rounded-xl px-6 py-4"
              >
                See Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="space-y-3"
            >
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Trusted by resorts in</p>
              <div className="flex flex-wrap gap-2">
                {['Sharm El Sheikh', 'Hurghada', 'El Gouna', 'Marsa Alam'].map(city => (
                  <span key={city} className="bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    {city}
                  </span>
                ))}
              </div>
              <p className="text-zinc-400 text-xs">and 4 more destinations</p>
            </motion.div>
          </div>

          {/* Right: Dashboard preview */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="bg-[#0d1526] rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">

              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a1020]">
                <div className="flex gap-1.5 shrink-0">
                  {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex-1 bg-white/[0.05] rounded-md text-center text-[11px] text-white/30 font-mono py-1 mx-6">
                  app.animapro.io
                </div>
                <div className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center">
                  <Bell className="w-3 h-3 text-white/30" />
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 space-y-3 bg-[#0d1526]">
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Active Animators', value: '34',   color: '#0e7490' },
                    { label: 'Today Activities', value: '12',   color: '#22c55e' },
                  ].map(item => (
                    <div key={item.label} className="bg-[#111c32] border border-white/[0.06] rounded-xl p-2.5">
                      <p className="text-white/45 text-[8px] font-semibold uppercase mb-1">{item.label}</p>
                      <p className="text-white font-black text-lg font-mono">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Mini schedule */}
                <div className="bg-[#111c32] border border-white/[0.06] rounded-xl p-2.5">
                  <p className="text-white text-xs font-bold mb-2">Today&apos;s Schedule</p>
                  <div className="space-y-1">
                    {[
                      { time: '09:00', act: 'Aqua Gym', status: 'done' },
                      { time: '11:00', act: 'Kids Disco', status: 'active' },
                      { time: '14:00', act: 'Snorkeling', status: 'upcoming' },
                    ].map(s => (
                      <div key={s.time} className="flex items-center gap-2 text-[8px] py-1">
                        <span className="text-white/40 font-mono w-9">{s.time}</span>
                        <span className="text-white/60 flex-1 truncate">{s.act}</span>
                        <span className={cn(
                          'font-bold px-1.5 rounded',
                          s.status === 'done' ? 'bg-green-500/15 text-green-400' :
                          s.status === 'active' ? 'bg-[#0e7490]/20 text-[#38bdf8]' :
                          'bg-white/[0.06] text-white/35'
                        )}>
                          {s.status === 'done' ? '✓' : s.status === 'active' ? '●' : '→'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score card */}
                <div className="bg-[#111c32] border border-white/[0.06] rounded-xl p-2.5">
                  <p className="text-white/50 text-[8px] font-bold uppercase mb-1">TripAdvisor</p>
                  <p className="text-white font-black text-lg font-mono">4.7<span className="text-xs text-white/40">/5</span></p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className={cn('h-1 flex-1 rounded-full', s <= 4 ? 'bg-[#00af87]' : 'bg-[#00af87]/25')} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
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
                <p className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono">{s.value}</p>
                <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-tight">{s.label}</p>
              </motion.div>
            ))}
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
          <p className="text-[#0e7490] text-xs font-black uppercase tracking-[0.15em] mb-4">Features</p>
          <h2 className="text-5xl sm:text-6xl font-black text-[#121318] leading-tight tracking-tighter text-balance">
            Everything your team needs.
          </h2>
          <p className="text-[#64748b] text-lg mt-6 max-w-[55ch] leading-relaxed">
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
              className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[0].icon; return <Icon className="w-6 h-6 text-[#0e7490]" />; })()}
              </div>
              <h3 className="font-black text-[#121318] text-xl mb-2">{FEATURES[0].title}</h3>
              <p className="text-[#64748b] text-base leading-relaxed max-w-[55ch]">{FEATURES[0].desc}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[1].icon; return <Icon className="w-6 h-6 text-[#0e7490]" />; })()}
              </div>
              <h3 className="font-black text-[#121318] text-lg mb-2">{FEATURES[1].title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{FEATURES[1].desc}</p>
            </motion.div>
          </div>

          {/* Row 2: Right wide */}
          <div className="grid lg:grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[2].icon; return <Icon className="w-6 h-6 text-[#0e7490]" />; })()}
              </div>
              <h3 className="font-black text-[#121318] text-lg mb-2">{FEATURES[2].title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{FEATURES[2].desc}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-5">
                {(() => { const Icon = FEATURES[3].icon; return <Icon className="w-6 h-6 text-[#0e7490]" />; })()}
              </div>
              <h3 className="font-black text-[#121318] text-xl mb-2">{FEATURES[3].title}</h3>
              <p className="text-[#64748b] text-base leading-relaxed max-w-[55ch]">{FEATURES[3].desc}</p>
            </motion.div>
          </div>

          {/* Row 3: 3-col equal */}
          <div className="grid lg:grid-cols-3 gap-4">
            {FEATURES.slice(4).map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="bg-white border border-[#e2e8f0] rounded-2xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-[#0e7490]" />
                </div>
                <h3 className="font-black text-[#121318] text-lg mb-2">{f.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
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
    <section className="bg-[#121318] py-16 sm:py-24 lg:py-32">
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
              className="text-[#0e7490] text-xs font-black uppercase tracking-[0.15em] mb-4"
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
                  <CheckCircle2 className="w-4 h-4 text-[#0e7490] shrink-0" />
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
                    <span className="text-3xl font-black text-white font-mono">{r.score}</span>
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
            className="text-xs font-black text-[#0e7490] uppercase tracking-[0.15em] mb-4"
          >
            Where We Operate
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-[#121318] tracking-tighter text-balance mb-6"
          >
            Every major Egyptian resort destination.
          </motion.h2>
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#64748b] text-lg max-w-[60ch] font-medium leading-relaxed"
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
              className="border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-[#0e7490]/20 transition-all bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center mb-4">
                <city.icon className="w-5 h-5 text-[#0e7490]" />
              </div>
              <h3 className="font-black text-[#121318] text-sm mb-1">{city.name}</h3>
              <p className="text-[10px] text-[#0e7490] font-bold mb-2">{city.hotels}+ hotels</p>
              <p className="text-[11px] text-[#64748b] leading-relaxed">{city.desc}</p>
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
            className="text-xs font-black text-[#0e7490] uppercase tracking-[0.15em] mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-[#121318] tracking-tighter text-balance"
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
              className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f97316] text-[#f97316]" />
                ))}
              </div>
              <p className="text-[#334155] text-base leading-relaxed flex-1 mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-[#e2e8f0] pt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#121318] flex items-center justify-center text-xs font-black text-white shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-[#121318] text-sm">{t.name}</p>
                  <p className="text-[#0e7490] text-xs font-semibold">{t.title}</p>
                  <p className="text-[#94a3b8] text-xs mt-0.5">{t.hotel}</p>
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
            className="text-[#0e7490] text-xs font-black uppercase tracking-[0.15em] mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-[#121318] leading-tight tracking-tighter text-balance mb-6"
          >
            One payment. Yours forever.
          </motion.h2>
          <motion.p
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#64748b] text-lg font-medium"
          >
            No subscription. No monthly fee. Buy once, use forever.
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
                  ? 'bg-[#121318] text-white ring-2 ring-[#0e7490] shadow-[0_20px_40px_-15px_rgba(14,116,144,0.2)]'
                  : 'bg-white border border-[#e2e8f0] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]'
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0e7490] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              <div className="mb-8">
                <p className={cn('text-xs font-black uppercase tracking-widest mb-3', tier.highlight ? 'text-[#0e7490]' : 'text-[#94a3b8]')}>
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={cn('text-5xl font-black font-mono', tier.highlight ? 'text-white' : 'text-[#121318]')}>
                    {tier.price}
                  </span>
                  <span className={cn('text-sm font-semibold', tier.highlight ? 'text-white/50' : 'text-[#94a3b8]')}>
                    {tier.currency}
                  </span>
                </div>
                <p className={cn('text-sm', tier.highlight ? 'text-white/60' : 'text-[#64748b]')}>
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-3.5 flex-1 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#0e7490]" />
                    <span className={tier.highlight ? 'text-white/80' : 'text-[#334155]'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onBuy(tier)}
                className={cn(
                  'w-full py-4 rounded-xl font-black text-sm transition-all active:scale-[0.98]',
                  tier.highlight
                    ? 'bg-[#0e7490] text-white hover:bg-[#0c6080] shadow-[0_20px_40px_-15px_rgba(14,116,144,0.3)]'
                    : 'bg-[#121318] text-white hover:bg-[#1a2540]'
                )}
              >
                {tier.cta} <span className="font-mono">— {tier.price} {tier.currency}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-[#94a3b8] text-sm font-semibold mb-4">Egyptian payment methods accepted</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['InstaPay', 'Vodafone Cash', 'Bank Transfer', 'Visa / Mastercard'].map(m => (
              <span key={m} className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-xs font-bold px-4 py-2 rounded-xl">
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
              className="text-[#0e7490] text-xs font-black uppercase tracking-[0.15em] mb-4"
            >
              Contact
            </motion.p>
            <motion.h2
              variants={headingVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-black text-[#121318] leading-tight tracking-tighter text-balance mb-8"
            >
              Have questions?
            </motion.h2>
            <p className="text-[#64748b] text-lg max-w-[55ch] leading-relaxed mb-10">
              We speak Arabic, English, Polish, Russian, and more. Our team responds within 2 hours during business hours.
            </p>
            <div className="space-y-5">
              {[
                { icon: Phone,     label: 'WhatsApp',  value: '+20 100 000 0000',          href: 'https://wa.me/20100000000' },
                { icon: Mail,      label: 'Email',     value: 'sales@animapro.io',          href: 'mailto:sales@animapro.io' },
                { icon: Building2, label: 'Offices',   value: 'Sharm El Sheikh & Hurghada', href: undefined },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#121318] flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[#94a3b8] text-xs font-semibold">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-[#121318] text-sm font-bold hover:text-[#0e7490] transition-colors">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-[#121318] text-sm font-bold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]"
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
                <p className="text-xl font-black text-[#121318] mb-2">Message sent!</p>
                <p className="text-[#64748b] text-sm leading-relaxed">We will get back to you within 2 hours during business hours.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <p className="font-black text-[#121318] text-lg mb-6">Send us a message</p>
                {[
                  { id: 'cf-name',  label: 'Your Name',        placeholder: 'Mohamed Ahmed',              type: 'text'  },
                  { id: 'cf-hotel', label: 'Hotel / Company',  placeholder: 'Grand Seas Resort, Hurghada', type: 'text'  },
                  { id: 'cf-email', label: 'Email Address',    placeholder: 'you@resort.com',              type: 'email' },
                ].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="text-xs font-bold text-[#475569] mb-1.5 block">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      required
                      className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm text-[#121318] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-colors placeholder:text-[#c0ccda]"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="cf-msg" className="text-xs font-bold text-[#475569] mb-1.5 block">Message</label>
                  <textarea
                    id="cf-msg"
                    rows={4}
                    placeholder="Tell us about your hotel and team size..."
                    required
                    className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm text-[#121318] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-colors resize-none placeholder:text-[#c0ccda]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#121318] hover:bg-[#1a2540] text-white font-black py-3.5 rounded-xl transition-colors text-sm active:scale-[0.98]"
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
    <section className="bg-[#121318] py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#0e7490]/20 rounded-full blur-[100px] pointer-events-none" />
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
            Join 147 hotels across Egypt. From 5,000 EGP. Setup in 48 hours. Yours forever.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <button
              onClick={onBuy}
              className="group flex items-center justify-center gap-2 bg-[#0e7490] hover:bg-[#0c6080] text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_20px_40px_-15px_rgba(14,116,144,0.3)] text-base active:-translate-y-[1px]"
            >
              Buy Now — From <span className="font-mono">5,000 EGP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/platform" className="flex items-center justify-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors border border-white/[0.12] hover:border-white/30 rounded-xl px-6 py-4">
              See Live Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/30 text-xs font-semibold">
            {['No monthly fees', 'Arabic + English', '48h setup', 'White-label ready'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#0e7490]" />
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
  return (
    <footer className="bg-white border-t border-[#e2e8f0] py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0e7490] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[#121318] font-black text-base tracking-tight">AnimaPro</span>
              <p className="text-[#94a3b8] text-xs mt-0.5">Resort Animation Management</p>
            </div>
          </div>
          <p className="text-[#94a3b8] text-xs text-center">
            Built for Egyptian resort hotels — Sharm El Sheikh, Hurghada, El Gouna, Marsa Alam, Dahab, Ain Sokhna, Taba &amp; more
          </p>
          <p className="text-[#94a3b8] text-xs shrink-0">
            &copy; {new Date().getFullYear()} AnimaPro. All rights reserved.
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
