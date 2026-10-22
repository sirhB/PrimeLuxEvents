/** LEGACY Preferred Partner profiles (read-only; superseded by planner membership). */
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

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
  brand_display_name: string | null
  brand_logo_url: string | null
  brand_accent_color: string | null
  brand_tagline: string | null
  business_email: string | null
  business_address: string | null
  business_city: string | null
  business_region: string | null
  business_postal: string | null
  invoice_footer_note: string | null
  approved_at: string | null
  created_at: string
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
