import type { MembershipStatus, TerminationReason } from './policy'
import type { CartLimits } from '@/lib/carts/types'

export type MemberRow = { id: string; name: string; email: string; status: MembershipStatus; periodEnd: string | null; terminatedReason: TerminationReason | null; banned: boolean; eventCount: number }
export type EligCategory = { id: string; name: string; rule: boolean | null }
export type EligProduct = { id: string; name: string; categoryId: string | null; categoryName: string; rule: boolean | null; effective: boolean }
export type LeadOption = { id: string; title: string; plannerId: string | null }

export type MembersDeskData = {
  members: MemberRow[]
  categories: EligCategory[]
  products: EligProduct[]
  leads: LeadOption[]
  limits: CartLimits
}
