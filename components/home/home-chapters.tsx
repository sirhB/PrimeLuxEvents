'use client'

import Link from 'next/link'
import { useSuite } from '@/components/suite/use-suite'
import type { VenueListing } from '@/lib/venues/directory'

const RENTALS = [
  { title: 'Seating', line: 'Thrones, lounges, and the chairs people remember.' },
  { title: 'Tables', line: 'Long boards, rounds, and the linen that finishes them.' },
  { title: 'Lighting', line: 'Chandeliers, pin spots, and the glow after dusk.' },
  { title: 'Décor', line: 'Arches, bars, and the objects that set the room.' },
]

export function HomeChapters({ venues }: { venues: VenueListing[] }) {
  const { suite } = useSuite()
  const venueFirst = suite === 'venue'

  const venueBlock = (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24" aria-labelledby="home-venues">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
                    <h2 id="home-venues" className="font-serif text-4xl font-medium leading-none md:text-6xl">
            Three rooms. One house.
          </h2>
        </div>
        <Link href="/venues" className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--theme-muted)] sm:inline">
          All venues
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {venues.map((venue) => (
          <Link key={venue.id} href={`/venues/${venue.slug}`} className="group block">
            <div className="aspect-[4/3] overflow-hidden bg-[var(--theme-surface)]">
              <img
                src={venue.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:scale-[1.02]"
              />
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">
              {venue.neighborhood} · {venue.capacity} guests
            </p>
            <h3 className="mt-1 font-serif text-3xl font-medium">{venue.name}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-[var(--theme-muted)]">{venue.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )

  const rentalBlock = (
    <section className="border-y border-[var(--theme-dark)]/10 bg-white/40" aria-labelledby="home-rentals">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
                <h2 id="home-rentals" className="mt-3 max-w-xl font-serif text-4xl font-medium leading-none md:text-6xl">
          Whatever the room still needs.
        </h2>
        <div className="mt-10 grid gap-px bg-[var(--theme-dark)]/10 sm:grid-cols-2 lg:grid-cols-4">
          {RENTALS.map((item) => (
            <Link key={item.title} href="/catalog" className="bg-[var(--suite-paper)] p-6 transition-colors duration-200 hover:bg-white">
              <h3 className="font-serif text-3xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-[var(--theme-muted)]">{item.line}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  return (
    <>
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <h2 className="font-serif text-4xl font-medium leading-[1.05] md:text-5xl">
          Prime Lux holds the celebration in one place.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)]">
          The room, the furniture, the light, the florals, the staff, and the last glass. Tell us the date. We bring the rest.
        </p>
      </section>
      {venueFirst ? venueBlock : rentalBlock}
      {venueFirst ? rentalBlock : venueBlock}
      <section className="bg-[var(--theme-dark)] text-[var(--theme-on-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div>
            <h2 className="font-serif text-4xl font-medium md:text-5xl">A few questions. Then we begin.</h2>
          </div>
          <Link href="/plan" className="lux-cta !bg-[var(--theme-accent)] !text-[var(--theme-on-accent)]">
            Start the plan
          </Link>
        </div>
      </section>
    </>
  )
}
