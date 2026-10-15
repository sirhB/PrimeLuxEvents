'use client'

import Link from 'next/link'
import { BrandLockup } from '@/components/brand/brand-logo'
import { useSuite } from '@/components/suite/use-suite'

/**
 * Taglines considered:
 * - The whole celebration, under one roof. (chosen)
 * - Everything the evening asks for.
 * - From the venue to the last dance.
 * - One house for the room, the table, and the night.
 */
const TAGLINE = 'The whole celebration, under one roof.'

export function SecretDoorHero() {
  const { suite } = useSuite()
  const secondary = suite === 'venue'
    ? { href: '/venues', label: 'View venues' }
    : { href: '/catalog', label: 'View the collection' }

  return (
    <section className="secret-door" aria-label="Prime Lux Events">
      <img
        src="/images/suites/ceremony.jpg"
        alt=""
        className="secret-door-scene"
        fetchPriority="high"
        decoding="async"
      />
      <div className="secret-door-jamb secret-door-jamb-left" aria-hidden="true" />
      <div className="secret-door-jamb secret-door-jamb-right" aria-hidden="true" />
      <div className="secret-door-hinge" aria-hidden="true">
        <div className="secret-door-slab">
          <img src="/images/suites/stone-wall.jpg" alt="" decoding="async" />
          <span className="secret-door-seam" />
        </div>
      </div>
      <div className="secret-door-copy">
        <BrandLockup tone="on-dark" className="text-[1.35rem] sm:text-[1.7rem]" />
        <p className="secret-door-tagline">{TAGLINE}</p>
        <div className="secret-door-actions">
          <Link href="/plan" className="lux-cta">
            Plan your event
          </Link>
          <Link href={secondary.href} className="lux-cta-ghost on-media">
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
