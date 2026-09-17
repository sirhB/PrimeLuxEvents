/**
 * Delivery route optimization: Google Distance Matrix when keyed,
 * otherwise deterministic nearest-neighbor (haversine) / delivery-time fallback.
 */

import { COMPANY } from '@/lib/company'
import { calculateDistance, type Coordinates } from '@/lib/geocoding'

export type OptimizeStopInput = {
  id: string
  lat?: number | null
  lng?: number | null
  address?: string | null
  delivery_time?: string | null
}

export type OptimizeOrigin = {
  lat: number
  lng: number
  address?: string
}

export type OptimizeMethod =
  | 'google_distance_matrix'
  | 'nearest_neighbor'
  | 'delivery_time'

export type OptimizeRouteResult = {
  orderedIds: string[]
  method: OptimizeMethod
  totalDistanceMiles: number | null
  /** Parallel to orderedIds — 1-based stop index after optimization */
  routeOrder: number[]
}

/** Shelton warehouse — approximate coordinates for offline nearest-neighbor. */
export const DEFAULT_WAREHOUSE_ORIGIN: OptimizeOrigin = {
  lat: 41.3048,
  lng: -73.1101,
  address: COMPANY.warehouseAddress,
}

function hasCoords(stop: OptimizeStopInput): stop is OptimizeStopInput & { lat: number; lng: number } {
  return (
    typeof stop.lat === 'number' &&
    Number.isFinite(stop.lat) &&
    typeof stop.lng === 'number' &&
    Number.isFinite(stop.lng)
  )
}

function toCoords(stop: OptimizeStopInput & { lat: number; lng: number }): Coordinates {
  return { lat: stop.lat, lon: stop.lng }
}

/**
 * Deterministic nearest-neighbor from origin through remaining stops.
 * Tie-breaks by stop id for stable ordering.
 */
export function nearestNeighborOrder(
  stops: Array<OptimizeStopInput & { lat: number; lng: number }>,
  origin: OptimizeOrigin,
  distanceFn: (a: Coordinates, b: Coordinates) => number = calculateDistance,
): { orderedIds: string[]; totalDistanceMiles: number } {
  const remaining = [...stops]
  const ordered: string[] = []
  let current: Coordinates = { lat: origin.lat, lon: origin.lng }
  let total = 0

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceFn(current, toCoords(remaining[i]))
      const candidate = remaining[i]
      const best = remaining[bestIdx]
      if (
        d < bestDist ||
        (d === bestDist && candidate.id.localeCompare(best.id) < 0)
      ) {
        bestDist = d
        bestIdx = i
      }
    }
    const next = remaining.splice(bestIdx, 1)[0]
    ordered.push(next.id)
    total += bestDist
    current = toCoords(next)
  }

  return { orderedIds: ordered, totalDistanceMiles: Math.round(total * 10) / 10 }
}

/** Stable sort by delivery_time string, then id. */
export function sortByDeliveryTime(stops: OptimizeStopInput[]): string[] {
  return [...stops]
    .sort((a, b) => {
      const ta = a.delivery_time || ''
      const tb = b.delivery_time || ''
      if (ta && tb && ta !== tb) return ta.localeCompare(tb)
      if (ta && !tb) return -1
      if (!ta && tb) return 1
      return a.id.localeCompare(b.id)
    })
    .map((s) => s.id)
}

type MatrixCell = number

async function fetchGoogleDistanceMatrixMeters(
  origin: OptimizeOrigin,
  stops: Array<OptimizeStopInput & { lat: number; lng: number }>,
  apiKey: string,
): Promise<MatrixCell[][] | null> {
  // Origins = warehouse + each stop (for successive NN); Destinations = each stop
  // Simpler: build full (n+1) x (n+1) matrix with origin as index 0
  const points: Array<{ lat: number; lng: number }> = [
    { lat: origin.lat, lng: origin.lng },
    ...stops.map((s) => ({ lat: s.lat, lng: s.lng })),
  ]

  const locParam = points.map((p) => `${p.lat},${p.lng}`).join('|')
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', locParam)
  url.searchParams.set('destinations', locParam)
  url.searchParams.set('mode', 'driving')
  url.searchParams.set('units', 'imperial')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) return null

  const data = (await res.json()) as {
    status: string
    rows?: Array<{
      elements: Array<{ status: string; distance?: { value: number } }>
    }>
  }

  if (data.status !== 'OK' || !data.rows?.length) return null

  const n = points.length
  const matrix: MatrixCell[][] = Array.from({ length: n }, () => Array(n).fill(Infinity))

  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i]
    for (let j = 0; j < row.elements.length; j++) {
      const el = row.elements[j]
      if (el.status === 'OK' && el.distance?.value != null) {
        matrix[i][j] = el.distance.value
      } else if (i === j) {
        matrix[i][j] = 0
      }
    }
  }

  return matrix
}

function nearestNeighborFromMatrix(
  stopIds: string[],
  matrix: MatrixCell[][],
): { orderedIds: string[]; totalMeters: number } {
  // matrix[0] is origin; stops are indices 1..n
  const n = stopIds.length
  const remaining = new Set(Array.from({ length: n }, (_, i) => i + 1))
  const ordered: string[] = []
  let current = 0
  let total = 0

  while (remaining.size > 0) {
    let bestIdx = -1
    let bestDist = Infinity
    for (const idx of remaining) {
      const d = matrix[current][idx]
      if (
        d < bestDist ||
        (d === bestDist &&
          bestIdx >= 0 &&
          stopIds[idx - 1].localeCompare(stopIds[bestIdx - 1]) < 0) ||
        (d === bestDist && bestIdx < 0)
      ) {
        bestDist = d
        bestIdx = idx
      }
    }
    if (bestIdx < 0 || !Number.isFinite(bestDist)) {
      // Unreachable remainder — append deterministically
      const rest = [...remaining].sort((a, b) => stopIds[a - 1].localeCompare(stopIds[b - 1]))
      for (const idx of rest) ordered.push(stopIds[idx - 1])
      break
    }
    remaining.delete(bestIdx)
    ordered.push(stopIds[bestIdx - 1])
    total += bestDist
    current = bestIdx
  }

  return { orderedIds: ordered, totalMeters: total }
}

export async function optimizeDeliveryRoute(
  stops: OptimizeStopInput[],
  options?: {
    origin?: OptimizeOrigin
    googleMapsApiKey?: string | null
  },
): Promise<OptimizeRouteResult> {
  if (stops.length === 0) {
    return { orderedIds: [], method: 'nearest_neighbor', totalDistanceMiles: 0, routeOrder: [] }
  }

  if (stops.length === 1) {
    return {
      orderedIds: [stops[0].id],
      method: 'nearest_neighbor',
      totalDistanceMiles: null,
      routeOrder: [1],
    }
  }

  const origin = options?.origin ?? DEFAULT_WAREHOUSE_ORIGIN
  const withCoords = stops.filter(hasCoords)
  const apiKey = options?.googleMapsApiKey?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim()

  if (apiKey && withCoords.length === stops.length) {
    try {
      const matrix = await fetchGoogleDistanceMatrixMeters(origin, withCoords, apiKey)
      if (matrix) {
        const { orderedIds, totalMeters } = nearestNeighborFromMatrix(
          withCoords.map((s) => s.id),
          matrix,
        )
        return {
          orderedIds,
          method: 'google_distance_matrix',
          totalDistanceMiles: Math.round((totalMeters / 1609.344) * 10) / 10,
          routeOrder: orderedIds.map((_, i) => i + 1),
        }
      }
    } catch (err) {
      console.error('Google Distance Matrix optimize failed, falling back:', err)
    }
  }

  if (withCoords.length === stops.length) {
    const { orderedIds, totalDistanceMiles } = nearestNeighborOrder(withCoords, origin)
    return {
      orderedIds,
      method: 'nearest_neighbor',
      totalDistanceMiles,
      routeOrder: orderedIds.map((_, i) => i + 1),
    }
  }

  // Partial coords: optimize the geocoded subset, append the rest by delivery time
  if (withCoords.length >= 2) {
    const { orderedIds: geoOrdered, totalDistanceMiles } = nearestNeighborOrder(
      withCoords,
      origin,
    )
    const geoSet = new Set(geoOrdered)
    const rest = sortByDeliveryTime(stops.filter((s) => !geoSet.has(s.id)))
    const orderedIds = [...geoOrdered, ...rest]
    return {
      orderedIds,
      method: 'nearest_neighbor',
      totalDistanceMiles,
      routeOrder: orderedIds.map((_, i) => i + 1),
    }
  }

  const orderedIds = sortByDeliveryTime(stops)
  return {
    orderedIds,
    method: 'delivery_time',
    totalDistanceMiles: null,
    routeOrder: orderedIds.map((_, i) => i + 1),
  }
}
