import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
        console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables!')
        // We throw a descriptive error to helps developers identify the issue quickly
        throw new Error('supabaseKey is required but SUPABASE_SERVICE_ROLE_KEY is missing.')
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
