'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Building2, ChevronDown, Check, Users, Menu, X } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { DEMO_USERS, ROLE_META, type AppUser, type Section } from '@/lib/roles'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationsBell } from '@/components/layout/notifications-bell'
import { useTranslation } from '@/lib/i18n'
import { getBrand, subscribe as subscribeBrand } from '@/lib/brand-store'

interface TopbarProps {
  activeSection: string
  searchQuery: string
  onSearchChange: (q: string) => void
  hotelId: string
  hotelName: string
  companyName: string
  currentUser: AppUser
  onUserChange: (user: AppUser) => void
  onMenuOpen: () => void
  onSectionChange: (s: Section) => void
}

export function Topbar({
  activeSection, searchQuery, onSearchChange,
  hotelId, hotelName, companyName, currentUser, onUserChange, onMenuOpen, onSectionChange,
}: TopbarProps) {
  const { t, locale } = useTranslation()
  const [roleMenuOpen, setRoleMenuOpen]       = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Live white-label brand name (fallback title for unknown sections).
  const [brandName, setBrandName] = useState(() => getBrand().appName)
  useEffect(() => {
    const refresh = () => setBrandName(getBrand().appName)
    refresh()
    return subscribeBrand(refresh)
  }, [])

  // Section title/subtitle come from the i18n catalog keyed by the active
  // section; fall back to the brand name for unknown sections.
  const title = t(`sections.${activeSection}`) === `sections.${activeSection}`
    ? brandName
    : t(`sections.${activeSection}`)
  const today = new Date().toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const roleMeta = ROLE_META[currentUser.role]

  const levelTone = (level: number): BadgeTone => ({
    1: 'rose' as const,
    2: 'violet' as const,
    3: 'sky' as const,
    4: 'primary' as const,
    5: 'emerald' as const,
  }[level] ?? 'muted')

  const avatarGradient = (level: number) => ({
    1: 'from-rose-500 to-rose-600',
    2: 'from-violet-500 to-violet-600',
    3: 'from-blue-500 to-blue-600',
    4: 'from-teal-500 to-teal-600',
    5: 'from-green-500 to-green-600',
  }[level] ?? 'from-primary to-primary')

  return (
    <header className="shrink-0 relative z-10">

      {/* Main topbar row */}
      <div className="h-14 flex items-center gap-2 px-3 sm:px-5 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-semibold text-white leading-none tracking-tight truncate">{title}</h1>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Building2 className="w-3 h-3 text-teal-500" />
              <span className="text-mini text-zinc-300 truncate max-w-24">{companyName}</span>
              <span className="text-mini text-white/30 mx-0.5">/</span>
              <span className="text-mini font-semibold text-white truncate max-w-32">{hotelName}</span>
            </div>
          </div>
          <p className="text-mini text-white/50 mt-0.5 hidden sm:block leading-none">{today}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">

          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <Input
              placeholder={t('topbar.search')}
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9 h-9 w-44 text-xs bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40 focus-visible:w-60 focus-visible:bg-white/10 focus-visible:border-teal-500/40 focus-visible:ring-teal-500/10 transition-all duration-200"
            />
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(v => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all"
            aria-label="Search"
          >
            {mobileSearchOpen ? <X className="w-4 h-4 text-white" /> : <Search className="w-4 h-4 text-white" />}
          </button>

          {/* Language switcher */}
          <LanguageSwitcher variant="dark" />

          {/* Notifications center */}
          <NotificationsBell hotelId={hotelId} onSectionChange={onSectionChange} />

          {/* User / role switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all"
            >
              <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.3)]', avatarGradient(roleMeta.level))}>
                <span className="text-micro font-bold text-white">{currentUser.initials}</span>
              </div>
              <div className="hidden sm:flex flex-col items-start gap-1">
                <p className="text-xs font-semibold text-white leading-none">{currentUser.name}</p>
                <Badge variant="soft" size="xs" tone={levelTone(roleMeta.level)}>
                  {roleMeta.label}
                </Badge>
              </div>
              <ChevronDown className={cn('w-3.5 h-3.5 text-white/50 hidden sm:block transition-transform', roleMenuOpen && 'rotate-180')} />
            </button>

            {/* Role dropdown */}
            <AnimatePresence>
              {roleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute end-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-1.5rem)] bg-zinc-800 border border-white/10 rounded-xl shadow-lg shadow-black/30 overflow-hidden"
                  >
                    <div className="px-3 py-2.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-xs font-semibold text-white/70">{t('topbar.switchUser')}</span>
                      <span className="ml-auto text-mini text-white/40 italic">{t('common.demoOnly')}</span>
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto scrollbar-thin">
                      {DEMO_USERS.map(user => {
                        const meta = ROLE_META[user.role]
                        const isActive = user.id === currentUser.id
                        return (
                          <button key={user.id}
                            onClick={() => { onUserChange(user); setRoleMenuOpen(false) }}
                            className={cn('w-full flex items-center gap-3 px-3 py-2.5 text-start transition-all',
                              isActive ? 'bg-teal-500/10' : 'hover:bg-white/5'
                            )}>
                            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]', avatarGradient(meta.level))}>
                              {user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-none truncate text-white">{user.name}</p>
                              <p className="text-mini text-white/60 mt-0.5 truncate">{meta.description}</p>
                              {user.teamName && <p className="text-mini text-teal-400/70 mt-0.5">{user.teamName}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <Badge variant="soft" size="xs" tone={levelTone(meta.level)}>{meta.label}</Badge>
                              {isActive && <Check className="w-3 h-3 text-teal-500" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <div className="px-3 py-2 bg-white/5 border-t border-white/10">
                      <p className="text-mini text-white/50">{t('topbar.switchHint')}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-3 py-2 bg-zinc-900/90 backdrop-blur-xl border-b border-white/10"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <Input
                autoFocus
                placeholder={t('topbar.searchAnything')}
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-9 h-10 w-full text-sm bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
