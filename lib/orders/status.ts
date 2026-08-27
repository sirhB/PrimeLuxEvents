/** Values accepted by the production `order_status` enum on orders.status. */
export const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'delivered',
    'completed',
    'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Statuses that should have warehouse pick/pack/load tasks generated. */
export const WAREHOUSE_ELIGIBLE_ORDER_STATUSES: readonly OrderStatus[] = ['confirmed']

export function isWarehouseEligibleOrderStatus(status: string | null | undefined): boolean {
    if (!status) return false
    return WAREHOUSE_ELIGIBLE_ORDER_STATUSES.includes(status as OrderStatus)
}

/** Orders visible in scanner picking mode. */
export const ACTIVE_FULFILLMENT_ORDER_STATUSES: readonly OrderStatus[] = ['confirmed']

export function isActiveFulfillmentOrderStatus(status: string | null | undefined): boolean {
    if (!status) return false
    return ACTIVE_FULFILLMENT_ORDER_STATUSES.includes(status as OrderStatus)
}
