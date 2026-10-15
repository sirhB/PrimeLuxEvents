import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VenueInquiry } from '@/components/venues/venue-inquiry'
import { loadVenue } from '@/lib/venues/load'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const venue = await loadVenue(slug)
  return { title: venue?.name || 'Venue' }
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const venue = await loadVenue(slug)
  if (!venue) notFound()

  return (
    <article className="pb-24">
      <div className="relative h-[68svh] min-h-[420px]">
        <img src={venue.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <p className="lux-label">{venue.neighborhood}, {venue.city}</p>
          <h1 className="mt-3 font-serif text-5xl font-medium md:text-6xl">{venue.name}</h1>
          <p className="mt-5 max-w-xl font-light leading-relaxed text-[var(--theme-muted)]">{venue.description}</p>
          <p className="mt-6 text-sm uppercase tracking-[0.18em]">Up to {venue.capacity} guests</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {venue.amenities.map((item) => (
              <li key={item} className="border border-[var(--theme-dark)]/15 px-3 py-2 text-[11px] uppercase tracking-[0.16em]">
                {item}
              </li>
            ))}
          </ul>
          <Link href="/plan" className="mt-8 inline-block text-[11px] uppercase tracking-[0.2em] underline">
            Or plan the whole event
          </Link>
        </div>
        <div className="md:col-span-5">
          <VenueInquiry venue={venue} />
        </div>
      </div>
    </article>
  )
}
