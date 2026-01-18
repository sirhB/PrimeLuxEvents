import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    const isNativeHeader = request.headers.get('x-is-native') === 'true'
    const isNative = isNativeHeader ||
        userAgent.includes('Capacitor') ||
        userAgent.includes('Dante') ||
        userAgent.includes('NativeApp') ||
        userAgent.includes('Bridge')

    // 1. Set native flag in request headers for server components
    const requestHeaders = new Headers(request.headers)
    if (isNative) {
        requestHeaders.set('x-is-native', 'true')
    }

    // 2. Process session and auth cache
    const newRequest = new NextRequest(request, { headers: requestHeaders })
    const response = await updateSession(newRequest)

    // 3. Redirect root to admin for native apps
    if (isNative && request.nextUrl.pathname === '/') {
        console.log(`[Middleware] Native app detected (UA: ${userAgent}), redirecting / to /admin`)
        const adminUrl = new URL('/admin', request.url)
        const redirectResponse = NextResponse.redirect(adminUrl)

        // Copy cookies from session update to redirect
        response.cookies.getAll().forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value)
        })
        redirectResponse.headers.set('x-is-native', 'true')
        return redirectResponse
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
