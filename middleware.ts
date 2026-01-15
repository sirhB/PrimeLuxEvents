import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    const isNative = userAgent.includes('Capacitor') || userAgent.includes('Dante')

    // Clone the request headers
    const requestHeaders = new Headers(request.headers)
    if (isNative) {
        requestHeaders.set('x-is-native', 'true')

        // If it's a native app accessing the root, redirect to admin
        if (request.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // Create a new request with the updated headers
    const newRequest = new NextRequest(request, {
        headers: requestHeaders,
    })

    return await updateSession(newRequest)
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
