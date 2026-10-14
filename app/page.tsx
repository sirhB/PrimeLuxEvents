import { SecretDoorHero } from '@/components/home/secret-door-hero'
import { HomeChapters } from '@/components/home/home-chapters'
import { loadPublicVenues } from '@/lib/venues/load'

export const revalidate = 60

export default async function Home() {
  const venues = await loadPublicVenues()

  return (
    <div className="flex flex-col">
      <SecretDoorHero />
      <HomeChapters venues={venues} />
    </div>
  )
}
