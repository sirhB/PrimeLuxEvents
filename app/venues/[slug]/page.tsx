import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VenueInquiry } from '@/components/venues/venue-inquiry'
import { VenueAvailability } from '@/components/venues/venue-availability'
import { VENUE_LISTINGS } from '@/lib/venues/directory'
import { loadPublicVenues, loadVenue, loadVenueAvailability } from '@/lib/venues/load'

export const revalidate = 60

export function generateStaticParams() {
  return VENUE_LISTINGS.map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const venue = await loadVenue(slug)
  return { title: venue?.name || 'Venue', description: venue?.description }
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [venue, venues] = await Promise.all([loadVenue(slug), loadPublicVenues()])
  if (!venue) notFound()
  const availability = await loadVenueAvailability(venue.id)
  const gallery = venue.gallery?.length ? venue.gallery : [venue.image]

  return (
    <article className="pb-24">
      <nav aria-label="Venues" className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-5 py-3 text-[11px] uppercase tracking-[0.2em] md:px-8">
        <Link href="/venues" className="shrink-0 text-[var(--theme-muted)] hover:text-[var(--theme-dark)]">All venues</Link>
        {venues.map((v) => (
          <Link key={v.id} href={`/venues/${v.slug}`} aria-current={v.slug === venue.slug ? 'page' : undefined}
            className={v.slug === venue.slug ? 'shrink-0 text-[var(--theme-dark)]' : 'shrink-0 text-[var(--theme-muted)] hover:text-[var(--theme-dark)]'}>
            {v.name}
          </Link>
        ))}
      </nav>

      <div className="relative h-[56svh] min-h-[340px] md:h-[68svh]">
        <img src={gallery[0]} alt={`${venue.name}`} className="h-full w-full object-cover" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-10 md:grid-cols-12 md:px-8 md:py-14">
        <div className="md:col-span-7">
          <p className="lux-label">{venue.neighborhood}, {venue.city}</p>
          <h1 className="mt-3 font-serif text-5xl font-medium md:text-6xl">{venue.name}</h1>
          {venue.tagline && <p className="mt-2 font-serif text-2xl italic text-[var(--theme-muted)]">{venue.tagline}</p>}
          <p className="mt-5 max-w-xl font-light leading-relaxed text-[var(--theme-muted)]">{venue.description}</p>

          <section aria-labelledby="venue-capacity" className="mt-10">
            <h2 id="venue-capacity" className="lux-label">Capacity &amp; details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-px bg-[var(--theme-dark)]/10 sm:grid-cols-4">
              <div className="bg-[var(--suite-paper)] p-4">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">Up to</dt>
                <dd className="mt-1 font-serif text-3xl">{venue.capacity}</dd>
              </div>
              {(venue.details || []).slice(0, 3).map((d) => (
                <div key={d.label} className="bg-[var(--suite-paper)] p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">{d.label}</dt>
                  <dd className="mt-1 font-serif text-2xl">{d.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 flex flex-wrap gap-2">
              {venue.amenities.map((item) => (
                <li key={item} className="border border-[var(--theme-dark)]/15 px-3 py-2 text-[11px] uppercase tracking-[0.16em]">{item}</li>
              ))}
            </ul>
            {venue.bestFor?.length ? (
              <p className="mt-6 text-sm font-light text-[var(--theme-muted)]">Best for {venue.bestFor.join(', ').toLowerCase()}.</p>
            ) : null}
          </section>

          {gallery.length > 1 && (
            <section aria-labelledby="venue-photos" className="mt-12">
              <h2 id="venue-photos" className="lux-label">Photographs</h2>
              <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-2 md:px-0">
                {gallery.slice(1).map((src) => (
                  <img key={src} src={src} alt={`${venue.name} setting`} loading="lazy" className="aspect-[4/5] w-[78%] shrink-0 snap-start object-cover md:w-full" />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="venue-availability" className="mt-12">
            <h2 id="venue-availability" className="lux-label">Availability · next six weeks</h2>
            <VenueAvailability days={availability} />
          </section>
        </div>

        <div className="md:col-span-5">
          <div className="md:sticky md:top-24">
            <VenueInquiry venue={venue} />
            <Link href="/catalog" className="mt-8 inline-block text-[11px] uppercase tracking-[0.2em] underline underline-offset-4">
              Browse rentals for this room
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
