import { createBrowserClient } from '@supabase/ssr'
import { requireSupabaseAnonKey, requireSupabaseUrl } from '@/lib/supabase/env'

export function createClient() {
    return createBrowserClient(
        requireSupabaseUrl(),
        requireSupabaseAnonKey(),
    )
}
