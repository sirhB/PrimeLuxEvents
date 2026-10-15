import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireApiPermission } from '@/lib/auth/authorization'
import { checkRateLimit } from '@/lib/security/rate-limit'
import {
  optimizeDeliveryRoute,
  type OptimizeOrigin,
  type OptimizeStopInput,
} from '@/lib/delivery/optimize-route'

export const dynamic = 'force-dynamic'

type Body = {
  stops?: OptimizeStopInput[]
  origin?: OptimizeOrigin
}

export async function POST(request: Request) {
  const denied = await requireApiPermission('delivery.update')
  if (denied) return denied

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rate = checkRateLimit(`delivery-optimize:${user.id}`, 20, 60_000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    )
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const stops = Array.isArray(body.stops) ? body.stops : null
  if (!stops || stops.length === 0) {
    return NextResponse.json({ error: 'stops array is required' }, { status: 400 })
  }

  if (stops.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 stops per request' }, { status: 400 })
  }

  for (const stop of stops) {
    if (!stop?.id || typeof stop.id !== 'string') {
      return NextResponse.json({ error: 'Each stop requires a string id' }, { status: 400 })
    }
  }

  const result = await optimizeDeliveryRoute(stops, {
    origin: body.origin,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  })

  return NextResponse.json({
    orderedIds: result.orderedIds,
    method: result.method,
    totalDistanceMiles: result.totalDistanceMiles,
    routeOrder: result.routeOrder,
  })
}
