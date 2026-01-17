import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { cache } from 'react'

export interface UserProfile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    phone: string | null
    job_title: string | null
    department: string | null
    hire_date: string | null
    is_active: boolean
    last_login_at: string | null
    roles: Role[]
    permissions: Permission[]
}

export interface Role {
    id: string
    name: string
    display_name: string
    description: string | null
    color: string
    is_system_role: boolean
}

export interface Permission {
    id: string
    name: string
    display_name: string
    description: string | null
    resource: string
    action: string
}

// Get current user from middleware context (using request cookies)
export async function getCurrentUserFromRequest(request: NextRequest): Promise<UserProfile | null> {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // No-op in middleware context
                    },
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return null

        return getUserProfileForMiddleware(supabase, user.id)
    } catch (error) {
        console.error('Error fetching current user from request:', error)
        return null
    }
}

// Helper to get user profile using an existing Supabase client (avoids creating a new one in middleware)
export async function getUserProfileForMiddleware(supabase: any, userId: string): Promise<UserProfile | null> {
    try {
        console.log('Middleware: Fetching profile for user:', userId)

        // 1. Get user profile with roles and permissions in ONE query
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
                *,
                user_roles:user_roles!user_roles_user_id_fkey (
                    roles (
                        id,
                        name,
                        display_name,
                        description,
                        color,
                        is_system_role,
                        role_permissions (
                            permissions (
                                id,
                                name,
                                display_name,
                                description,
                                resource,
                                action
                            )
                        )
                    )
                )
            `)
            .eq('id', userId)
            .eq('is_active', true)
            .single()

        if (profileError || !profileData) {
            console.error('Middleware: Error fetching profile or inactive:', profileError)
            return null
        }

        // 2. Flatten and deduplicate roles and permissions
        const roles: Role[] = []
        const permissionsMap = new Map<string, Permission>()

        // Access the relationship via the specific key returned by PostgREST
        const userRoles = (profileData as any).user_roles || []

        userRoles.forEach((ur: any) => {
            if (ur.roles) {
                const role = ur.roles
                roles.push({
                    id: role.id,
                    name: role.name,
                    display_name: role.display_name,
                    description: role.description,
                    color: role.color,
                    is_system_role: role.is_system_role
                })

                role.role_permissions?.forEach((rp: any) => {
                    if (rp.permissions) {
                        permissionsMap.set(rp.permissions.name, rp.permissions)
                    }
                })
            }
        })

        const permissions = Array.from(permissionsMap.values())
        console.log('Middleware: Profile found, roles count:', roles.length, 'permissions count:', permissions.length)

        return {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            phone: profileData.phone,
            job_title: profileData.job_title,
            department: profileData.department,
            hire_date: profileData.hire_date,
            is_active: profileData.is_active,
            last_login_at: profileData.last_login_at,
            roles: roles,
            permissions
        }
    } catch (error) {
        console.error('Error in getUserProfileForMiddleware:', error)
        return null
    }
}

/**
 * Serializes minimal profile info for cookie-based caching in middleware.
 * Focuses on authorization fields to keep cookie size small.
 */
export function serializeAuthCache(profile: UserProfile): string {
    const minProfile = {
        id: profile.id,
        roles: profile.roles.map(r => r.name),
        active: profile.is_active,
        ts: Date.now()
    }
    return Buffer.from(JSON.stringify(minProfile)).toString('base64')
}

/**
 * Deserializes profile info from middleware cookie.
 */
export function deserializeAuthCache(token: string): { id: string, roles: string[], active: boolean, ts: number } | null {
    try {
        const decoded = Buffer.from(token, 'base64').toString()
        return JSON.parse(decoded)
    } catch (e) {
        return null
    }
}
