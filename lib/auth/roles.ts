import { createClient } from '@/lib/supabase/server'
import { isCatalogBridgeActive } from '@/lib/auth/catalog-bridge'
import { PORTAL_ACCESS, userHasPermission } from '@/lib/auth/permission-catalog'
import { STAFF_ROLES, isStaffRoleName } from '@/lib/auth/roles-shared'

export { isStaffRoleName, STAFF_ROLES }
export { fetchIsStaffClient } from '@/lib/auth/roles-shared'

export async function getUserStaffRoles(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)

  if (!data) return []

  return data
    .map((row: any) => row.roles?.name)
    .filter((name: string | undefined): name is string => Boolean(name))
}

export async function isStaffUser(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name, role_permissions(permissions(name)))')
    .eq('user_id', userId)

  const roles: Array<{ name: string }> = []
  const permissions = new Map<string, { name: string }>()
  for (const row of data || []) {
    const role = (row as { roles?: { name?: string; role_permissions?: Array<{ permissions?: { name?: string } | null }> } | null }).roles
    if (!role?.name) continue
    roles.push({ name: role.name })
    for (const grant of role.role_permissions || []) {
      const name = grant.permissions?.name
      if (name) permissions.set(name, { name })
    }
  }

  const bridge = await isCatalogBridgeActive()
  return userHasPermission(
    { roles, permissions: Array.from(permissions.values()) },
    PORTAL_ACCESS,
    { bridge },
  )
}
