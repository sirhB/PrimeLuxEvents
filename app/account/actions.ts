'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizePostgrestFilterValue } from '@/lib/supabase/filter-sanitize'

export async function claimOrdersForCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { claimed: 0 }

  const { data, error } = await supabase.rpc('customer_claim_orders')

  if (error) {
    console.error('Failed to claim orders:', error)
    return { claimed: 0 }
  }

  const claimed = typeof data === 'number' ? data : 0
  if (claimed > 0) {
    revalidatePath('/account')
    revalidatePath('/account/orders')
  }

  return { claimed }
}

export async function toggleFavorite(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sign in required', favorited: false }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
    if (error) return { success: false, error: error.message, favorited: true }
    revalidatePath('/account/favorites')
    return { success: true, favorited: false }
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    product_id: productId,
  })
  if (error) return { success: false, error: error.message, favorited: false }
  revalidatePath('/account/favorites')
  return { success: true, favorited: true }
}

export async function requestAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { success: false, error: 'Not signed in' }

  await supabase.auth.updateUser({
    data: { deletion_requested_at: new Date().toISOString() },
  })

  // Notify staff via admin notifications when table exists
  try {
    await supabase.from('admin_notifications').insert({
      title: 'Account deletion requested',
      message: `${user.email} requested account deletion`,
      type: 'system',
      link: '/admin/customers',
    })
  } catch {
    // non-blocking
  }

  revalidatePath('/account/settings')
  return { success: true }
}

export async function bookShowroomAppointment(data: {
  appointmentDate: string
  appointmentTime: string
  notes?: string
  location?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sign in required' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, phone, email')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('appointments').insert({
    user_id: user.id,
    client_name: profile?.full_name || user.email?.split('@')[0] || 'Client',
    client_email: profile?.email || user.email,
    client_phone: profile?.phone || null,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    location: data.location || 'Showroom',
    notes: data.notes || null,
    status: 'scheduled',
    created_by: user.email || 'portal',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account/appointments')
  revalidatePath('/admin/appointments')
  return { success: true }
}

export async function cancelOwnAppointment(appointmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sign in required' }

  // Prefer user_id ownership; also allow email match with sanitized value only
  const email = sanitizePostgrestFilterValue(user.email || '', 200)
  const orParts = [`user_id.eq.${user.id}`]
  if (email) orParts.push(`client_email.ilike.${email}`)

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .or(orParts.join(','))

  if (error) return { success: false, error: error.message }
  revalidatePath('/account/appointments')
  return { success: true }
}
