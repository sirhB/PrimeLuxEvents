import type { Metadata } from 'next'
import { PlanFlow } from '@/components/plan/plan-flow'
import { loadPublicVenues } from '@/lib/venues/load'

export const metadata: Metadata = {
  title: 'Plan your event',
  description: 'Tell Prime Lux the occasion, date, guests, venue, services, rentals, and budget.',
}

export default async function PlanPage() {
  const venues = await loadPublicVenues()
  return <PlanFlow venues={venues} />
}
