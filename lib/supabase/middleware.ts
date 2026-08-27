import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getUserProfileForMiddleware, serializeAuthCache, deserializeAuthCache } from '@/lib/auth/middleware-auth'
import { requireSupabaseAnonKey, requireSupabaseUrl } from '@/lib/supabase/env'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        requireSupabaseUrl(),
        requireSupabaseAnonKey(),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Verify user identity
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is accessing admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // No authenticated user, redirect to login
            if (!request.nextUrl.pathname.startsWith('/admin/login')) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                return NextResponse.redirect(url)
            }
        } else {
            // User is authenticated, check for cached permissions
            try {
                const cacheToken = request.cookies.get('admin-auth-cache')?.value
                let authCache = cacheToken ? deserializeAuthCache(cacheToken) : null

                // Validate cache (check if it belongs to current user and is < 5 mins old)
                const CACHE_EXPIRY_MS = 1000 * 60 * 5 // 5 minutes
                const isCacheValid = authCache &&
                    authCache.id === user.id &&
                    (Date.now() - authCache.ts) < CACHE_EXPIRY_MS

                let hasAdminAccess = false
                let isActive = false

                if (isCacheValid && authCache) {
                    // console.log('Middleware: Using cached auth for user:', user.id)
                    isActive = authCache.active
                    hasAdminAccess = authCache.roles.some((role: string) =>
                        ['admin', 'manager', 'staff'].includes(role)
                    )
                } else {
                    // Cache miss or stale: Database lookup
                    const userProfile = await getUserProfileForMiddleware(supabase, user.id)
                    if (userProfile) {
                        isActive = userProfile.is_active
                        hasAdminAccess = userProfile.roles.some((role: { name: string }) =>
                            ['admin', 'manager', 'staff'].includes(role.name)
                        )

                        // Update cache for next time
                        const newCacheToken = serializeAuthCache(userProfile)
                        supabaseResponse.cookies.set('admin-auth-cache', newCacheToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            maxAge: 60 * 60, // 1 hour (though we check timestamp internally for 5 mins)
                            path: '/',
                        })
                    }
                }

                if (!isActive || !hasAdminAccess) {
                    const url = request.nextUrl.clone()
                    url.pathname = isActive ? '/unauthorized' : '/login'
                    return NextResponse.redirect(url)
                }

            } catch (error) {
                console.error('Error checking user permissions in middleware:', error)
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
