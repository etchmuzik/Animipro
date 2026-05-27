// ─── AnimaPro — Notifications center ──────────────────────────────────────────
//
// Replaces the inert topbar bell with a live dropdown that aggregates signals
// already in the app: new job applications (applications store), pending leave
// requests, and recent active announcements. Each item deep-links to its section
// via the shell's onSectionChange. Reuses the topbar's dropdown pattern.

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, UserPlus, CalendarOff, Megaphone, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { getApplicationStats, subscribe as subscribeApplications } from '@/lib/applications'
import { getHotelLeaveRequests, getHotelAnnouncements } from '@/lib/mock-data'
import type { Section } from '@/lib/roles'

interface NotificationItem {
  id: string
  icon: React.ElementType
  text: string
  section: Section
  tone: string
}

export function NotificationsBell({
  hotelId,
  onSectionChange,
}: {
  hotelId: string
  onSectionChange: (s: Section) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  // Re-read when applications change (new submissions from the careers page).
  const [appsTick, setAppsTick] = useState(0)
  useEffect(() => subscribeApplications(() => setAppsTick(n => n + 1)), [])

  const items = useMemo<NotificationItem[]>(() => {
    void appsTick // dependency: recompute when applications mutate
    const out: NotificationItem[] = []

    const newApps = getApplicationStats().new
    if (newApps > 0) {
      out.push({
        id: 'apps',
        icon: UserPlus,
        text: t('notifications.newApplications', { count: newApps }),
        section: 'recruitment',
        tone: 'text-cyan-400 bg-cyan-500/10',
      })
    }

    const pendingLeave = getHotelLeaveRequests(hotelId).filter(l => l.status === 'PENDING')
    if (pendingLeave.length > 0) {
      out.push({
        id: 'leave',
        icon: CalendarOff,
        text: t('notifications.pendingLeave', { count: pendingLeave.length }),
        section: 'leave',
        tone: 'text-amber-400 bg-amber-500/10',
      })
    }

    const announcements = getHotelAnnouncements(hotelId).filter(a => a.isActive).slice(0, 3)
    for (const a of announcements) {
      out.push({
        id: `ann-${a.id}`,
        icon: Megaphone,
        text: t('notifications.recentAnnouncement', { title: a.title }),
        section: 'announcements',
        tone: 'text-violet-400 bg-violet-500/10',
      })
    }

    return out
  }, [hotelId, appsTick, t])

  const count = items.length

  function openSection(section: Section) {
    onSectionChange(section)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={t('topbar.notifications')}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all"
      >
        <Bell className="w-4 h-4 text-white/70" />
        {count > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-[hsl(var(--brand-teal))] text-tiny font-bold text-white shadow-sm">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="absolute end-0 top-full mt-2 z-50 w-80 overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-lg shadow-black/30"
            >
              <div className="px-3 py-2.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs font-semibold text-white/70">{t('notifications.title')}</span>
                {count > 0 && <span className="ml-auto text-mini text-white/40">{count}</span>}
              </div>

              {count === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-white/5">
                    <CheckCheck className="w-5 h-5 text-white/40" />
                  </div>
                  <p className="text-sm text-white/60">{t('notifications.empty')}</p>
                </div>
              ) : (
                <div className="py-1 max-h-80 overflow-y-auto scrollbar-thin">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => openSection(item.section)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-start hover:bg-white/5 transition-colors"
                    >
                      <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', item.tone)}>
                        <item.icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1 text-sm text-white/80 leading-snug">{item.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
