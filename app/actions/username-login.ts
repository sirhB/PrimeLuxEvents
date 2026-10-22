'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import { isValidUsername, normalizeUsername, syntheticAdminEmail } from '@/lib/auth/username'

const GENERIC_ERROR = 'Invalid username or password'

export type UsernameLoginResult =
  | { ok: true; mustChangePassword: boolean }
  | { ok: false; error: string }

/**
 * Sign in with a staff username. The username is resolved to the account's
 * auth email server-side; the client never learns whether a username exists.
 */
export async function signInWithUsername(rawUsername: string, password: string): Promise<UsernameLoginResult> {
  const hdrs = await headers()
  const ip = clientIpFromHeaders(hdrs)
  const username = normalizeUsername(rawUsername)

  const ipGate = checkRateLimit(`auth:username:ip:${ip}`, 8, 15 * 60_000)
  const userGate = checkRateLimit(`auth:username:user:${username || '-'}`, 5, 15 * 60_000)
  if (!ipGate.allowed || !userGate.allowed) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
  }

  if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return { ok: false, error: GENERIC_ERROR }
  }

  // Resolve the username. Unknown or malformed usernames still go through a
  // sign-in attempt against an unused synthetic address to keep timing similar.
  let email = syntheticAdminEmail('unknown-user')
  if (isValidUsername(username)) {
    try {
      const admin = createServiceRoleClient()
      const { data } = await admin
        .from('user_profiles')
        .select('email, is_active')
        .eq('username', username)
        .maybeSingle()
      if (data?.email && data.is_active !== false) email = String(data.email).toLowerCase()
    } catch {
      // fall through to generic failure
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return { ok: false, error: GENERIC_ERROR }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('must_change_password')
    .eq('id', data.user.id)
    .maybeSingle()

  return { ok: true, mustChangePassword: profile?.must_change_password === true }
}
