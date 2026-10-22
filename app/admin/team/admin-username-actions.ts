'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/authorization'
import { SUPER_ADMIN_ROLE, isSuperAdmin } from '@/lib/auth/permission-catalog'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { isValidUsername, normalizeUsername, syntheticAdminEmail } from '@/lib/auth/username'
import { generateTempPassword } from '@/lib/auth/temp-password'

export type CreateAdminResult =
  | { success: true; username: string; tempPassword: string }
  | { success: false; error: string }

/**
 * Super admin only. Creates a staff account that signs in with a username.
 * The temporary password is returned once for the super admin to hand over
 * privately; it is never stored in plain text and must be changed on first login.
 */
export async function createAdminWithUsername(input: {
  username: string
  displayName: string
  roleId: string
  email?: string
}): Promise<CreateAdminResult> {
  const actor = await getCurrentUser()
  if (!actor || !isSuperAdmin(actor)) {
    return { success: false, error: 'Only a super admin can create admin logins' }
  }

  const username = normalizeUsername(input.username)
  if (!isValidUsername(username)) {
    return { success: false, error: 'Username must be 3-32 characters: a-z, 0-9, dot, dash or underscore' }
  }
  const displayName = (input.displayName || '').trim().slice(0, 120)
  if (!displayName) return { success: false, error: 'Display name is required' }
  const realEmail = (input.email || '').trim().toLowerCase()
  if (realEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) {
    return { success: false, error: 'Email is not valid' }
  }
  const email = realEmail || syntheticAdminEmail(username)

  const admin = createServiceRoleClient()

  const { data: role } = await admin.from('roles').select('id, name').eq('id', input.roleId).maybeSingle()
  if (!role) return { success: false, error: 'Role not found' }

  const { data: taken } = await admin.from('user_profiles').select('id').eq('username', username).maybeSingle()
  if (taken) return { success: false, error: 'That username is already in use' }

  const tempPassword = generateTempPassword()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: displayName, username },
  })
  if (createError || !created.user) {
    return { success: false, error: createError?.message || 'Could not create the account' }
  }
  const userId = created.user.id

  const { error: profileError } = await admin.from('user_profiles').upsert(
    {
      id: userId,
      email,
      username,
      full_name: displayName,
      is_active: true,
      must_change_password: true,
    },
    { onConflict: 'id' },
  )
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { success: false, error: profileError.message }
  }

  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role_id: role.id,
    assigned_by: actor.id,
  })
  if (roleError) {
    await admin.auth.admin.deleteUser(userId)
    return { success: false, error: roleError.message }
  }

  revalidatePath('/admin/team')
  return { success: true, username, tempPassword }
}

export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const actor = await getCurrentUser()
  return Boolean(actor && actor.roles?.some((r) => r.name === SUPER_ADMIN_ROLE))
}
