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
    capacity: /* pending owner confirmation */ 180,
    description:
      'The roof is glass, so the room changes with the sky. Morning light comes in soft and even, and by late afternoon it turns gold across the stone floor. You can say your vows at one end and sit down to dinner at a long table at the other, and nobody has to move rooms.',
    image: '/images/suites/venue-conservatory.jpg',
    amenities: ['Ceremony lawn approach', 'In-house power', 'Bridal room', 'Street parking'],
    tagline: 'A glass roof, a stone floor, and plenty of daylight.',
    gallery: ['/images/suites/venue-conservatory.jpg', '/images/suites/ceremony.jpg', '/images/luxury_event_setup_celebration_1767781442112.png'],
    details: [
      { label: 'Seated dinner', value: '140' }, // pending owner confirmation
      { label: 'Ceremony', value: '180' }, // pending owner confirmation
      { label: 'Cocktail', value: '180' }, // pending owner confirmation
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
    capacity: /* pending owner confirmation */ 90,
    description:
      'Tall white walls, a double-height ceiling, and a single chandelier in the middle. The lights dim all the way down, so a dinner can start bright and end by candlelight. It suits a smaller crowd that wants room to talk.',
    image: '/images/suites/venue-gallery.jpg',
    amenities: ['Dimmer lighting', 'Gallery walls', 'Service entrance', 'Coat room'],
    tagline: 'A quiet white room for smaller nights.',
    gallery: ['/images/suites/venue-gallery.jpg', '/images/luxury_furniture_collection_1767781427931.png', '/images/gallery-hero.png'],
    details: [
      { label: 'Seated dinner', value: '70' }, // pending owner confirmation
      { label: 'Cocktail', value: '90' }, // pending owner confirmation
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
    capacity: /* pending owner confirmation */ 140,
    description:
      'An open courtyard with a stone terrace off to one side. On a warm night people tend to stay out until the light goes. If it rains, or the air turns cool, everyone steps under the covered loggia and the party keeps going.',
    image: '/images/suites/venue-garden.jpg',
    amenities: ['Terrace', 'Loggia', 'Twilight lighting', 'Guest parking'],
    tagline: 'Outside for as long as the weather lets you.',
    gallery: ['/images/suites/venue-garden.jpg', '/images/luxury-event-hero.png', '/images/suites/ceremony.jpg'],
    details: [
      { label: 'Seated dinner', value: '110' }, // pending owner confirmation
      { label: 'Ceremony', value: '140' }, // pending owner confirmation
      { label: 'Cocktail', value: '140' }, // pending owner confirmation
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
