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
    tagline: 'Glass overhead, stone underfoot.',
    gallery: ['/images/suites/venue-conservatory.jpg', '/images/suites/ceremony.jpg', '/images/luxury_event_setup_celebration_1767781442112.png'],
    details: [
      { label: 'Seated dinner', value: '140' },
      { label: 'Ceremony', value: '180' },
      { label: 'Cocktail', value: '180' },
      { label: 'Light', value: 'Daylight, glass roof' },
    ],
    bestFor: ['Ceremonies', 'Long-table dinners', 'Daytime receptions'],
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
    tagline: 'White walls, one chandelier.',
    gallery: ['/images/suites/venue-gallery.jpg', '/images/luxury_furniture_collection_1767781427931.png', '/images/gallery-hero.png'],
    details: [
      { label: 'Seated dinner', value: '70' },
      { label: 'Cocktail', value: '90' },
      { label: 'Ceiling', value: 'Double height' },
      { label: 'Light', value: 'Fully dimmable' },
    ],
    bestFor: ['Private dinners', 'Launches', 'Showers'],
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
    tagline: 'A courtyard with a loggia for later.',
    gallery: ['/images/suites/venue-garden.jpg', '/images/luxury-event-hero.png', '/images/suites/ceremony.jpg'],
    details: [
      { label: 'Seated dinner', value: '110' },
      { label: 'Ceremony', value: '140' },
      { label: 'Cocktail', value: '140' },
      { label: 'Weather plan', value: 'Covered loggia' },
    ],
    bestFor: ['Garden ceremonies', 'Summer evenings', 'Rehearsal dinners'],
  },
]

export function venueBySlug(slug: string) {
  return VENUE_LISTINGS.find((venue) => venue.slug === slug) ?? null
}

export function venueDefaults(slug: string) {
  return venueBySlug(slug)
}
