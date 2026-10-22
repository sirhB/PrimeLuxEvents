'use client'

import Link from 'next/link'
import { MotionConfig, motion } from 'framer-motion'
import type { VenueListing } from '@/lib/venues/directory'

/**
 * One feature block for the Pavilion. The image settles from 1.08 to 1 once on
 * reveal and the text rises in after it. MotionConfig honours reduced motion.
 */
export function VenueSpotlight({ venues }: { venues: VenueListing[] }) {
  const v = venues[0]
  if (!v) return null
  const ease = [0.22, 1, 0.36, 1] as const
  return (
    <MotionConfig reducedMotion="user">
      <section className="vs" aria-labelledby="vs-title">
        <div className="vs-head">
          <div>
            <p className="lux-label">Our hall</p>
            <h2 id="vs-title" className="vs-title">And a room to put it in.</h2>
          </div>
        </div>
        <Link href={`/venues/${v.slug}`} className="grid items-center gap-8 md:grid-cols-12">
          <span className="block aspect-[4/3] overflow-hidden md:col-span-7">
            <motion.img
              src={v.image}
              alt={`${v.name} set for a party`}
              loading="lazy"
              className="h-full w-full object-cover"
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.2, ease }}
            />
          </span>
          <motion.span
            className="block md:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            <span className="vs-meta block">Up to {v.capacity} guests</span>
            <span className="vs-name block">{v.name}</span>
            <span className="vs-line block">{v.tagline}</span>
            <span className="mt-3 block font-light leading-relaxed">{v.description}</span>
            <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.2em] underline underline-offset-4">See the hall</span>
          </motion.span>
        </Link>
      </section>
    </MotionConfig>
  )
}
