import { VENUE_LISTINGS, type VenueListing } from '@/lib/venues/directory'
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
  return {
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
