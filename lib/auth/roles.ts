import { createClient } from '@/lib/supabase/server'

const STAFF_ROLES = ['admin', 'manager', 'staff'] as const

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

export function isStaffRoleName(role: string | null | undefined): boolean {
  return Boolean(role && STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]))
}

/** Client-side helper using the browser supabase client shape */
export async function fetchIsStaffClient(
  supabase: { from: (table: string) => any },
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)

  if (!data) return false
  return data.some((row: any) => STAFF_ROLES.includes(row.roles?.name))
}
