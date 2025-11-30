import { createClient } from '@/lib/supabase/server'
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

// Cache user data for the request
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    // 1. Get user profile (simple query, no joins)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) return null

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
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
    }

    const roles = userRoles?.map((ur: any) => ur.roles) || []

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
    console.error('Error in getCurrentUser:', error)
    return null
  }
})

// Check if user has a specific permission
export async function hasPermission(permissionName: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.permissions.some(permission => permission.name === permissionName)
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(permissionNames: string[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.permissions.some(permission =>
    permissionNames.includes(permission.name)
  )
}

// Check if user has a specific role
export async function hasRole(roleName: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.roles.some(role => role.name === roleName)
}

// Check if user has any of the specified roles
export async function hasAnyRole(roleNames: string[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.roles.some(role => roleNames.includes(role.name))
}

// Check if user can perform an action on a resource
export async function canPerformAction(resource: string, action: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Check for specific permission
  const specificPermission = `${resource}.${action}`
  if (user.permissions.some(p => p.name === specificPermission)) {
    return true
  }

  // Check for manage permission on resource
  const managePermission = `${resource}.manage`
  if (user.permissions.some(p => p.name === managePermission)) {
    return true
  }

  // Check for admin role (has all permissions)
  if (user.roles.some(r => r.name === 'admin')) {
    return true
  }

  return false
}

// Get all permissions for a resource
export async function getResourcePermissions(resource: string): Promise<Permission[]> {
  const user = await getCurrentUser()
  if (!user) return []

  return user.permissions.filter(permission => permission.resource === resource)
}

// Require authentication middleware helper
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Require specific permission
export async function requirePermission(permissionName: string): Promise<UserProfile> {
  const user = await requireAuth()

  const hasPerm = await hasPermission(permissionName)
  if (!hasPerm) {
    throw new Error(`Permission required: ${permissionName}`)
  }

  return user
}

// Require specific role
export async function requireRole(roleName: string): Promise<UserProfile> {
  const user = await requireAuth()

  const hasRoleCheck = await hasRole(roleName)
  if (!hasRoleCheck) {
    throw new Error(`Role required: ${roleName}`)
  }

  return user
}

// Update user's last login
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('user_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)
}
