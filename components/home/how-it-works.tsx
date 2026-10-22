'use client'

import { useRef } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useCart } from '@/components/providers/cart-provider'

const STEPS = [
  { n: '01', title: 'Plan your event', line: 'Answer six short questions about your date, your guests, and where it is. Someone on our team reads it the same day.' },
  { n: '02', title: 'Reserve', line: 'Pick your pieces, look them over, and we hold them for your date.' },
  { n: '03', title: 'Delivered & styled', line: 'Our crew brings it all out and sets up the room the way you planned it.' },
  { n: '04', title: 'Picked up', line: 'When the night is over, we come back and pack it up. You just go home.' },
]

/**
 * One expressive, scroll-linked moment: a gold hairline draws down (mobile) or
 * across (desktop) as the section passes, and each step's numeral is unmasked
 * as it enters. Reduced motion: the line is fully drawn and steps are static.
 */
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { openPlan, hasLead } = useCart()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <MotionConfig reducedMotion="user">
      <section ref={ref} className="hiw" aria-labelledby="hiw-title">
        <p className="lux-label">How it works</p>
        <h2 id="hiw-title" className="hiw-title">Four steps, and we do the heavy lifting.</h2>
        <div className="hiw-wrap">
          <div className="hiw-rail" aria-hidden="true">
            <motion.span className="hiw-line" style={reduce ? undefined : { scaleY: draw }} />
            <motion.span className="hiw-line-x" style={reduce ? undefined : { scaleX: draw }} />
          </div>
          <ol className="hiw-steps">
            {STEPS.map((s, i) => (
              <li key={s.n} className="hiw-step">
                <span className="hiw-num-mask">
                  <motion.span
                    className="hiw-num"
                    initial={reduce ? false : { y: '100%', opacity: 0 }}
                    whileInView={{ y: '0%', opacity: 1 }}
                    viewport={{ once: true, margin: '-20% 0px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {s.n}
                  </motion.span>
                </span>
                <h3 className="hiw-step-title">{s.title}</h3>
                <p className="hiw-step-line">{s.line}</p>
                {i === 0 && (
                  <button type="button" className="hiw-cta" onClick={() => openPlan()}>
                    {hasLead ? 'Edit your details' : 'Start now'} →
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </MotionConfig>
  )
}
