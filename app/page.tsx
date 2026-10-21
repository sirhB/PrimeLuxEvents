import { HouseLedgerHero } from '@/components/home/house-ledger-hero'
import { HomeChapters } from '@/components/home/home-chapters'
import { loadPublicVenues } from '@/lib/venues/load'

export const revalidate = 60

export default async function Home() {
  const venues = await loadPublicVenues()

  return (
    <div className="flex flex-col">
      <HouseLedgerHero venues={venues} />
      <HomeChapters venues={venues} />
    </div>
  )
}
