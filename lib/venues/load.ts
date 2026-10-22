import { VENUE_LISTINGS, venueBySlug, type VenueListing } from '@/lib/venues/directory'
import { createClient } from '@/lib/supabase/server'

type VenueRow = {
  id: string
  slug: string
  name: string
  neighborhood: string | null
  city: string | null
  capacity: number | null
  description: string | null
  image_url: string | null
  amenities: string[] | null
  published: boolean | null
}

function fromRow(row: VenueRow): VenueListing {
  const base = venueBySlug(row.slug)
  return {
    gallery: base?.gallery,
    tagline: base?.tagline,
    details: base?.details,
    bestFor: base?.bestFor,
    id: row.id,
    slug: row.slug,
    name: row.name,
    neighborhood: row.neighborhood || 'Shelton',
    city: row.city || 'Connecticut',
    capacity: row.capacity || 100,
    description: row.description || '',
    image: row.image_url || '/images/suites/venue-gallery.jpg',
    amenities: row.amenities || [],
  }
}

export async function loadPublicVenues(): Promise<VenueListing[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('venues')
      .select('id, slug, name, neighborhood, city, capacity, description, image_url, amenities, published')
      .eq('published', true)
      .order('name')
    if (error || !data?.length) return VENUE_LISTINGS
    return (data as VenueRow[]).map(fromRow)
  } catch {
    return VENUE_LISTINGS
  }
}

export async function loadVenue(slug: string): Promise<VenueListing | null> {
  const venues = await loadPublicVenues()
  return venues.find((venue) => venue.slug === slug) ?? null
}

export type DayStatus = { day: string; status: 'open' | 'held' | 'booked' }

/** Next `days` days for a venue. Missing rows are open; bookings/holds come from the venue CRM. */
export async function loadVenueAvailability(venueId: string, days = 42): Promise<DayStatus[]> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const list: DayStatus[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return { day: d.toISOString().slice(0, 10), status: 'open' as const }
  })
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('venue_availability')
      .select('day, status')
      .eq('venue_id', venueId)
      .gte('day', list[0].day)
      .lte('day', list[list.length - 1].day)
    const map = new Map((data || []).map((row) => [row.day as string, String(row.status)]))
    return list.map((d) => {
      const s = map.get(d.day)
      return s === 'booked' || s === 'blocked' ? { ...d, status: 'booked' } : s === 'held' || s === 'hold' ? { ...d, status: 'held' } : d
    })
  } catch {
    return list
  }
}
