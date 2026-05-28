// ─── Animipro — Guest currency switcher ─────────────────────────────────────
//
// Three-segment pill (EGP / USD / EUR). Writes through to the lib/currency
// store, which other components read via useCurrency().

'use client'

import { useEffect, useState } from 'react'
import { CURRENCIES, type Currency, getCurrency, setCurrency, subscribe } from '@/lib/currency'
import { cn } from '@/lib/utils'

export function useCurrency(): Currency {
  const [c, setC] = useState<Currency>(() => getCurrency())
  useEffect(() => {
    setC(getCurrency())
    return subscribe(() => setC(getCurrency()))
  }, [])
  return c
}

export function CurrencySwitcher({ className }: { className?: string }): React.ReactElement {
  const active = useCurrency()
  return (
    <div
      role="radiogroup"
      aria-label="Currency"
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 rounded-full bg-muted ring-1 ring-border',
        className,
      )}
    >
      {CURRENCIES.map(c => {
        const isActive = c === active
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setCurrency(c)}
            className={cn(
              'px-3 py-1 rounded-full text-mini font-bold tabular-nums transition-all',
              isActive
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}
