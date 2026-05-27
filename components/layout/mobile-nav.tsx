'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard, CalendarDays, Activity,
  ClipboardList, Megaphone, MoreHorizontal,
} from 'lucide-react'
import type { Section } from '@/lib/roles'
import { useTranslation } from '@/lib/i18n'

const BOTTOM_NAV_ITEMS: { icon: React.ElementType; labelKey: string; section: Section; badge?: string }[] = [
  { icon: LayoutDashboard, labelKey: 'mobileNav.home',       section: 'dashboard' },
  { icon: CalendarDays,    labelKey: 'mobileNav.schedule',   section: 'schedule' },
  { icon: Activity,        labelKey: 'mobileNav.activities', section: 'activities' },
  { icon: ClipboardList,   labelKey: 'mobileNav.tasks',      section: 'assignments', badge: '5' },
  { icon: Megaphone,       labelKey: 'mobileNav.news',       section: 'announcements', badge: '2' },
]

interface MobileNavProps {
  activeSection: Section
  onSectionChange: (s: Section) => void
  onMenuOpen: () => void
  allowedSections: Section[]
}

export function MobileNav({ activeSection, onSectionChange, onMenuOpen, allowedSections }: MobileNavProps) {
  const { t } = useTranslation()
  const visibleItems = BOTTOM_NAV_ITEMS.filter(i => allowedSections.includes(i.section))

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 mobile-nav-glass border-t border-black/[0.04]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-[60px]">
        {visibleItems.map(({ icon: Icon, labelKey, section, badge }) => {
          const isActive = activeSection === section
          return (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative press-effect',
                isActive ? 'text-primary' : 'text-slate-400 active:text-muted-foreground'
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary tab-indicator shadow-sm shadow-primary/30" />
              )}

              <div className="relative">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                  isActive ? 'bg-primary/10' : ''
                )}>
                  <Icon className={cn('w-[20px] h-[20px] transition-all', isActive && 'w-[21px] h-[21px]')} />
                </div>
                {badge && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-tiny font-bold text-white px-1 shadow-sm shadow-primary/30">
                    {badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-micro leading-none transition-all',
                isActive ? 'font-bold text-primary' : 'font-medium'
              )}>{t(labelKey)}</span>
            </button>
          )
        })}

        {/* More button */}
        <button
          onClick={onMenuOpen}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 active:text-muted-foreground transition-all press-effect"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <MoreHorizontal className="w-[20px] h-[20px]" />
          </div>
          <span className="text-micro font-medium leading-none">{t('mobileNav.more')}</span>
        </button>
      </div>
    </nav>
  )
}
