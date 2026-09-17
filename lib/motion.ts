'use client'

import { useReducedMotion } from 'framer-motion'

/** Shared Framer Motion budget — no-op transitions when user prefers reduced motion. */
export function useMotionBudget() {
  const reduce = useReducedMotion()
  return {
    reduce: Boolean(reduce),
    fadeUp: reduce
      ? { initial: false as const, animate: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 },
        },
    duration: reduce ? 0 : 0.4,
  }
}
