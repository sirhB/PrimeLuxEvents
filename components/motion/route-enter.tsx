'use client'

import { motion, MotionConfig } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Panel route change: a 180ms settle (opacity + 4px), no exit so navigation
 * never waits on animation. Keyed by pathname; skipped for reduced motion.
 */
export function RouteEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
