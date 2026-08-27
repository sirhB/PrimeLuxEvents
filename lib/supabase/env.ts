/**
 * Resolve Supabase credentials.
 *
 * Accepts both the standard names and the mis-prefixed Vercel copies
 * (p_*, NEXT_PUBLIC_p_*) that were provisioned for the plux project.
 */

function firstDefined(...values: Array<string | undefined | null>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return undefined
}

export function getSupabaseUrl(): string | undefined {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_p_SUPABASE_URL,
    process.env.p_SUPABASE_URL,
  )
}

export function getSupabaseAnonKey(): string | undefined {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_p_SUPABASE_ANON_KEY,
    process.env.p_SUPABASE_ANON_KEY,
  )
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return firstDefined(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.p_SUPABASE_SERVICE_ROLE_KEY,
  )
}

export function requireSupabaseUrl(): string {
  const url = getSupabaseUrl()
  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL (expected https://bxktvrvpksxaijhdjegh.supabase.co)',
    )
  }
  return url
}

export function requireSupabaseAnonKey(): string {
  const key = getSupabaseAnonKey()
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return key
}

export function requireSupabaseServiceRoleKey(): string {
  const key = getSupabaseServiceRoleKey()
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return key
}
