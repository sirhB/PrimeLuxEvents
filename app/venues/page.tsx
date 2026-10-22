import { permanentRedirect } from 'next/navigation'
import { PAVILION_SLUG } from '@/lib/venues/directory'

/** Prime Lux has one hall, so /venues goes straight to it. */
export default function VenuesPage() {
  permanentRedirect(`/venues/${PAVILION_SLUG}`)
}
