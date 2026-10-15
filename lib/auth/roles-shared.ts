import { PORTAL_ACCESS, userHasPermission } from '@/lib/auth/permission-catalog'

const STAFF_ROLES = ['admin', 'manager', 'staff'] as const

export function isStaffRoleName(role: string | null | undefined): boolean {
  return Boolean(role && STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]))
}

type ClientSupabase = {
  from: (table: string) => any
  rpc: (fn: string) => PromiseLike<{ data: unknown; error: { message?: string } | null }>
}

/** True when the user may open the staff portal, using the permission catalog. */
export async function fetchPortalAccessClient(
  supabase: ClientSupabase,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name, role_permissions(permissions(name)))')
    .eq('user_id', userId)

  const roles: Array<{ name: string }> = []
  const permissions = new Map<string, { name: string }>()
  for (const row of data || []) {
    const role = row.roles
    if (!role?.name) continue
    roles.push({ name: role.name })
    for (const grant of role.role_permissions || []) {
      const name = grant.permissions?.name
      if (name) permissions.set(name, { name })
    }
  }

  const { data: ready, error } = await supabase.rpc('permission_catalog_ready')
  const bridge = Boolean(error) || ready !== true
  return userHasPermission(
    { roles, permissions: Array.from(permissions.values()) },
    PORTAL_ACCESS,
    { bridge },
  )
}

/** @deprecated Prefer fetchPortalAccessClient. Kept for existing login imports. */
export async function fetchIsStaffClient(
  supabase: ClientSupabase,
  userId: string,
): Promise<boolean> {
  return fetchPortalAccessClient(supabase, userId)
}

export { STAFF_ROLES }
