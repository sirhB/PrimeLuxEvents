export const PLAN_EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Shower', 'Private dinner', 'Anniversary', 'Other'] as const
export const PLAN_BUDGETS = ['Under $2,500', '$2,500–$7,500', '$7,500–$15,000', '$15,000–$30,000', '$30,000 and above'] as const
export const PLAN_GUEST_PRESETS = [25, 50, 100, 150, 200] as const
export const LEAD_COOKIE = 'pl_lead'
export const LEAD_STORAGE_KEY = 'primelux-lead'
/** Days without checkout after which an open cart counts as abandoned. */
export const CART_ABANDON_DAYS = 3

export type PlanLeadDraft = {
  event_type: string
  event_date: string
  date_unsure: boolean
  guest_count: string
  location_choice: 'primelux' | 'own' | 'tbd' | ''
  venue_id: string
  location_detail: string
  budget_range: string
  contact_name: string
  contact_email: string
  contact_phone: string
  consent: boolean
  website: string
}

export const EMPTY_PLAN_DRAFT: PlanLeadDraft = {
  event_type: '',
  event_date: '',
  date_unsure: false,
  guest_count: '',
  location_choice: '',
  venue_id: '',
  location_detail: '',
  budget_range: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  consent: false,
  website: '',
}

export type LeadCartStatus = 'open' | 'abandoned' | 'checked_out' | 'empty' | 'none'

export function cartStatus(cart: { item_count: number; updated_at: string; checked_out_at: string | null } | null | undefined, now = Date.now(), days = CART_ABANDON_DAYS): LeadCartStatus {
  if (!cart) return 'none'
  if (cart.checked_out_at) return 'checked_out'
  if (cart.item_count === 0) return 'empty'
  return now - new Date(cart.updated_at).getTime() > days * 86_400_000 ? 'abandoned' : 'open'
}
