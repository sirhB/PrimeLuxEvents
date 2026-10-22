'use client'

import Link from 'next/link'
import { MotionConfig, motion } from 'framer-motion'
import type { VenueListing } from '@/lib/venues/directory'

/** Secondary to rentals: one quiet rail. The image settles from 1.06→1 once on reveal. */
export function VenueSpotlight({ venues }: { venues: VenueListing[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="vs" aria-labelledby="vs-title">
        <div className="vs-head">
          <div>
            <p className="lux-label">Venue spotlight</p>
            <h2 id="vs-title" className="vs-title">And a room to put it in.</h2>
          </div>
          <Link href="/venues" className="vs-all">All venues</Link>
        </div>
        <ul className="vs-track">
          {venues.map((v) => (
            <li key={v.id} className="vs-item">
              <Link href={`/venues/${v.slug}`} className="vs-card">
                <span className="vs-img">
                  <motion.img
                    src={v.image}
                    alt={`${v.name} at Prime Lux`}
                    loading="lazy"
                    initial={{ scale: 1.06 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="vs-meta">Up to {v.capacity} guests</span>
                <span className="vs-name">{v.name}</span>
                <span className="vs-line">{v.tagline || v.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </MotionConfig>
  )
}
