import { NextResponse } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

/**
 * Public liveness check for uptime monitors.
 * Returns booleans for config presence only — never secret values.
 */
export async function GET() {
  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
  )
  const supabaseConfigured = Boolean(
    getSupabaseUrl() && getSupabaseAnonKey(),
  )

  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    stripeConfigured,
    supabaseConfigured,
  })
}
