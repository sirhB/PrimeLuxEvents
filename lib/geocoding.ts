/**
 * Geocoding and distance calculation utilities
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface Coordinates {
    lat: number
    lon: number
}

export interface GeocodingResult {
    lat: string
    lon: string
    display_name: string
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * Free API, no key required, but please respect usage policy
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
        const encodedAddress = encodeURIComponent(address)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'PrimeLuxEvents/1.0', // Required by Nominatim usage policy
                },
            }
        )

        if (!response.ok) {
            console.error('Geocoding failed:', response.statusText)
            return null
        }

        const data: GeocodingResult[] = await response.json()

        if (data.length === 0) {
            console.error('No results found for address:', address)
            return null
        }

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
        }
    } catch (error) {
        console.error('Error geocoding address:', error)
        return null
    }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 3959 // Earth's radius in miles
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lon - coord1.lon)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
}

/**
 * Calculate distance between two addresses
 * Returns distance in miles, or null if geocoding fails
 */
export async function getDistanceBetweenAddresses(
    address1: string,
    address2: string
): Promise<number | null> {
    const coord1 = await geocodeAddress(address1)
    const coord2 = await geocodeAddress(address2)

    if (!coord1 || !coord2) {
        return null
    }

    return calculateDistance(coord1, coord2)
}
