'use client'

import { useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PlanOnboarding, type PlanOnboardingProps } from '@/components/plan/plan-onboarding'

/** Bottom sheet on phones, centered panel on desktop. Exit is quicker and shorter than entry. */
export function PlanSheet({ open, onClose, ...props }: PlanOnboardingProps & { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <div className="plan-sheet-root" role="dialog" aria-modal="true" aria-label="Plan your event">
            <motion.div className="plan-sheet-scrim" onClick={onClose}
              initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} />
            <motion.div className="plan-sheet-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}>
              <div className="plan-sheet-head">
                <span className="lux-label">Plan your event</span>
                <button type="button" onClick={onClose} aria-label="Close" className="plan-sheet-close"><X className="h-4 w-4" /></button>
              </div>
              <PlanOnboarding {...props} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
