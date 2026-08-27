import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
    requireSupabaseAnonKey,
    requireSupabaseServiceRoleKey,
    requireSupabaseUrl,
} from '@/lib/supabase/env'

/**
 * User-scoped server client (respects RLS). Never falls back to the service role.
 */
export async function createClient() {
    const cookieStore = await cookies()
    const url = requireSupabaseUrl()
    const anonKey = requireSupabaseAnonKey()

    return createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // Called from a Server Component; middleware refreshes sessions.
                }
            },
        },
    })
}

/** Privileged server-only client (bypasses RLS). */
export function createServiceClient() {
    const url = requireSupabaseUrl()
    const key = requireSupabaseServiceRoleKey()
    return createSupabaseClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
}
