'use server'

import { headers } from 'next/headers'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'

/**
 * App-level throttle for login and signup. Supabase Auth still enforces its
 * own limits; this stops a single browser from hammering the form.
 */
export async function assertAuthAttemptAllowed(kind: 'login' | 'signup') {
  const hdrs = await headers()
  const ip = clientIpFromHeaders(hdrs)
  const limit = kind === 'login' ? 8 : 5
  const rate = checkRateLimit(`auth:${kind}:${ip}`, limit, 15 * 60_000)
  if (!rate.allowed) {
    return {
      ok: false as const,
      error: 'Too many attempts. Please wait a few minutes and try again.',
    }
  }
  return { ok: true as const }
}
