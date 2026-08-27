import { cache } from 'react'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'revoked'
export type PartnerTier = 'preferred' | 'elite' | 'house'
export type PartnerBusinessType = 'planner' | 'decorator' | 'designer' | 'other'

export type PartnerProfile = {
  id: string
  user_id: string
  company_name: string
  business_type: PartnerBusinessType
  website: string | null
  instagram: string | null
  phone: string | null
  status: PartnerStatus
  tier: PartnerTier
  base_discount_percent: number | null
  notes: string | null
  payment_zelle: string | null
  payment_venmo: string | null
  payment_apple_cash: string | null
  payment_cash_app: string | null
  payment_other_label: string | null
  payment_other_value: string | null
  payment_instructions: string | null
  approved_at: string | null
  created_at: string
}

export type PartnerTierSettings = {
  tier: PartnerTier
  label: string
  base_discount_percent: number
  hold_hours: number
}

const DEFAULT_TIER_DISCOUNTS: Record<PartnerTier, number> = {
  preferred: 10,
  elite: 15,
  house: 20,
}

export const getPartnerProfileForUser = cache(async (userId?: string): Promise<PartnerProfile | null> => {
  const supabase = await createClient()
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  if (!uid) return null

  const { data, error } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle()

  if (error || !data) return null
  return data as PartnerProfile
})

export async function isActivePartner(userId?: string): Promise<boolean> {
  const profile = await getPartnerProfileForUser(userId)
  return profile?.status === 'active'
}

export async function requireActivePartner(): Promise<PartnerProfile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be signed in')
  }
  const profile = await getPartnerProfileForUser(user.id)
  if (!profile || profile.status !== 'active') {
    throw new Error('Active Preferred Vendor partner status required')
  }
  return profile
}

export async function getPartnerTierSettings(tier: PartnerTier): Promise<PartnerTierSettings> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_tier_settings')
    .select('*')
    .eq('tier', tier)
    .maybeSingle()

  if (data) {
    return data as PartnerTierSettings
  }

  return {
    tier,
    label: tier.charAt(0).toUpperCase() + tier.slice(1),
    base_discount_percent: DEFAULT_TIER_DISCOUNTS[tier],
    hold_hours: 72,
  }
}

/** Effective base trade discount % for an active partner */
export async function getPartnerBaseDiscountPercent(profile: PartnerProfile): Promise<number> {
  if (typeof profile.base_discount_percent === 'number') {
    return profile.base_discount_percent
  }
  const settings = await getPartnerTierSettings(profile.tier)
  return settings.base_discount_percent
}

export async function assignPartnerRole(userId: string): Promise<void> {
  const admin = createServiceClient()
  const { data: role } = await admin
    .from('roles')
    .select('id')
    .eq('name', 'partner')
    .maybeSingle()

  if (!role) return

  const { data: existing } = await admin
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', role.id)
    .maybeSingle()

  if (!existing) {
    await admin.from('user_roles').insert({ user_id: userId, role_id: role.id })
  }
}

export async function removePartnerRole(userId: string): Promise<void> {
  const admin = createServiceClient()
  const { data: role } = await admin
    .from('roles')
    .select('id')
    .eq('name', 'partner')
    .maybeSingle()

  if (!role) return

  await admin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', role.id)
}
