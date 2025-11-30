import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth/middleware-auth'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

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
            // User is authenticated, check if they have access to admin
            try {
                const userProfile = await getCurrentUserFromRequest(request)
                if (!userProfile || !userProfile.is_active) {
                    // User profile not found or inactive, redirect to login
                    const url = request.nextUrl.clone()
                    url.pathname = '/login'
                    return NextResponse.redirect(url)
                }

                // Check if user has permission to access admin
                const hasAdminAccess = userProfile.roles.some((role: { name: string }) =>
                    role.name === 'admin' || role.name === 'manager' || role.name === 'staff'
                )

                if (!hasAdminAccess) {
                    // User doesn't have admin access, redirect to unauthorized page
                    const url = request.nextUrl.clone()
                    url.pathname = '/unauthorized'
                    return NextResponse.redirect(url)
                }

                // Update last login time
                try {
                    await supabase
                        .from('user_profiles')
                        .update({ last_login_at: new Date().toISOString() })
                        .eq('id', user.id)
                } catch (error) {
                    // Non-critical error, continue
                    console.error('Error updating last login:', error)
                }
            } catch (error) {
                console.error('Error checking user permissions:', error)
                // On error, redirect to login for safety
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
