// ─── AnimaPro — Language switcher ────────────────────────────────────────────
//
// Dropdown to change the UI language. Used in two themes: `light` on the sunlit
// marketing navbar, `dark` on the platform topbar. Writes to the locale store;
// the DirController + every useTranslation() consumer react automatically.

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { setLocale } from '@/lib/i18n/store'
import { LOCALE_LIST, LOCALES, type Locale } from '@/lib/i18n/locales'

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function LanguageSwitcher({ variant = 'dark', className }: LanguageSwitcherProps) {
  const { locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const active = LOCALES[locale]

  const isLight = variant === 'light'

  function choose(code: Locale) {
    setLocale(code)
    setOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Change language"
        className={cn(
          'flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors',
          isLight
            ? 'text-[oklch(0.42_0.03_220)] hover:bg-[oklch(0.4_0.04_215_/_0.07)] hover:text-[oklch(0.27_0.055_220)]'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{active.short}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className={cn(
                'absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border shadow-lg',
                isLight
                  ? 'border-[oklch(0.4_0.04_215_/_0.12)] bg-white shadow-[oklch(0.3_0.05_220_/_0.15)]'
                  : 'border-white/10 bg-zinc-800 shadow-black/30',
              )}
            >
              {LOCALE_LIST.map(l => {
                const isActive = l.code === locale
                return (
                  <button
                    key={l.code}
                    onClick={() => choose(l.code)}
                    dir={l.dir}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2.5 text-start transition-colors',
                      isLight
                        ? isActive ? 'bg-[oklch(0.5_0.1_212_/_0.1)]' : 'hover:bg-[oklch(0.4_0.04_215_/_0.05)]'
                        : isActive ? 'bg-teal-500/10' : 'hover:bg-white/5',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-6 w-7 shrink-0 place-items-center rounded text-[11px] font-bold',
                        isLight ? 'bg-[oklch(0.5_0.1_212_/_0.1)] text-[oklch(0.45_0.09_210)]' : 'bg-white/10 text-white/80',
                      )}
                    >
                      {l.short}
                    </span>
                    <span className={cn('flex-1 text-sm font-medium', isLight ? 'text-[oklch(0.3_0.05_220)]' : 'text-white')}>
                      {l.nativeName}
                    </span>
                    {isActive && <Check className={cn('h-3.5 w-3.5 shrink-0', isLight ? 'text-[oklch(0.5_0.1_212)]' : 'text-teal-400')} />}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
