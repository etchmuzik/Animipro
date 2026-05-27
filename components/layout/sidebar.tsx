'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList, Megaphone,
  BarChart2, ChevronLeft, ChevronRight, Settings,
  Zap, PartyPopper, LogOut, Building2,
  ChevronsUpDown, Check, MapPin, Hotel,
  Activity, UserCheck, UserPlus, TrendingUp, X,
  Ticket as TicketIcon,
} from 'lucide-react'
import { COMPANIES, ALL_HOTELS } from '@/lib/mock-data'
import { ROLE_META, getAllowedSections, type AppUser, type Section } from '@/lib/roles'
import { getApplicationStats, subscribe as subscribeApplications } from '@/lib/applications'
import { getBrand, subscribe as subscribeBrand } from '@/lib/brand-store'
import { useTranslation } from '@/lib/i18n'

const ALL_NAV_ITEMS: { icon: React.ElementType; label: string; section: Section; badge?: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard',      section: 'dashboard' },
  { icon: Users,           label: 'Team',           section: 'team' },
  { icon: CalendarDays,    label: 'Schedule',       section: 'schedule' },
  { icon: Activity,        label: 'Activities',     section: 'activities' },
  { icon: ClipboardList,   label: 'Assignments',    section: 'assignments',   badge: '5' },
  { icon: PartyPopper,     label: 'Events',         section: 'events',        badge: '3' },
  { icon: Megaphone,       label: 'Announcements',  section: 'announcements', badge: '2' },
  { icon: UserCheck,       label: 'Leave Requests', section: 'leave',         badge: '4' },
  { icon: UserPlus,        label: 'Recruitment',    section: 'recruitment' },
  { icon: TicketIcon,      label: 'Club Tickets',   section: 'tickets' },
  { icon: BarChart2,       label: 'Reports',        section: 'reports' },
  { icon: TrendingUp,      label: 'Performance',    section: 'performance' },
  { icon: Settings,        label: 'Settings',       section: 'settings' },
]

const CITY_LABELS: Record<string, string> = {
  SHARM_EL_SHEIKH: 'Sharm El Sheikh', HURGHADA: 'Hurghada', MARSA_ALAM: 'Marsa Alam',
  DAHAB: 'Dahab', EL_GOUNA: 'El Gouna', SAHL_HASHEESH: 'Sahl Hasheesh',
  MAKADI_BAY: 'Makadi Bay', AIN_SOKHNA: 'Ain Sokhna', TABA: 'Taba',
  NUWEIBA: 'Nuweiba', ALEXANDRIA: 'Alexandria', LUXOR: 'Luxor',
  ASWAN: 'Aswan', CAIRO: 'Cairo', SAFAGA: 'Safaga',
}
const CITY_FLAG: Record<string, string> = {
  SHARM_EL_SHEIKH: 'SHM', HURGHADA: 'HRG', MARSA_ALAM: 'MSA', DAHAB: 'DAH',
  EL_GOUNA: 'GNA', SAHL_HASHEESH: 'SHL', MAKADI_BAY: 'MKD', AIN_SOKHNA: 'SKH',
  TABA: 'TBA', NUWEIBA: 'NWB', ALEXANDRIA: 'ALX', LUXOR: 'LXR',
  ASWAN: 'ASW', CAIRO: 'CAI', SAFAGA: 'SFG',
}

interface SidebarProps {
  activeSection: Section
  onSectionChange: (s: Section) => void
  selectedCompanyId: string
  selectedHotelId: string
  onHotelChange: (companyId: string, hotelId: string) => void
  currentUser: AppUser
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarContent({
  activeSection, onSectionChange,
  selectedCompanyId, selectedHotelId, onHotelChange,
  currentUser, collapsed, onClose,
}: {
  activeSection: Section
  onSectionChange: (s: Section) => void
  selectedCompanyId: string
  selectedHotelId: string
  onHotelChange: (companyId: string, hotelId: string) => void
  currentUser: AppUser
  collapsed: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  // Live count of NEW applications for the Recruitment nav badge. Starts at 0 so
  // the server and first client render agree (no hydration mismatch), then fills
  // in after mount and stays in sync with the applications store.
  const [newApplications, setNewApplications] = useState(0)
  useEffect(() => {
    const refresh = () => setNewApplications(getApplicationStats().new)
    refresh()
    return subscribeApplications(refresh)
  }, [])

  // Live white-label brand (app name shown in the logo block).
  const [brand, setBrand] = useState(() => getBrand())
  useEffect(() => {
    const refresh = () => setBrand(getBrand())
    refresh()
    return subscribeBrand(refresh)
  }, [])

  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) ?? COMPANIES[0]
  const selectedHotel   = ALL_HOTELS.find(h => h.id === selectedHotelId)  ?? selectedCompany.hotels[0]
  const allowedSections = getAllowedSections(currentUser.role)
  const roleMeta        = ROLE_META[currentUser.role]
  const canSwitchHotel  = roleMeta.level <= 2
  const navItems        = ALL_NAV_ITEMS
    .filter(n => allowedSections.includes(n.section))
    .map(n =>
      n.section === 'recruitment'
        ? { ...n, badge: newApplications > 0 ? String(newApplications) : undefined }
        : n,
    )

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] shrink-0',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/80 shrink-0 shadow-[0_1px_3px_rgba(13,116,144,0.2)]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold tracking-tight text-white">{brand.appName}</span>
            <p className="text-micro text-white/70 leading-none mt-0.5">{brand.tagline}</p>
          </div>
        )}
        {onClose && !collapsed && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.08] text-white/70 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Hotel / Company Switcher ─────────────────────────────────────── */}
      <div className={cn('px-3 mt-3 relative', collapsed && 'px-2')}>
        {!collapsed ? (
          <>
            <p className="text-mini font-semibold text-white/60 uppercase tracking-widest px-1 mb-1.5">
              {t('sidebar.activeProperty')}
            </p>
            <button
              onClick={() => canSwitchHotel && setSwitcherOpen(v => !v)}
              disabled={!canSwitchHotel}
              className={cn(
                'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left transition-all',
                canSwitchHotel ? 'hover:bg-hsl(228, 12%, 12%) cursor-pointer' : 'cursor-default opacity-90'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-mini font-mono font-bold text-teal-400">{selectedHotel.stars}★</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-mini text-white/70 uppercase tracking-widest leading-none truncate">{selectedCompany.name}</p>
                <p className="text-sm font-semibold text-white leading-tight mt-0.5 truncate">{selectedHotel.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-micro font-mono font-bold text-teal-400/80 bg-teal-500/10 px-1 rounded">{CITY_FLAG[selectedHotel.city] ?? '---'}</span>
                  <span className="text-micro text-white/70">{CITY_LABELS[selectedHotel.city] ?? selectedHotel.city}</span>
                </div>
              </div>
              {canSwitchHotel && <ChevronsUpDown className="w-3.5 h-3.5 text-white/70 mt-2 shrink-0" />}
            </button>

            {canSwitchHotel && (
              <div className="flex items-center gap-1 mt-1.5 px-1">
                <Hotel className="w-2.5 h-2.5 text-white/20" />
                <span className="text-mini text-white/20">{ALL_HOTELS.length} hotels across {COMPANIES.length} companies</span>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => canSwitchHotel && setSwitcherOpen(v => !v)}
            disabled={!canSwitchHotel}
            className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-hsl(228, 12%, 12%) transition-colors"
          >
            <Building2 className="w-4 h-4 text-teal-400/70" />
          </button>
        )}

        {/* Hotel switcher dropdown */}
        <AnimatePresence>
          {switcherOpen && canSwitchHotel && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute left-3 right-3 top-full mt-2 z-50 bg-brand-navy-elev2 border border-white/10 rounded-xl shadow-xl shadow-black/20 overflow-hidden backdrop-blur-sm"
              >
                <div className="px-3 py-2.5 bg-white/[0.03] border-b border-white/10">
                  <p className="text-mini font-semibold text-white/70 uppercase tracking-widest">{t('sidebar.switchProperty')}</p>
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {COMPANIES.map((company, ci) => (
                    <div key={company.id}>
                      <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-mini font-bold text-white/60 uppercase tracking-widest whitespace-nowrap">{company.name}</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                      <div className="px-3 pb-1">
                        <span className={cn('text-mini font-semibold px-1.5 py-0.5 rounded',
                          company.plan === 'ENTERPRISE' && 'bg-violet-500/20 text-violet-300',
                          company.plan === 'PROFESSIONAL' && 'bg-blue-500/20 text-blue-300',
                          company.plan === 'BASIC' && 'bg-green-500/20 text-green-300',
                        )}>{company.plan}</span>
                        <span className="text-mini text-white/60 ml-1.5">{company.hotels.length} properties</span>
                      </div>
                      {company.hotels.map(hotel => {
                        const isSelected = hotel.id === selectedHotelId
                        return (
                          <button key={hotel.id} onClick={() => { onHotelChange(company.id, hotel.id); setSwitcherOpen(false) }}
                            className={cn('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all',
                              isSelected ? 'bg-teal-500/15 text-white' : 'hover:bg-white/[0.04] text-white/60'
                            )}>
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-mini font-mono font-bold border',
                              isSelected ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-white/[0.04] text-white/70 border-white/10'
                            )}>{hotel.stars}★</div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-semibold leading-none truncate', isSelected ? 'text-white' : 'text-white/70')}>{hotel.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-2.5 h-2.5 text-white/20" />
                                <span className="text-mini text-white/70">{CITY_LABELS[hotel.city] ?? hotel.city}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                          </button>
                        )
                      })}
                      {ci < COMPANIES.length - 1 && <div className="h-px bg-white/[0.04] mx-3 mt-1" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-0.5 mt-2">
        {navItems.map(({ icon: Icon, section, badge }) => {
          const isActive = activeSection === section
          return (
            <button key={section}
              onClick={() => { onSectionChange(section); setSwitcherOpen(false); onClose?.() }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150',
                isActive
                  ? 'bg-teal-500/20 text-white font-semibold shadow-[inset_0_1px_0_hsl(192_72%_42%/0.2)]'
                  : 'text-white/80 hover:bg-hsl(228, 12%, 12%) hover:text-white/80',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
              {!collapsed && (
                <>
                  <span className="text-sm leading-none flex-1">{t(`sections.${section}`)}</span>
                  {badge && (
                    <span className={cn(
                      'text-mini h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center font-mono font-bold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-500/20 text-teal-400'
                    )}>{badge}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── User card ────────────────────────────────────────────────────── */}
      <div className={cn('border-t border-white/10 p-3 shrink-0', collapsed && 'flex flex-col items-center gap-1')}>
        {!collapsed && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className={cn('inline-flex items-center text-mini font-bold px-2.5 py-1 rounded-full uppercase tracking-widest',
              roleMeta.level === 1 && 'bg-rose-500/20 text-rose-300',
              roleMeta.level === 2 && 'bg-violet-500/20 text-violet-300',
              roleMeta.level === 3 && 'bg-blue-500/20 text-blue-300',
              roleMeta.level === 4 && 'bg-teal-500/20 text-teal-300',
              roleMeta.level === 5 && 'bg-green-500/20 text-green-300',
            )}>
              {roleMeta.label}
            </span>
            {currentUser.teamName && (
              <span className="text-mini text-white/70 truncate">· {currentUser.teamName}</span>
            )}
          </div>
        )}
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
            roleMeta.level === 1 && 'from-rose-500 to-rose-600',
            roleMeta.level === 2 && 'from-violet-500 to-violet-600',
            roleMeta.level === 3 && 'from-blue-500 to-blue-600',
            roleMeta.level === 4 && 'from-teal-500 to-teal-600',
            roleMeta.level === 5 && 'from-green-500 to-green-600',
          )}>
            <span className="text-xs font-bold text-white">{currentUser.initials}</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-mini text-white/70 truncate">{roleMeta.label}</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-white/60 shrink-0 hover:text-white/60 cursor-pointer transition-colors" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const { mobileOpen, onMobileClose, ...rest } = props
  const { dir } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  // In RTL the drawer lives on the right and slides in from the right edge.
  const isRtl = dir === 'rtl'
  const drawerOffset = isRtl ? 288 : -288

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'relative hidden md:flex flex-col h-screen bg-hsl(228, 14%, 8%) text-white transition-all duration-300 shrink-0 z-20',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent {...rest} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-hsl(228, 14%, 8%) border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-teal-500/40 transition-all z-10 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: drawerOffset }}
            animate={{ x: 0 }}
            exit={{ x: drawerOffset }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
              'fixed top-0 h-full w-72 z-50 bg-hsl(228, 14%, 8%) text-white flex flex-col md:hidden shadow-xl shadow-black/30',
              isRtl ? 'right-0' : 'left-0',
            )}
          >
            <SidebarContent {...rest} collapsed={false} onClose={onMobileClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
