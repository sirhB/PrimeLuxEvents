'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MotionConfig, motion, type Transition } from 'framer-motion'
import { useSuite } from '@/components/suite/use-suite'
import type { VenueListing } from '@/lib/venues/directory'

/**
 * The House Ledger.
 * One sheet of house paper that sets out the whole celebration the way an
 * old estate ledger would: the room, the pieces, the plan. The ceremony
 * photograph is tipped in like a print with paper corners, not used as a
 * backdrop. Motion is a single authored moment (rules draw, the print is set
 * down, the ledger lines are entered) and is skipped for reduced motion.
 */
const TAGLINE = 'The whole celebration, under one roof.'

// Jakub: soft, exponential ease-out for the entrance; Jhey: one spring for the print.
const EASE_OUT: Transition['ease'] = [0.23, 1, 0.32, 1]
const PRINT_SPRING: Transition = { type: 'spring', stiffness: 140, damping: 22, mass: 0.9 }

export function HouseLedgerHero({ venues }: { venues: VenueListing[] }) {
  const { suite } = useSuite()
  const roomCount = venues.length
  const secondary = suite === 'venue'
    ? { href: '/venues', label: 'View venues' }
    : { href: '/catalog', label: 'View the collection' }

  const entries = [
    {
      term: 'The room',
      value: roomCount > 0 ? `${roomCount} ${roomCount === 1 ? 'venue' : 'venues'}` : 'Our venues',
      note: venues.slice(0, 3).map((v) => v.name).join(' · ') || 'Private rooms for the whole evening',
      href: '/venues',
    },
    {
      term: 'The pieces',
      value: 'Rentals',
      note: 'Seating · Tables · Lighting · Décor',
      href: '/catalog',
    },
    {
      term: 'The plan',
      value: 'One planner',
      note: 'One date, one team, one invoice',
      href: '/plan',
    },
  ]

  return (
    <MotionConfig reducedMotion="user">
      <section className="ledger" aria-labelledby="ledger-title">
        <div className="ledger-sheet">
          {/* Top double rule draws open from the center. */}
          <motion.div
            aria-hidden="true"
            className="ledger-rule"
            initial={{ clipPath: 'inset(0 50% 0 50%)' }}
            animate={{ clipPath: 'inset(0 0% 0 0%)' }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.05 }}
          />

          <div className="ledger-head">
            <span>Prime Lux Events</span>
            <span>House ledger</span>
          </div>

          <div className="ledger-body">
            {/* Static text does not move; it is the first thing read and the LCP. */}
            <h1 id="ledger-title" className="ledger-title">
              {TAGLINE}
            </h1>

            <motion.figure
              className="ledger-print"
              initial={{ opacity: 0, y: 18, rotate: -6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, rotate: -2, filter: 'blur(0px)' }}
              transition={{ ...PRINT_SPRING, opacity: { duration: 0.4, ease: EASE_OUT }, filter: { duration: 0.4, ease: EASE_OUT }, delay: 0.15 }}
            >
              <span className="ledger-corner tl" aria-hidden="true" />
              <span className="ledger-corner tr" aria-hidden="true" />
              <span className="ledger-corner bl" aria-hidden="true" />
              <span className="ledger-corner br" aria-hidden="true" />
              <Image
                src="/images/suites/ceremony.jpg"
                alt="A ceremony set beneath a floral arch at a Prime Lux venue"
                width={720}
                height={1280}
                quality={90}
                priority
                sizes="(min-width: 900px) 416px, 80vw"
              />
              <figcaption>Pl. I — The ceremony</figcaption>
            </motion.figure>

            <ul className="ledger-entries">
              {entries.map((entry, i) => (
                <li key={entry.term} className="ledger-entry">
                  <Link href={entry.href} className="ledger-link">
                    <span className="ledger-term">{entry.term}</span>
                    {/* Leader line is entered like ink, one row after another (three rows, one pass). */}
                    <motion.span
                      aria-hidden="true"
                      className="ledger-leader"
                      initial={{ clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.45 + i * 0.12 }}
                    />
                    <span className="ledger-value">
                      {entry.value}
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="ledger-arrow">
                        <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                  <p className="ledger-note">{entry.note}</p>
                </li>
              ))}
            </ul>

            <div className="ledger-actions">
              <Link href="/plan" className="lux-cta">Plan your event</Link>
              <Link href={secondary.href} className="lux-cta-ghost">{secondary.label}</Link>
            </div>
          </div>

          <div className="ledger-foot" aria-hidden="true">
            <span>Received with thanks</span>
            <span className="ledger-seal">PL</span>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
