import type { User } from '@supabase/supabase-js'

export type OrderOwnershipFields = {
  user_id?: string | null
  customer_email?: string | null
}

export function userOwnsOrder(user: User | null | undefined, order: OrderOwnershipFields | null | undefined): boolean {
  if (!user || !order) return false
  if (order.user_id && order.user_id === user.id) return true
  if (order.customer_email && user.email) {
    return order.customer_email.toLowerCase() === user.email.toLowerCase()
  }
  return false
}

export function normalizePaymentStatus(status: string | null | undefined): string {
  if (!status) return 'unpaid'
  if (status === 'succeeded') return 'paid'
  return status
}

export function isOrderFullyPaid(order: {
  payment_status?: string | null
  balance_paid?: number | null
  total_amount?: number | null
}): boolean {
  const status = normalizePaymentStatus(order.payment_status)
  if (status === 'paid') return true
  const paid = order.balance_paid ?? 0
  const total = order.total_amount ?? 0
  return total > 0 && paid >= total
}
