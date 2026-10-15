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
}

export const VENUE_LISTINGS: VenueListing[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'the-conservatory',
    name: 'The Conservatory',
    neighborhood: 'Shelton',
    city: 'Connecticut',
    capacity: 180,
    description:
      'A glass-roofed room with pale stone underfoot. Daylight does most of the decorating. It holds a ceremony, a long table, or both.',
    image: '/images/suites/venue-conservatory.jpg',
    amenities: ['Ceremony lawn approach', 'In-house power', 'Bridal room', 'Street parking'],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'the-gallery',
    name: 'The Gallery',
    neighborhood: 'Shelton',
    city: 'Connecticut',
    capacity: 90,
    description:
      'Tall white walls and one chandelier. Built for dinners, launches, and evenings that should feel edited rather than filled.',
    image: '/images/suites/venue-gallery.jpg',
    amenities: ['Dimmer lighting', 'Gallery walls', 'Service entrance', 'Coat room'],
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'the-garden-court',
    name: 'The Garden Court',
    neighborhood: 'Shelton',
    city: 'Connecticut',
    capacity: 140,
    description:
      'A clipped courtyard and a stone terrace. Evenings stay outside as long as the weather agrees, then move under the covered loggia.',
    image: '/images/suites/venue-garden.jpg',
    amenities: ['Terrace', 'Loggia', 'Twilight lighting', 'Guest parking'],
  },
]

export function venueBySlug(slug: string) {
  return VENUE_LISTINGS.find((venue) => venue.slug === slug) ?? null
}
