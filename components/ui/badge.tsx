// ─── AnimaPro — Badge primitive ─────────────────────────────────────────────
//
// Base shadcn Badge — kept for non-status pills (filter chips, counts, "+3
// more" indicators). For status pills (Pending/InProgress/Completed/etc.)
// use the dedicated <StatusBadge> in ./status-badge.tsx, which reads the
// `--status-*` token set.
//
// Variants:
//   default      — solid primary (teal)
//   secondary    — slate fill
//   destructive  — solid red
//   outline      — transparent fill, current border
//   ghost        — no border, subtle hover (for inline counts)
//
// Sizes:
//   sm  (h-5)   — dense kanban / table cell badges
//   md  (h-6)   — default
//   lg  (h-7)   — marketing-style hero pills

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
      },
      size: {
        sm: "h-5 px-1.5 text-tiny gap-1",
        md: "h-6 px-2 text-mini gap-1.5",
        lg: "h-7 px-2.5 text-xs gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps): React.ReactElement {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
