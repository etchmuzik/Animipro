// ─── Animipro — Badge primitive ─────────────────────────────────────────────
//
// Base shadcn Badge — the canonical pill for non-status counts, role tags,
// review-source badges, and filter chips. For domain status pills (Pending /
// InProgress / Completed / etc.) use the dedicated <StatusBadge> in
// ./status-badge.tsx — it reads the `--status-*` token set.
//
// Variants:
//   default      — solid primary (teal) — use for prominent calls-to-action
//   secondary    — slate fill
//   destructive  — solid red
//   outline      — transparent fill, current border
//   ghost        — no border, subtle hover (for inline counts)
//   soft         — translucent fill, matching coloured text — soft-tint pill
//                  (the most common pattern on the platform). Pair with the
//                  `tone` prop to pick: primary / emerald / amber / rose / sky / violet.
//
// Sizes:
//   xs  (h-4)   — micro counts (next to nav labels)
//   sm  (h-5)   — dense kanban / table cells / inline counts
//   md  (h-6)   — default / labels / status-style
//   lg  (h-7)   — marketing-style hero pills

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-border text-foreground bg-transparent",
        ghost: "border-transparent text-muted-foreground hover:bg-muted",
        soft: "border-transparent", // bg + text supplied via `tone` prop
      },
      size: {
        xs: "h-4 px-1.5 text-[9px] gap-1 leading-none",
        sm: "h-5 px-2 text-[10px] gap-1 leading-none",
        md: "h-6 px-2.5 text-[11px] gap-1.5 leading-none",
        lg: "h-7 px-3 text-[12px] gap-1.5 leading-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Soft-tint colour map. Each value is a (bg / text) combo so the pill reads
// as a single colour family. Use with variant="soft".
const SOFT_TONES = {
  primary: "bg-primary/12 text-primary",
  emerald: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  amber:   "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  rose:    "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  sky:     "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  violet:  "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  muted:   "bg-muted text-muted-foreground",
} as const

export type BadgeTone = keyof typeof SOFT_TONES

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Used with `variant="soft"` to pick a colour family. Default: primary. */
  tone?: BadgeTone
}

function Badge({ className, variant, size, tone = "primary", ...props }: BadgeProps): React.ReactElement {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        variant === "soft" && SOFT_TONES[tone],
        className,
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants, SOFT_TONES }
