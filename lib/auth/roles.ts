import { createClient } from '@/lib/supabase/server'
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
  const roles = await getUserStaffRoles(userId)
  return roles.some((role) => STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]))
}
