import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getUserProfileForMiddleware, serializeAuthCache, deserializeAuthCache } from '@/lib/auth/middleware-auth'
import { PORTAL_ACCESS, userHasPermission } from '@/lib/auth/permission-catalog'
import { requireSupabaseAnonKey, requireSupabaseUrl } from '@/lib/supabase/env'

const CACHE_EXPIRY_MS = 1000 * 60 * 5

function permissionSubject(roles: string[], permissions: string[]) {
    return {
        roles: roles.map((name) => ({ name })),
        permissions: permissions.map((name) => ({ name })),
    }
}

export async function updateSession(request: NextRequest) {
    request.headers.set('x-pathname', request.nextUrl.pathname)

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

    const pathname = request.nextUrl.pathname
    const isStaffPortal =
        pathname.startsWith('/admin') || pathname.startsWith('/innovate')

    if (pathname.startsWith('/account') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    const redirectWithSession = (path: string, nextPath?: string) => {
        const url = request.nextUrl.clone()
        url.pathname = path
        url.search = ''
        if (nextPath) url.searchParams.set('next', nextPath)
        const redirected = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirected.cookies.set(cookie.name, cookie.value)
        })
        return redirected
    }

    const needsPermissionCheck = Boolean(user) && (isStaffPortal || pathname.startsWith('/account'))

    if (needsPermissionCheck && user) {
        try {
            const cacheToken = request.cookies.get('admin-auth-cache')?.value
            const authCache = cacheToken ? deserializeAuthCache(cacheToken) : null
            const isCacheValid = Boolean(
                authCache && authCache.id === user.id && (Date.now() - authCache.ts) < CACHE_EXPIRY_MS,
            )

            let isActive = false
            let bridge = true
            let mustChangePassword = false
            let subject = permissionSubject([], [])
            let resolved = false

            if (isCacheValid && authCache) {
                isActive = authCache.active
                bridge = authCache.bridge
                mustChangePassword = authCache.mustChangePassword
                subject = permissionSubject(authCache.roles, authCache.permissions)
                resolved = true
            } else {
                const userProfile = await getUserProfileForMiddleware(supabase, user.id)
                if (userProfile) {
                    const { data: catalogReady, error: catalogError } = await supabase.rpc('permission_catalog_ready')
                    bridge = Boolean(catalogError) || catalogReady !== true
                    isActive = userProfile.is_active
                    mustChangePassword = userProfile.must_change_password === true
                    subject = {
                        roles: userProfile.roles.map((role) => ({ name: role.name })),
                        permissions: userProfile.permissions.map((permission) => ({ name: permission.name })),
                    }
                    resolved = true
                    const newCacheToken = serializeAuthCache(userProfile, { bridge })
                    if (newCacheToken) {
                        supabaseResponse.cookies.set('admin-auth-cache', newCacheToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            maxAge: 60 * 60,
                            path: '/',
                        })
                    }
                }
            }

            if (
                resolved &&
                mustChangePassword &&
                pathname !== '/login/change-password'
            ) {
                return redirectWithSession('/login/change-password')
            }

            if (isStaffPortal) {
                const required = pathname.startsWith('/innovate') ? 'innovate.view' : PORTAL_ACCESS
                const allowed = resolved && isActive && userHasPermission(subject, required, { bridge })
                if (!allowed) {
                    return redirectWithSession(resolved && isActive ? '/unauthorized' : '/login', pathname)
                }
            }
        } catch (error) {
            console.error('Error checking user permissions in middleware:', error)
            if (isStaffPortal) {
                return redirectWithSession('/login', pathname)
            }
        }
    } else if (isStaffPortal && !user && !pathname.startsWith('/admin/login')) {
        return redirectWithSession('/login', pathname)
    }

    return supabaseResponse
}
