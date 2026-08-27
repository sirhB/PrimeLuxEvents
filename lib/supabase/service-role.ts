import { createClient } from '@supabase/supabase-js'
import { requireSupabaseServiceRoleKey, requireSupabaseUrl } from '@/lib/supabase/env'

export function createServiceRoleClient() {
    const key = requireSupabaseServiceRoleKey()
    return createClient(
        requireSupabaseUrl(),
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
