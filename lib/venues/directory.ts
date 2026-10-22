export type VenueListing = {
  id: string
  slug: string
  name: string
  neighborhood: string
  city: string
  capacity: number
  description: string
  image: string
  amenities: string[]
  /** Optional page content; falls back to the defaults below when the DB row has none. */
  gallery?: string[]
  tagline?: string
  details?: Array<{ label: string; value: string }>
  bestFor?: string[]
  address?: string
}

/** Prime Lux has one hall. Address confirmed by the owner (Devyn, Oct 2026). */
export const PAVILION_ADDRESS = '2 Research Dr, Shelton, CT 06484'
export const PAVILION_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Prime Lux Pavilion, 2 Research Dr, Shelton, CT 06484')

export const PAVILION_ID = '44444444-4444-4444-8444-444444444444'
export const PAVILION_SLUG = 'prime-lux-pavilion'
/** Old placeholder rooms; their slugs redirect and their ids map to the Pavilion. */
export const RETIRED_VENUE_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
]

export const VENUE_LISTINGS: VenueListing[] = [
  {
    id: PAVILION_ID,
    slug: PAVILION_SLUG,
    name: 'Prime Lux Pavilion',
    neighborhood: 'Shelton',
    city: 'Connecticut',
    capacity: 344, // from public listing, pending owner confirmation
    description:
      'One big, open hall that we set up fresh for every party. You bring the theme and the guest list. We dress the room with our own rentals, down to the backdrop and the balloons. Birthdays, showers, christenings and weddings have all happened here, and the room looks different every time.',
    image: '/images/venue/pavilion-hall.jpg',
    amenities: [],
    tagline: 'One open hall, set up your way.',
    gallery: ['/images/venue/pavilion-hall.jpg'],
    details: [
      { label: 'Hall', value: '5,000 sq ft' }, // from public listing, pending owner confirmation
      { label: 'Renovated', value: '2024' }, // from public listing, pending owner confirmation
    ],
    bestFor: ['Birthdays', 'Showers', 'Weddings'],
    address: PAVILION_ADDRESS,
  },
]

export function venueBySlug(slug: string) {
  return VENUE_LISTINGS.find((venue) => venue.slug === slug) ?? null
}

export function venueDefaults(slug: string) {
  return venueBySlug(slug)
}

/** Old room ids resolve to the Pavilion. */
export function resolveVenueId(id: string | null | undefined) {
  if (!id) return id ?? null
  return RETIRED_VENUE_IDS.includes(id) ? PAVILION_ID : id
}
