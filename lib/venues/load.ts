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
    address: base?.address,
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
    image: row.image_url || base?.image || '/images/venue/pavilion-hall.jpg',
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
    // Only venues that exist in the directory (the Pavilion). Retired placeholder rooms are ignored.
    const rows = ((data || []) as VenueRow[]).filter((row) => venueBySlug(row.slug))
    if (error || !rows.length) return VENUE_LISTINGS
    return rows.map(fromRow)
  } catch {
    return VENUE_LISTINGS
  }
}

export async function loadVenue(slug: string): Promise<VenueListing | null> {
  const venues = await loadPublicVenues()
  return venues.find((venue) => venue.slug === slug) ?? null
}

export type DayStatus = { day: string; status: 'open' | 'held' | 'booked' }

/** Overlay RPC rows on the open grid. Unknown statuses stay open. */
export function mergeDayStatus(list: DayStatus[], rows: Array<{ day: string; status: string }>): DayStatus[] {
  const map = new Map(rows.map((row) => [String(row.day).slice(0, 10), String(row.status)]))
  return list.map((d) => {
    const s = map.get(d.day)
    return s === 'booked' ? { ...d, status: 'booked' } : s === 'held' ? { ...d, status: 'held' } : d
  })
}

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
    // Status-only RPC: combines staff blocks with CRM holds/bookings; never returns lead data.
    const { data, error } = await supabase.rpc('venue_day_status', {
      p_venue_id: venueId,
      p_from: list[0].day,
      p_to: list[list.length - 1].day,
    })
    if (error) return list
    return mergeDayStatus(list, (data || []) as Array<{ day: string; status: string }>)
  } catch {
    return list
  }
}
