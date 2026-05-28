// ─── Animipro — StatusBadge ─────────────────────────────────────────────────
//
// The single visual primitive for status pills. Replaces the per-module
// inline color maps that the design audit flagged. Six visual kinds × two
// tones (light / dark) — all driven by the `--status-*` CSS tokens, so a
// theme change cascades automatically.
//
// Usage A — give it a domain + raw status (recommended):
//   <StatusBadge domain="assignment" status={a.status} />
//   <StatusBadge domain="schedule"  status={entry.status} />
//
// Usage B — give it a visual kind + label directly (for custom states):
//   <StatusBadge kind="info" label="Draft" />
//
// `tone` is auto-resolved from the surrounding surface: light if the closest
// ancestor has `data-surface="light"` (or the parent context is white-bg),
// dark otherwise. Caller can override with the prop.

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  getStatusVisual,
  type StatusDomain,
  type StatusKind,
  type StatusTone,
} from '@/lib/status-config'

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Domain + raw status — the recommended path. Mutually exclusive with `kind`. */
  domain?: StatusDomain
  status?: string
  /** Direct visual kind — use when you have a non-domain status (e.g. "Draft", "Live"). */
  kind?: StatusKind
  /** Override the auto-resolved tone. Default: 'dark' on the platform shell. */
  tone?: StatusTone
  /** Display label. Defaults to the canonical label for the resolved kind/status. */
  label?: string
  /** Show the leading colored dot. Default: true. */
  dot?: boolean
  /** Size — compact dropdowns and dense kanban use `sm`. */
  size?: 'sm' | 'md'
}

// ─── Per-kind className lookup ──────────────────────────────────────────────
//
// All classes resolve to CSS variables, so changing a status color is a
// single-line edit in globals.css.

const KIND_CLS_LIGHT: Record<StatusKind, string> = {
  pending:  'bg-[hsl(var(--status-pending-bg))]  text-[hsl(var(--status-pending-fg))]  border-[hsl(var(--status-pending-bd))]',
  progress: 'bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress-fg))] border-[hsl(var(--status-progress-bd))]',
  success:  'bg-[hsl(var(--status-success-bg))]  text-[hsl(var(--status-success-fg))]  border-[hsl(var(--status-success-bd))]',
  danger:   'bg-[hsl(var(--status-danger-bg))]   text-[hsl(var(--status-danger-fg))]   border-[hsl(var(--status-danger-bd))]',
  neutral:  'bg-[hsl(var(--status-neutral-bg))]  text-[hsl(var(--status-neutral-fg))]  border-[hsl(var(--status-neutral-bd))]',
  info:     'bg-[hsl(var(--status-info-bg))]     text-[hsl(var(--status-info-fg))]     border-[hsl(var(--status-info-bd))]',
}

// On dark surfaces the *background* tokens are translucent rgb() rather than
// HSL, so we read them as raw vars. The text tokens are still HSL.
const KIND_CLS_DARK: Record<StatusKind, string> = {
  pending:  'bg-[var(--status-pending-bg)]  text-[hsl(var(--status-pending-fg))]  border-[var(--status-pending-bd)]',
  progress: 'bg-[var(--status-progress-bg)] text-[hsl(var(--status-progress-fg))] border-[var(--status-progress-bd)]',
  success:  'bg-[var(--status-success-bg)]  text-[hsl(var(--status-success-fg))]  border-[var(--status-success-bd)]',
  danger:   'bg-[var(--status-danger-bg)]   text-[hsl(var(--status-danger-fg))]   border-[var(--status-danger-bd)]',
  neutral:  'bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))] border-[hsl(var(--status-neutral-bd))]',
  info:     'bg-[var(--status-info-bg)]     text-[hsl(var(--status-info-fg))]     border-[var(--status-info-bd)]',
}

const SIZE_CLS: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'h-5 px-1.5 text-tiny gap-1',
  md: 'h-6 px-2 text-mini gap-1.5',
}

const DOT_SIZE: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StatusBadge({
  domain,
  status,
  kind: kindProp,
  tone = 'dark',
  label: labelProp,
  dot = true,
  size = 'md',
  className,
  ...rest
}: StatusBadgeProps): React.ReactElement {
  // Resolve kind + label.
  let kind: StatusKind
  let label: string
  if (domain && status) {
    const v = getStatusVisual(domain, status)
    kind = v.kind
    label = labelProp ?? v.label
  } else {
    kind = kindProp ?? 'neutral'
    label = labelProp ?? ''
  }

  const cls = tone === 'light' ? KIND_CLS_LIGHT[kind] : KIND_CLS_DARK[kind]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        SIZE_CLS[size],
        cls,
        className,
      )}
      role="status"
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn('rounded-full bg-current shrink-0', DOT_SIZE[size])}
        />
      )}
      {label}
    </span>
  )
}
