import type { Metadata } from 'next'
import Link from 'next/link'
import { loadPublicVenues } from '@/lib/venues/load'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Venues',
  description: 'The Conservatory, The Gallery, and The Garden Court — Prime Lux rooms in Shelton, Connecticut.',
}

export default async function VenuesPage() {
  const venues = await loadPublicVenues()
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-8 md:pt-24">
      <nav aria-label="Venues" className="-mx-5 mb-10 flex gap-6 overflow-x-auto border-b border-[var(--theme-dark)]/10 px-5 pb-3 text-[11px] uppercase tracking-[0.2em] md:mx-0 md:px-0">
        <span className="shrink-0 text-[var(--theme-dark)]">All venues</span>
        {venues.map((v) => (
          <Link key={v.id} href={`/venues/${v.slug}`} className="shrink-0 text-[var(--theme-muted)] hover:text-[var(--theme-dark)]">{v.name}</Link>
        ))}
      </nav>
      <p className="lux-label">Venues</p>
      <h1 className="mt-3 max-w-2xl font-serif text-5xl font-medium leading-none md:text-7xl">Three rooms. One house.</h1>
      <p className="mt-5 max-w-xl font-light leading-relaxed text-[var(--theme-muted)]">
        Every room comes with the Prime Lux collection behind it. Choose a room, then the pieces.
      </p>
      <div className="mt-12 grid gap-14">
        {venues.map((venue, i) => (
          <Link key={venue.id} href={`/venues/${venue.slug}`} className="group grid items-center gap-6 md:grid-cols-12">
            <div className={`aspect-[4/3] overflow-hidden bg-[var(--theme-surface)] md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
              <img src={venue.image} alt={`${venue.name} at Prime Lux`} className="h-full w-full object-cover" loading={i ? 'lazy' : 'eager'} />
            </div>
            <div className="md:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">
                {venue.neighborhood} · Up to {venue.capacity} guests
              </p>
              <h2 className="mt-2 font-serif text-4xl font-medium">{venue.name}</h2>
              {venue.tagline && <p className="mt-1 font-serif text-xl italic text-[var(--theme-muted)]">{venue.tagline}</p>}
              <p className="mt-3 font-light leading-relaxed text-[var(--theme-muted)]">{venue.description}</p>
              <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.2em] underline underline-offset-4">See the room</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
