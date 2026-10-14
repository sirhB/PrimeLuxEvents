'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function completePasswordChange(password: string): Promise<{ success: boolean; error?: string }> {
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    return { success: false, error: 'Password must be between 8 and 200 characters' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You need to sign in again' }

  const admin = createServiceRoleClient()
  const { error: passwordError } = await admin.auth.admin.updateUserById(user.id, { password })
  if (passwordError) return { success: false, error: passwordError.message }

  const { error: flagError } = await admin
    .from('user_profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)
  if (flagError) return { success: false, error: flagError.message }

  const jar = await cookies()
  jar.delete('admin-auth-cache')
  return { success: true }
}
