'use client'

import Link from 'next/link'
import { MotionConfig, motion, useReducedMotion } from 'framer-motion'

// Real Prime Lux photographs already in the repo.
const SHOTS = [
  { src: '/images/suites/ceremony.jpg', alt: 'Ceremony aisle with white seating and florals', h: 'tall' },
  { src: '/images/luxury_event_setup_celebration_1767781442112.png', alt: 'Reception under chandeliers', h: 'wide' },
  { src: '/images/suites/venue-gallery.jpg', alt: 'A dinner table set with rentals', h: 'sq' },
  { src: '/images/luxury_furniture_collection_1767781427931.png', alt: 'Lounge furniture collection', h: 'tall' },
  { src: '/images/suites/venue-garden.jpg', alt: 'An evening party setup', h: 'sq' },
  { src: '/images/suites/venue-conservatory.jpg', alt: 'Long tables set for dinner', h: 'wide' },
]

/** Scroll-driven clip-path reveal, once per image. Reduced motion: images simply appear. */
export function GalleryMasonry() {
  const reduce = useReducedMotion()
  return (
    <MotionConfig reducedMotion="user">
      <section className="gm" aria-labelledby="gm-title">
        <div className="gm-head">
          <p className="lux-label">From the gallery</p>
          <h2 id="gm-title" className="gm-title">Rooms we have dressed.</h2>
        </div>
        <ul className="gm-grid">
          {SHOTS.map((s) => (
            <motion.li
              key={s.src}
              className={`gm-item gm-${s.h}`}
              initial={reduce ? false : { clipPath: 'inset(12% 0 12% 0)', opacity: 0.4 }}
              whileInView={{ clipPath: 'inset(0% 0 0% 0)', opacity: 1 }}
              viewport={{ once: true, margin: '-12% 0px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={s.src} alt={s.alt} loading="lazy" />
              <Link href="/catalog" className="gm-rent">Rent this look</Link>
            </motion.li>
          ))}
        </ul>
        <Link href="/gallery" className="lux-cta-ghost gm-more">Full gallery</Link>
      </section>
    </MotionConfig>
  )
}
