'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/authorization'
import { revalidatePath } from 'next/cache'

export interface Role {
    id: string
    name: string
    display_name: string
    description: string | null
    color: string
    is_system_role: boolean
    created_at: string
    updated_at: string
}

export interface Permission {
    id: string
    name: string
    display_name: string
    description: string | null
    resource: string
    action: string
    created_at: string
}

export interface RoleWithStats extends Role {
    permissions?: Permission[]
    memberCount?: number
}

// Get all roles with their permissions and member counts
export async function getRolesWithPermissions(): Promise<{ success: boolean; data?: RoleWithStats[]; error?: string }> {
    try {
        const supabase = await createClient()

        // Get all roles
        const { data: roles, error: rolesError } = await supabase
            .from('roles')
            .select('*')
            .order('display_name')

        if (rolesError) {
            return { success: false, error: rolesError.message }
        }

        // Get all role permissions
        const { data: rolePermissions, error: rpError } = await supabase
            .from('role_permissions')
            .select(`
                role_id,
                permissions (
                    id,
                    name,
                    display_name,
                    description,
                    resource,
                    action
                )
            `)

        if (rpError) {
            return { success: false, error: rpError.message }
        }

        // Get member counts
        const { data: memberCounts, error: countsError } = await supabase
            .from('user_roles')
            .select('role_id')

        if (countsError) {
            return { success: false, error: countsError.message }
        }

        // Group permissions by role
        const permissionsByRole: Record<string, Permission[]> = {}
        rolePermissions?.forEach((rp: any) => {
            if (!permissionsByRole[rp.role_id]) {
                permissionsByRole[rp.role_id] = []
            }
            if (rp.permissions) {
                permissionsByRole[rp.role_id].push(rp.permissions)
            }
        })

        // Count members by role
        const memberCountByRole: Record<string, number> = {}
        memberCounts?.forEach((ur: any) => {
            memberCountByRole[ur.role_id] = (memberCountByRole[ur.role_id] || 0) + 1
        })

        // Combine data
        const rolesWithStats: RoleWithStats[] = roles.map(role => ({
            ...role,
            permissions: permissionsByRole[role.id] || [],
            memberCount: memberCountByRole[role.id] || 0
        }))

        return { success: true, data: rolesWithStats }
    } catch (error) {
        console.error('Error fetching roles with permissions:', error)
        return { success: false, error: 'Failed to fetch roles data' }
    }
}

// Get all permissions
export async function getAllPermissions(): Promise<{ success: boolean; data?: Permission[]; error?: string }> {
    try {
        const supabase = await createClient()

        const { data: permissions, error } = await supabase
            .from('permissions')
            .select('*')
            .order('resource', { ascending: true })
            .order('action', { ascending: true })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: permissions }
    } catch (error) {
        console.error('Error fetching permissions:', error)
        return { success: false, error: 'Failed to fetch permissions' }
    }
}

// Update role permissions
export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        // Delete existing permissions for this role
        const { error: deleteError } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId)

        if (deleteError) {
            return { success: false, error: deleteError.message }
        }

        // Insert new permissions if any
        if (permissionIds.length > 0) {
            const permissionInserts = permissionIds.map(permissionId => ({
                role_id: roleId,
                permission_id: permissionId
            }))

            const { error: insertError } = await supabase
                .from('role_permissions')
                .insert(permissionInserts)

            if (insertError) {
                return { success: false, error: insertError.message }
            }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error updating role permissions:', error)
        return { success: false, error: 'Failed to update role permissions' }
    }
}

// Create new role
export async function createRole(roleData: { name: string; display_name: string; description?: string; color: string }): Promise<{ success: boolean; data?: Role; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('roles')
            .insert({
                name: roleData.name,
                display_name: roleData.display_name,
                description: roleData.description || null,
                color: roleData.color,
                is_system_role: false
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true, data }
    } catch (error) {
        console.error('Error creating role:', error)
        return { success: false, error: 'Failed to create role' }
    }
}

// Update role
export async function updateRole(roleId: string, roleData: { display_name?: string; description?: string; color?: string }): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        const { error } = await supabase
            .from('roles')
            .update({
                display_name: roleData.display_name,
                description: roleData.description,
                color: roleData.color,
                updated_at: new Date().toISOString()
            })
            .eq('id', roleId)
            .eq('is_system_role', false) // Only allow updating non-system roles

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error updating role:', error)
        return { success: false, error: 'Failed to update role' }
    }
}

// Delete role
export async function deleteRole(roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        // Check if role has members
        const { data: members, error: membersError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('role_id', roleId)
            .limit(1)

        if (membersError) {
            return { success: false, error: membersError.message }
        }

        if (members && members.length > 0) {
            return { success: false, error: 'Cannot delete role that has assigned members' }
        }

        // Check if it's a system role
        const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('is_system_role')
            .eq('id', roleId)
            .single()

        if (roleError) {
            return { success: false, error: roleError.message }
        }

        if (role?.is_system_role) {
            return { success: false, error: 'Cannot delete system roles' }
        }

        // Delete the role (this will cascade to role_permissions)
        const { error: deleteError } = await supabase
            .from('roles')
            .delete()
            .eq('id', roleId)

        if (deleteError) {
            return { success: false, error: deleteError.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error deleting role:', error)
        return { success: false, error: 'Failed to delete role' }
    }
}

// Get role stats (member count and permission count)
export async function getRoleStats(roleId: string): Promise<{ memberCount: number; permissionCount: number }> {
    try {
        const supabase = await createClient()

        // Get member count
        const { count: memberCount, error: memberError } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', roleId)

        // Get permission count
        const { count: permissionCount, error: permissionError } = await supabase
            .from('role_permissions')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', roleId)

        return {
            memberCount: memberCount || 0,
            permissionCount: permissionCount || 0
        }
    } catch (error) {
        console.error('Error getting role stats:', error)
        return { memberCount: 0, permissionCount: 0 }
    }
}

// Assign role to user
export async function assignUserRole(userId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check if user already has this role
        const { data: existing } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role_id', roleId)
            .single()

        if (existing) {
            return { success: false, error: 'User already has this role' }
        }

        const { error } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: roleId,
                assigned_by: currentUser.id
            })

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error assigning role:', error)
        return { success: false, error: 'Failed to assign role' }
    }
}

// Remove role from user
export async function removeUserRole(userId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role_id', roleId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error removing role:', error)
        return { success: false, error: 'Failed to remove role' }
    }
}

// Update user profile
export async function updateUserProfile(
    userId: string,
    profileData: {
        full_name?: string
        phone?: string
        job_title?: string
        department?: string
        hire_date?: string
        is_active?: boolean
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const supabase = await createClient()

        const { error } = await supabase
            .from('user_profiles')
            .update({
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        console.error('Error updating user profile:', error)
        return { success: false, error: 'Failed to update user profile' }
    }
}

