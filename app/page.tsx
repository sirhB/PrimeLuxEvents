import { CinematicHero } from '@/components/home/cinematic-hero'
import { RentalRail } from '@/components/home/rental-rail'
import { HowItWorks } from '@/components/home/how-it-works'
import { VenueSpotlight } from '@/components/home/venue-spotlight'
import { GalleryMasonry } from '@/components/home/gallery-masonry'
import { Proof } from '@/components/home/proof'
import { ReserveBand } from '@/components/home/reserve-band'
import { loadPublicVenues } from '@/lib/venues/load'
import { RAIL_GROUPS, loadHomeData } from '@/lib/home/load-home'

export const revalidate = 60

export default async function Home() {
  const venues = await loadPublicVenues()
  const { products, stats } = await loadHomeData(venues.length)
  const groups = RAIL_GROUPS.map(({ id, label }) => ({ id, label }))

  return (
    <div className="home-v2 flex flex-col">
      <CinematicHero />
      <RentalRail products={products} groups={groups} />
      <HowItWorks />
      <VenueSpotlight venues={venues} />
      <GalleryMasonry />
      <Proof
        stats={[
          { label: 'Rental pieces in the catalog', value: stats.products },
          { label: 'Rental categories', value: stats.categories },
          { label: 'Venues in the house', value: stats.venues },
        ]}
      />
      <ReserveBand />
    </div>
  )
}
