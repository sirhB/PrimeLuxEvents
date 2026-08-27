import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
    getSupabaseAnonKey,
    getSupabaseServiceRoleKey,
    requireSupabaseServiceRoleKey,
    requireSupabaseUrl,
} from '@/lib/supabase/env'

export async function createClient() {
    const cookieStore = await cookies()
    const url = requireSupabaseUrl()
    const anonKey = getSupabaseAnonKey()
    const serviceKey = getSupabaseServiceRoleKey()

    // Prefer anon key; fall back to service role for server reads when anon is unset
    // (e.g. mid-migration). Never expose service role to the browser client.
    const key = anonKey && anonKey.length > 20 ? anonKey : serviceKey
    if (!key) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and a usable Supabase API key')
    }

    return createServerClient(
        url,
        key,
        {
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
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/** Privileged server-only client (bypasses RLS). */
export function createServiceClient() {
    const url = requireSupabaseUrl()
    const key = requireSupabaseServiceRoleKey()
    return createSupabaseClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
}
