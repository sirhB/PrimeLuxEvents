import type { Metadata } from 'next'
import Link from 'next/link'
import { loadPublicVenues } from '@/lib/venues/load'

export const metadata: Metadata = {
  title: 'Venues',
  description: 'Prime Lux rooms in Shelton for ceremonies, dinners, and celebrations.',
}

export default async function VenuesPage() {
  const venues = await loadPublicVenues()
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <p className="lux-label">Venue suite</p>
      <h1 className="mt-3 max-w-2xl font-serif text-5xl font-medium leading-none md:text-7xl">Rooms with the house behind them.</h1>
      <p className="mt-5 max-w-xl font-light leading-relaxed text-[var(--theme-muted)]">
        Choose a room, then add the rentals, the light, and the people who run the evening. Or start with the plan.
      </p>
      <div className="mt-12 grid gap-12">
        {venues.map((venue) => (
          <Link key={venue.id} href={`/venues/${venue.slug}`} className="grid items-center gap-6 md:grid-cols-12">
            <img src={venue.image} alt="" className="aspect-[4/3] w-full object-cover md:col-span-7" />
            <div className="md:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">
                {venue.neighborhood} · {venue.capacity} guests
              </p>
              <h2 className="mt-2 font-serif text-4xl font-medium">{venue.name}</h2>
              <p className="mt-3 font-light leading-relaxed text-[var(--theme-muted)]">{venue.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
