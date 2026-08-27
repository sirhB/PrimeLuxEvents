import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { requireSupabaseAnonKey, requireSupabaseUrl } from '@/lib/supabase/env'
import { getSupabaseServiceRoleKey } from '@/lib/supabase/env'

type AuthCachePayload = {
    id: string
    roles: string[]
    active: boolean
    ts: number
}

function getAuthCacheSecret(): string | null {
    const dedicated = process.env.AUTH_CACHE_SECRET?.trim()
    if (dedicated) return dedicated
    // Prefer a server-only secret; service role is never exposed to the browser
    return getSupabaseServiceRoleKey() || null
}

function signPayload(payloadB64: string, secret: string): string {
    return createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a)
        const bufB = Buffer.from(b)
        if (bufA.length !== bufB.length) return false
        return timingSafeEqual(bufA, bufB)
    } catch {
        return false
    }
}

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
            requireSupabaseUrl(),
            requireSupabaseAnonKey(),
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
 * Serializes minimal profile info for an HMAC-signed middleware cookie.
 * Returns null when no server secret is available (caller should skip cache).
 */
export function serializeAuthCache(profile: UserProfile): string | null {
    const secret = getAuthCacheSecret()
    if (!secret) return null

    const minProfile: AuthCachePayload = {
        id: profile.id,
        roles: profile.roles.map((r) => r.name),
        active: profile.is_active,
        ts: Date.now(),
    }
    const payloadB64 = Buffer.from(JSON.stringify(minProfile)).toString('base64url')
    const sig = signPayload(payloadB64, secret)
    return `${payloadB64}.${sig}`
}

/**
 * Deserializes and verifies an HMAC-signed auth cache cookie.
 * Rejects unsigned legacy Base64 cookies and forged payloads.
 */
export function deserializeAuthCache(token: string): AuthCachePayload | null {
    try {
        const secret = getAuthCacheSecret()
        if (!secret) return null

        const dot = token.lastIndexOf('.')
        if (dot <= 0) return null

        const payloadB64 = token.slice(0, dot)
        const sig = token.slice(dot + 1)
        if (!payloadB64 || !sig) return null

        const expected = signPayload(payloadB64, secret)
        if (!safeEqual(sig, expected)) return null

        const decoded = Buffer.from(payloadB64, 'base64url').toString('utf8')
        const parsed = JSON.parse(decoded) as AuthCachePayload

        if (
            typeof parsed?.id !== 'string' ||
            !Array.isArray(parsed.roles) ||
            typeof parsed.active !== 'boolean' ||
            typeof parsed.ts !== 'number'
        ) {
            return null
        }

        return {
            id: parsed.id,
            roles: parsed.roles.filter((r): r is string => typeof r === 'string'),
            active: parsed.active,
            ts: parsed.ts,
        }
    } catch {
        return null
    }
}
