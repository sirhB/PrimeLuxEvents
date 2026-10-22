'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MotionConfig, motion } from 'framer-motion'
import { useCart } from '@/components/providers/cart-provider'
import { PLAN_EVENT_TYPES } from '@/lib/leads/plan-options'

/**
 * Cinematic hero (rare, expressive): a slow Ken Burns crossfade over real event
 * photographs and a line-masked headline. The quick-start bar opens the plan
 * flow prefilled. Ken Burns is CSS-only (transform/opacity) and stops entirely
 * under prefers-reduced-motion.
 */
const FRAMES = [
  { src: '/images/suites/ceremony.jpg', alt: 'Ceremony aisle set with Prime Lux seating and florals' },
  { src: '/images/luxury_event_setup_celebration_1767781442112.png', alt: 'Reception tables dressed under chandeliers' },
  { src: '/images/suites/venue-conservatory.jpg', alt: 'Long tables set for a party' },
]
const LINES = ['Rentals for', 'the whole', 'celebration.']
const EASE = [0.22, 1, 0.36, 1] as const

export function CinematicHero() {
  const { openPlan, hasLead } = useCart()
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('')

  function quickStart(e: React.FormEvent) {
    e.preventDefault()
    const draft = { event_type: type, event_date: date, guest_count: guests }
    const step = !type ? 0 : !date ? 1 : !guests ? 2 : 3
    openPlan({ draft, step })
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="cine" aria-labelledby="cine-title">
        <div className="cine-frames" aria-hidden="false">
          {FRAMES.map((f, i) => (
            <div key={f.src} className="cine-frame" style={{ ['--i' as string]: i }}>
              <Image src={f.src} alt={i === 0 ? f.alt : ''} fill priority={i === 0} sizes="100vw" quality={80} className="cine-img" />
            </div>
          ))}
          <div className="cine-scrim" />
        </div>

        <div className="cine-inner">
          <p className="cine-kicker">Prime Lux Events · Shelton, Connecticut</p>
          <h1 id="cine-title" className="cine-title">
            {LINES.map((line, i) => (
              <span key={line} className="cine-line">
                <motion.span
                  className="cine-line-ink"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.09 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            className="cine-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
          >
            <button type="button" onClick={() => openPlan()} className="lux-cta cine-primary">
              {hasLead ? 'Your event details' : 'Plan your event'}
            </button>
            <Link href="/catalog" className="cine-ghost">Browse rentals</Link>
          </motion.div>

          <motion.form
            onSubmit={quickStart}
            className="cine-quick"
            aria-label="Quick start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          >
            <label className="cine-q">
              <span>Event</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Any</option>
                {PLAN_EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="cine-q">
              <span>Date</span>
              <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="cine-q">
              <span>Guests</span>
              <input type="number" inputMode="numeric" min={1} max={5000} placeholder="100" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </label>
            <button type="submit" className="cine-go">Start</button>
          </motion.form>
        </div>
      </section>
    </MotionConfig>
  )
}
