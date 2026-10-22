'use client'

import Link from 'next/link'
import { MotionConfig, motion } from 'framer-motion'
import { useCart } from '@/components/providers/cart-provider'
import type { VenueListing } from '@/lib/venues/directory'

export type HomeCategory = { id: string; name: string; slug: string; description: string | null }

const FALLBACK_RENTALS = [
  { title: 'Seating', line: 'Thrones, lounges, and the chairs people remember.' },
  { title: 'Tables', line: 'Long boards, rounds, and the linen that finishes them.' },
  { title: 'Lighting', line: 'Chandeliers, pin spots, and the glow after dusk.' },
  { title: 'Décor', line: 'Arches, bars, and the objects that set the room.' },
]

// Jakub: one soft reveal per section as it enters, once. No staggered card cascades.
const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
}

export function HomeChapters({ venues, categories }: { venues: VenueListing[]; categories: HomeCategory[] }) {
  const { openPlan, hasLead } = useCart()
  const rentals = categories.length
    ? categories.slice(0, 8).map((c) => ({ title: c.name, line: c.description || 'Browse the pieces.', href: `/catalog/${c.slug}` }))
    : FALLBACK_RENTALS.map((r) => ({ ...r, href: '/catalog' }))

  return (
    <MotionConfig reducedMotion="user">
      <section className="border-y border-[var(--theme-dark)]/10 bg-white/40" aria-labelledby="home-rentals">
        <motion.div {...reveal} className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="lux-label">The collection</p>
          <div className="mt-3 flex items-end justify-between gap-6">
            <h2 id="home-rentals" className="max-w-xl font-serif text-4xl font-medium leading-none md:text-6xl">
              Everything the room still needs.
            </h2>
            <Link href="/catalog" className="hidden shrink-0 text-[11px] uppercase tracking-[0.22em] text-[var(--theme-muted)] sm:inline">
              All rentals
            </Link>
          </div>
          <div className="mt-10 grid gap-px bg-[var(--theme-dark)]/10 sm:grid-cols-2 lg:grid-cols-4">
            {rentals.map((item) => (
              <Link key={item.title} href={item.href} className="bg-[var(--suite-paper)] p-6 transition-colors duration-200 hover:bg-white">
                <h3 className="font-serif text-3xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-[var(--theme-muted)]">{item.line}</p>
              </Link>
            ))}
          </div>
          <Link href="/catalog" className="lux-cta-ghost mt-8 w-full sm:hidden">All rentals</Link>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24" aria-labelledby="home-packages">
        <motion.div {...reveal} className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="lux-label">Packages</p>
            <h2 id="home-packages" className="mt-3 font-serif text-4xl font-medium leading-none md:text-6xl">
              Sets already composed.
            </h2>
            <p className="mt-5 max-w-xl font-light leading-relaxed text-[var(--theme-muted)]">
              Ceremony, lounge, and reception collections chosen to sit together, priced as one.
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link href="/packages" className="lux-cta">See packages</Link>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-[var(--theme-dark)]/10" aria-labelledby="home-venues">
        <motion.div {...reveal} className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="lux-label">Venues</p>
              <h2 id="home-venues" className="mt-3 font-serif text-4xl font-medium leading-none md:text-6xl">
                And a room to put it in.
              </h2>
            </div>
            <Link href="/venues" className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--theme-muted)] sm:inline">
              All venues
            </Link>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
            {venues.map((venue) => (
              <Link key={venue.id} href={`/venues/${venue.slug}`} className="block w-[78%] shrink-0 snap-start md:w-auto">
                <div className="aspect-[4/3] overflow-hidden bg-[var(--theme-surface)]">
                  <img src={venue.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">
                  {venue.neighborhood} · Up to {venue.capacity} guests
                </p>
                <h3 className="mt-1 font-serif text-3xl font-medium">{venue.name}</h3>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-[var(--theme-dark)] text-[var(--theme-on-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <h2 className="font-serif text-4xl font-medium md:text-5xl">A few questions. Then the cart is yours.</h2>
          <button type="button" onClick={() => openPlan()} className="lux-cta !bg-[var(--theme-accent)] !text-[var(--theme-on-accent)]">
            {hasLead ? 'Your event details' : 'Plan your event'}
          </button>
        </div>
      </section>
    </MotionConfig>
  )
}
