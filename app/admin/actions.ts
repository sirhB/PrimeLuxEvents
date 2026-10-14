'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requirePermission } from '@/lib/auth/authorization'
import { SUPER_ADMIN_ROLE, isSuperAdmin } from '@/lib/auth/permission-catalog'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { revalidatePath } from 'next/cache'
import { buildIlikeOrFilter, sanitizePostgrestFilterValue } from '@/lib/supabase/filter-sanitize'

export interface SearchResult {
    id: string
    type: 'product' | 'order' | 'consultation' | 'customer' | 'category' | 'setting' | 'content'
    title: string
    subtitle?: string
    url: string
    metadata?: {
        status?: string
        amount?: string
        date?: string
    }
}

export async function searchAdmin(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    await requirePermission('orders.view')

    const safeQuery = sanitizePostgrestFilterValue(query)
    if (safeQuery.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []

    const customersOr = buildIlikeOrFilter(['full_name', 'email'], safeQuery)
    const consultationsOr = buildIlikeOrFilter(['client_name', 'event_type'], safeQuery)
    const ordersOr = buildIlikeOrFilter(['id'], safeQuery)

    // Parallelize queries
    const [products, orders, customers, consultations] = await Promise.all([
        // Products
        supabase.from('products')
            .select('id, name, price, stock')
            .ilike('name', `%${safeQuery}%`)
            .limit(5),

        // Orders
        ordersOr
            ? supabase.from('orders')
                .select('id, total_amount, status, created_at')
                .or(ordersOr)
                .limit(5)
            : Promise.resolve({ data: [] as any[], error: null }),

        // Customers (User Profiles)
        customersOr
            ? supabase.from('user_profiles')
                .select('id, full_name, email')
                .or(customersOr)
                .limit(5)
            : Promise.resolve({ data: [] as any[], error: null }),

        // Consultations
        consultationsOr
            ? supabase.from('consultations')
                .select('id, client_name, event_type, status, scheduled_date')
                .or(consultationsOr)
                .limit(5)
            : Promise.resolve({ data: [] as any[], error: null }),
    ])

    // Process Products
    if (products.data) {
        products.data.forEach(p => {
            results.push({
                id: p.id,
                type: 'product',
                title: p.name,
                subtitle: `Stock: ${p.stock}`,
                url: `/admin/products/${p.id}`,
                metadata: {
                    amount: `$${p.price}` // Basic formatting
                }
            })
        })
    }

    // Process Orders
    if (orders.data) {
        orders.data.forEach(o => {
            results.push({
                id: o.id,
                type: 'order',
                title: `Order #${o.id.substring(0, 8)}`,
                subtitle: new Date(o.created_at).toLocaleDateString(),
                url: `/admin/orders/${o.id}`,
                metadata: {
                    status: o.status,
                    amount: `$${o.total_amount}`
                }
            })
        })
    }

    // Process Customers
    if (customers.data) {
        customers.data.forEach(c => {
            results.push({
                id: c.id,
                type: 'customer',
                title: c.full_name || 'Unknown Name',
                subtitle: c.email,
                url: `/admin/customers/${c.id}`
            })
        })
    }

    // Process Consultations
    if (consultations.data) {
        consultations.data.forEach(c => {
            results.push({
                id: c.id,
                type: 'consultation',
                title: c.client_name,
                subtitle: c.event_type,
                url: `/admin/consultations/${c.id}`,
                metadata: {
                    status: c.status,
                    date: c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : undefined
                }
            })
        })
    }

    return results
}

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

function rethrowIfRedirect(error: unknown): void {
    if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        typeof (error as { digest?: unknown }).digest === 'string' &&
        (error as { digest: string }).digest.includes('NEXT_REDIRECT')
    ) {
        throw error
    }
}

const ROLE_NAME_PATTERN = /^[a-z][a-z0-9_]{1,48}$/

async function getRoleRecord(roleId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('roles')
        .select('id, name, is_system_role')
        .eq('id', roleId)
        .single()
    return { supabase, role: data, error: error?.message || null }
}

async function countOtherActiveSuperAdmins(userId: string): Promise<number> {
    const admin = createServiceRoleClient()
    const { data: role } = await admin.from('roles').select('id').eq('name', SUPER_ADMIN_ROLE).maybeSingle()
    if (!role?.id) return 0
    const { data: assignments } = await admin
        .from('user_roles')
        .select('user_id, user_profiles!user_id(is_active)')
        .eq('role_id', role.id)
    return (assignments || []).filter((row: { user_id: string; user_profiles?: { is_active?: boolean } | { is_active?: boolean }[] | null }) => {
        if (row.user_id === userId) return false
        const profile = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles
        return profile?.is_active !== false
    }).length
}

// Update role permissions
export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const { supabase, role, error: roleError } = await getRoleRecord(roleId)
        if (!role) return { success: false, error: roleError || 'Role not found' }
        if (role.name === SUPER_ADMIN_ROLE) {
            return { success: false, error: 'The super admin role always has full access and cannot be changed' }
        }

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
        rethrowIfRedirect(error)
        console.error('Error updating role permissions:', error)
        return { success: false, error: 'Failed to update role permissions' }
    }
}

// Create new role
export async function createRole(roleData: { name: string; display_name: string; description?: string; color: string }): Promise<{ success: boolean; data?: Role; error?: string }> {
    try {
        await requirePermission('users.manage')

        const name = roleData.name.trim().toLowerCase()
        if (!ROLE_NAME_PATTERN.test(name) || name === SUPER_ADMIN_ROLE) {
            return { success: false, error: 'Use a short lowercase name such as showroom_lead' }
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('roles')
            .insert({
                name,
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
        rethrowIfRedirect(error)
        console.error('Error creating role:', error)
        return { success: false, error: 'Failed to create role' }
    }
}

// Update role
export async function updateRole(roleId: string, roleData: { display_name?: string; description?: string; color?: string }): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const { supabase, role, error: roleError } = await getRoleRecord(roleId)
        if (!role) return { success: false, error: roleError || 'Role not found' }

        const { error } = await supabase
            .from('roles')
            .update({
                display_name: roleData.display_name,
                description: roleData.description,
                color: roleData.color,
                updated_at: new Date().toISOString()
            })
            .eq('id', roleId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/team')
        return { success: true }
    } catch (error) {
        rethrowIfRedirect(error)
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

        const { role, error: roleLookupError } = await getRoleRecord(roleId)
        if (!role) {
            return { success: false, error: roleLookupError || 'Role not found' }
        }

        if (role?.name === SUPER_ADMIN_ROLE) {
            return { success: false, error: 'The super admin role cannot be deleted' }
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
        rethrowIfRedirect(error)
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

        const { role } = await getRoleRecord(roleId)
        if (role?.name === SUPER_ADMIN_ROLE) {
            const actor = await getCurrentUser()
            if (!actor || !isSuperAdmin(actor)) {
                return { success: false, error: 'Only a super admin can assign the super admin role' }
            }
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
        rethrowIfRedirect(error)
        console.error('Error assigning role:', error)
        return { success: false, error: 'Failed to assign role' }
    }
}

// Remove role from user
export async function removeUserRole(userId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('users.manage')

        const { role } = await getRoleRecord(roleId)
        if (role?.name === SUPER_ADMIN_ROLE) {
            const actor = await getCurrentUser()
            if (!actor || !isSuperAdmin(actor)) {
                return { success: false, error: 'Only a super admin can remove the super admin role' }
            }
            const remaining = await countOtherActiveSuperAdmins(userId)
            if (remaining < 1) {
                return { success: false, error: 'Cannot remove the last super admin' }
            }
        }

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
        rethrowIfRedirect(error)
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

        if (profileData.is_active === false) {
            const remaining = await countOtherActiveSuperAdmins(userId)
            const admin = createServiceRoleClient()
            const { data: assignment } = await admin
                .from('user_roles')
                .select('roles!role_id(name)')
                .eq('user_id', userId)
            const isSuper = (assignment || []).some((row: { roles?: { name?: string } | { name?: string }[] | null }) => {
                const role = Array.isArray(row.roles) ? row.roles[0] : row.roles
                return role?.name === SUPER_ADMIN_ROLE
            })
            if (isSuper && remaining < 1) {
                return { success: false, error: 'Cannot deactivate the last super admin' }
            }
        }

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
        rethrowIfRedirect(error)
        console.error('Error updating user profile:', error)
        return { success: false, error: 'Failed to update user profile' }
    }
}

// Get all members for a specific role
export async function getRoleMembers(roleId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
        await requirePermission('users.view')

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_roles')
            .select(`
                user_profiles!user_id (
                    id,
                    email,
                    full_name,
                    avatar_url,
                    job_title,
                    department,
                    is_active
                )
            `)
            .eq('role_id', roleId)

        if (error) {
            return { success: false, error: error.message }
        }

        const members = data?.map((ur: any) => ur.user_profiles) || []
        return { success: true, data: members }
    } catch (error) {
        console.error('Error fetching role members:', error)
        return { success: false, error: 'Failed to fetch role members' }
    }
}

