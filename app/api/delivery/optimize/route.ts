import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/auth/roles'
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isStaffUser(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
