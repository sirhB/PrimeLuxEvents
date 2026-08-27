const STAFF_ROLES = ['admin', 'manager', 'staff'] as const

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

export { STAFF_ROLES }
