import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeInternalPath } from '@/lib/security/safe-path'

function redirectOrigin(request: Request) {
    const url = new URL(request.url)
    const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    const allowed = new Set(['primeluxevents.com', 'www.primeluxevents.com', 'localhost:3000'])
    const configured = process.env.NEXT_PUBLIC_SITE_URL
    if (configured) {
        try {
            allowed.add(new URL(configured).host)
        } catch {
            // Ignore a malformed site URL and fall back to the request origin.
        }
    }
    if (forwarded && allowed.has(forwarded)) {
        const protocol = forwarded.startsWith('localhost') ? 'http' : 'https'
        return `${protocol}://${forwarded}`
    }
    return url.origin
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = safeInternalPath(searchParams.get('next'), '/account')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${redirectOrigin(request)}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
