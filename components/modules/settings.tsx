'use client'

import { useState } from 'react'
import { Save, Building2, Mail, MapPin, Star, Globe, Bell, Shield, Users, Palette, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Hotel, Company } from '@/lib/mock-data'
import { getPermissions, type AppUser } from '@/lib/roles'

type Tab = 'hotel' | 'company' | 'notifications' | 'roles' | 'appearance'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'hotel',         label: 'Hotel Profile',    icon: Building2  },
  { id: 'company',       label: 'Company',          icon: Globe       },
  { id: 'notifications', label: 'Notifications',    icon: Bell        },
  { id: 'roles',         label: 'Roles & Access',   icon: Shield      },
  { id: 'appearance',    label: 'Appearance',       icon: Palette     },
]

const CITY_LABELS: Record<string, string> = {
  SHARM_EL_SHEIKH: 'Sharm El Sheikh',
  HURGHADA: 'Hurghada',
  MARSA_ALAM: 'Marsa Alam',
  DAHAB: 'Dahab',
}

interface SettingsModuleProps {
  hotel: Hotel
  company: Company
  currentUser: AppUser
}

export function SettingsModule({ hotel, company, currentUser }: SettingsModuleProps) {
  const perms = getPermissions(currentUser.role)
  const [activeTab, setActiveTab] = useState<Tab>('hotel')
  const [saved, setSaved] = useState(false)
  const [hotelForm, setHotelForm] = useState({
    name:         hotel.name,
    address:      hotel.address,
    contactEmail: hotel.contactEmail,
    stars:        hotel.stars,
    city:         hotel.city,
  })
  const [notifSettings, setNotifSettings] = useState({
    leaveRequests:    true,
    schedulePublish:  true,
    newAnnouncement:  true,
    performanceAlert: false,
    dailySummary:     true,
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">{hotel.name} — {company.name}</p>
        </div>
        {perms.canEditSettings && (
          <Button size="sm" className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="flex gap-5 flex-col md:flex-row">

        {/* Sidebar tabs */}
        <nav className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto md:overflow-visible">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors whitespace-nowrap',
                activeTab === t.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              {t.label}
              {activeTab === t.id && <ChevronRight className="w-3.5 h-3.5 ml-auto hidden md:block" />}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">

          {/* ── Hotel Profile ─────────────────────────────────────────────── */}
          {activeTab === 'hotel' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Hotel Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelForm.name}
                    onChange={e => setHotelForm(p => ({ ...p, name: e.target.value }))}
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</label>
                  <select
                    value={hotelForm.city}
                    onChange={e => setHotelForm(p => ({ ...p, city: e.target.value as Hotel['city'] }))}
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    {Object.entries(CITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Email</label>
                  <input
                    type="email"
                    value={hotelForm.contactEmail}
                    onChange={e => setHotelForm(p => ({ ...p, contactEmail: e.target.value }))}
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Star Rating</label>
                  <select
                    value={hotelForm.stars}
                    onChange={e => setHotelForm(p => ({ ...p, stars: Number(e.target.value) }))}
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    {[3, 4, 5].map(s => <option key={s} value={s}>{s} Stars</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</label>
                  <input
                    type="text"
                    value={hotelForm.address}
                    onChange={e => setHotelForm(p => ({ ...p, address: e.target.value }))}
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Read-only ratings */}
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Platform Ratings (read-only)</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'TripAdvisor', value: hotel.tripAdvisorRating.toFixed(1), sub: '/5.0', color: 'text-[#00aa6c]' },
                    { label: 'Google',      value: hotel.googleRating.toFixed(1),      sub: '/5.0', color: 'text-blue-600'   },
                    { label: 'Booking.com', value: hotel.bookingRating.toFixed(1),     sub: '/10',  color: 'text-[#003580]'  },
                  ].map(r => (
                    <div key={r.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className={cn('text-xl font-black', r.color)}>{r.value}<span className="text-xs text-muted-foreground font-normal">{r.sub}</span></p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Company ───────────────────────────────────────────────────── */}
          {activeTab === 'company' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Company Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company Name</label>
                  <input
                    type="text" disabled value={company.name}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Email</label>
                  <input
                    type="email" disabled value={company.contactEmail}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm opacity-60"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Subscription Plan</span>
                <Badge variant="outline" className={cn(
                  'font-bold',
                  company.plan === 'ENTERPRISE'    && 'border-violet-400 text-violet-600 bg-violet-50',
                  company.plan === 'PROFESSIONAL'  && 'border-blue-400   text-blue-600   bg-blue-50',
                  company.plan === 'BASIC'         && 'border-green-400  text-green-600  bg-green-50',
                )}>
                  {company.plan}
                </Badge>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Properties</p>
                {company.hotels.map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-foreground">{h.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{CITY_LABELS[h.city]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notifications ──────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Notification Preferences</h3>
              <div className="space-y-4">
                {([
                  { key: 'leaveRequests',    label: 'New Leave Requests',     desc: 'Notify when an animator submits leave' },
                  { key: 'schedulePublish',  label: 'Schedule Published',     desc: 'Notify when a weekly schedule goes live' },
                  { key: 'newAnnouncement',  label: 'New Announcements',      desc: 'Team-wide announcements' },
                  { key: 'performanceAlert', label: 'Performance Alerts',     desc: 'When a KPI drops below threshold' },
                  { key: 'dailySummary',     label: 'Daily Summary Email',    desc: 'Morning digest of key metrics' },
                ] as const).map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-border/60 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={cn(
                        'relative w-10 h-6 rounded-full transition-colors shrink-0',
                        notifSettings[item.key] ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <span className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        notifSettings[item.key] ? 'translate-x-5' : 'translate-x-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Roles & Access ─────────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Roles & Permissions</h3>
              <div className="space-y-3">
                {([
                  { role: 'SUPER_ADMIN',      color: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700 border-rose-200',   desc: 'Full platform access — all companies & hotels' },
                  { role: 'HOTEL_ADMIN',      color: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200', desc: 'Hotel GM / HR. Full access within their hotel' },
                  { role: 'ANIMATION_CHIEF',  color: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',   desc: 'Chef d\'animation. Manages all teams & schedules' },
                  { role: 'TEAM_LEADER',      color: 'bg-teal-500',   badge: 'bg-teal-50 text-teal-700 border-teal-200',   desc: 'Senior animator. Manages one team\'s schedule' },
                  { role: 'ANIMATOR',         color: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200', desc: 'Views own schedule, submits leave requests' },
                  { role: 'ENTERTAINER',      color: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'DJ / musician / performer. Views show schedule' },
                  { role: 'LIFEGUARD',        color: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Pool & beach lifeguard. Views duty rota' },
                  { role: 'KIDS_CLUB',        color: 'bg-pink-500',   badge: 'bg-pink-50 text-pink-700 border-pink-200',   desc: 'Mini-club staff. Manages kids activities' },
                ]).map(r => (
                  <div key={r.role} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                    <div className={cn('w-2 h-8 rounded-full shrink-0', r.color)} />
                    <div className="flex-1 min-w-0">
                      <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded border', r.badge)}>
                        {r.role.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Appearance ─────────────────────────────────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Appearance & White-Label</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Platform Name</label>
                  <input
                    type="text" defaultValue="AnimaPro"
                    disabled={!perms.canEditSettings}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <p className="text-xs text-muted-foreground">Shown in browser tab and platform header (White-Label plan)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brand Color</label>
                  <div className="flex items-center gap-3">
                    {['#0e7490', '#7c3aed', '#dc2626', '#16a34a', '#ea580c', '#0284c7'].map(c => (
                      <button
                        key={c}
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800">White-Label Tier Required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Full branding customization (logo, colors, domain) is available on the White-Label plan.
                    Contact us to upgrade.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
