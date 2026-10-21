'use client'

import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/** Panel motion (Emil): quick, subtle, exit softer than enter. */
const EASE = [0.23, 1, 0.32, 1] as const

export function Presence({
  show,
  id,
  children,
  className,
}: {
  show: boolean
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false} mode="popLayout">
        {show && (
          <motion.div
            key={id ?? 'presence'}
            className={className}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE } }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
