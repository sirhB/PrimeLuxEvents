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

        // 1. Get user profile (simple query, no joins)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .single()

        if (profileError) {
            console.error('Middleware: Error fetching profile:', profileError)
            return null
        }

        if (!profile) {
            console.error('Middleware: No profile found for user:', userId)
            return null
        }

        // 2. Get user roles
        const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select(`
        roles (
          id,
          name,
          display_name,
          description,
          color,
          is_system_role
        )
      `)
            .eq('user_id', userId)

        if (rolesError) {
            console.error('Middleware: Error fetching roles:', rolesError)
            // Continue without roles if that fails, but log it
        }

        const roles = userRoles?.map((ur: any) => ur.roles) || []
        console.log('Middleware: Profile found, roles count:', roles.length)

        // 3. Get permissions for these roles
        let permissions: Permission[] = []
        if (roles.length > 0) {
            const roleIds = roles.map((r: any) => r.id)
            const { data: rolePermissions, error: permissionsError } = await supabase
                .from('role_permissions')
                .select(`
            permissions (
              id,
              name,
              display_name,
              description,
              resource,
              action
            )
          `)
                .in('role_id', roleIds)

            if (!permissionsError && rolePermissions) {
                // Flatten and deduplicate permissions
                const permissionsMap = new Map<string, Permission>()
                rolePermissions.forEach((rp: any) => {
                    if (rp.permissions) {
                        permissionsMap.set(rp.permissions.name, rp.permissions)
                    }
                })
                permissions = Array.from(permissionsMap.values())
            }
        }

        return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            job_title: profile.job_title,
            department: profile.department,
            hire_date: profile.hire_date,
            is_active: profile.is_active,
            last_login_at: profile.last_login_at,
            roles: roles,
            permissions
        }
    } catch (error) {
        console.error('Error in getUserProfileForMiddleware:', error)
        return null
    }
}
