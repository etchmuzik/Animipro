// ─── AnimaPro — framer-motion presets ───────────────────────────────────────
//
// The audit found `containerVariants` / `itemVariants` copy-pasted in 6+ modules
// with the same spring physics. This file is the single source of truth.
//
// Easing: `--ease-spring` from globals.css → cubic-bezier(0.22, 1, 0.36, 1).
// Stagger: 60ms increments — matches the CSS `.anim-stagger` helper.
//
// Usage:
//   <motion.div variants={stagger} initial="hidden" whileInView="visible">
//     <motion.div variants={fadeInUp} />
//   </motion.div>

import type { Variants, Transition } from 'framer-motion'

// ─── Easings ────────────────────────────────────────────────────────────────

/** Primary easing — matches `--ease-spring` in CSS. Use for everything. */
export const EASE_SPRING = [0.22, 1, 0.36, 1] as const

/** Snappy ease-out for hover/press micro-interactions. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

// ─── Standard transitions ───────────────────────────────────────────────────

/** Default spring transition — use as `transition` on any motion node. */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
}

/** Tween transition matching the CSS spring ease. */
export const springTween: Transition = {
  duration: 0.32,
  ease: EASE_SPRING,
}

// ─── Variants — slide-up entrance ───────────────────────────────────────────

/** Single element: fade + slide up 16px. Mirrors the CSS `.anim-fade-in-up`. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
}

/** Smaller travel — for inline text or stacked status pills. */
export const fadeInUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
}

/** Slide in from the right — for sidebar cards / sticky demos. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...springTransition, stiffness: 80, damping: 18 },
  },
}

// ─── Stagger containers ─────────────────────────────────────────────────────

/**
 * Default stagger — 60ms increments, 100ms delay before first child.
 * Apply to a parent `<motion.div variants={stagger} initial="hidden" whileInView="visible">`
 * and use `fadeInUp` on each child.
 */
export const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

/** Slower stagger for hero blocks where each child is substantial. */
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

// ─── Default `whileInView` viewport — applied for scroll-triggered animation */
export const inViewport = {
  once: true,
  margin: '-80px',
} as const
