import type { Metadata } from 'next'
import { PlanPage } from '@/components/plan/plan-page'
import { loadPublicVenues } from '@/lib/venues/load'

export const metadata: Metadata = {
  title: 'Plan your event',
  description: 'Tell Prime Lux the occasion, date, guests, and place, then build your rental cart.',
}

export default async function Plan() {
  const venues = await loadPublicVenues()
  return <PlanPage venues={venues} />
}
