import { createClient } from '@/lib/supabase/server'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/status'
import { subDays, format, startOfDay } from 'date-fns'

export type FulfillmentBucket = 'delivery' | 'customer_pickup' | 'unknown'

export type OpsIntelligenceMetrics = {
  rangeDays: number
  since: string
  gmvCents: number
  orderCount: number
  avgOrderValueCents: number
  cancelledCount: number
  cancelledGmvCents: number
  fulfillmentMix: Array<{
    method: FulfillmentBucket
    label: string
    count: number
    gmvCents: number
    pct: number
  }>
  statusFunnel: Array<{
    status: string
    label: string
    count: number
    gmvCents: number
  }>
  dailyGmv: Array<{
    date: string
    formattedDate: string
    gmvCents: number
    orderCount: number
  }>
}

type OrderRow = {
  id: string
  status: string | null
  total_amount: number | null
  created_at: string
  fulfillment_method?: string | null
  same_day_pickup?: boolean | null
  delivery_address?: string | null
  delivery_fee?: number | null
}

const FUNNEL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'completed']

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const FULFILLMENT_LABELS: Record<FulfillmentBucket, string> = {
  delivery: 'Delivery',
  customer_pickup: 'Customer pickup',
  unknown: 'Unspecified',
}

function classifyFulfillment(row: OrderRow): FulfillmentBucket {
  const method = row.fulfillment_method?.trim().toLowerCase()
  if (method === 'delivery' || method === 'customer_pickup') {
    return method
  }
  if (row.same_day_pickup === true) return 'customer_pickup'
  if (row.delivery_address) return 'delivery'
  if ((row.delivery_fee ?? 0) > 0) return 'delivery'
  return 'unknown'
}

export async function loadOpsIntelligence(rangeDays = 30): Promise<OpsIntelligenceMetrics> {
  const days = Math.min(Math.max(rangeDays, 7), 365)
  const sinceDate = startOfDay(subDays(new Date(), days))
  const since = sinceDate.toISOString()

  const supabase = await createClient()

  // Prefer richer columns when present; fall back if PostgREST rejects unknown columns.
  let rows: OrderRow[] = []
  const rich = await supabase
    .from('orders')
    .select(
      'id, status, total_amount, created_at, fulfillment_method, same_day_pickup, delivery_address, delivery_fee',
    )
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  if (rich.error) {
    const basic = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, same_day_pickup, delivery_address, delivery_fee')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (basic.error) {
      console.error('Ops intelligence order query failed:', basic.error.message)
      rows = []
    } else {
      rows = (basic.data || []) as OrderRow[]
    }
  } else {
    rows = (rich.data || []) as OrderRow[]
  }

  let gmvCents = 0
  let orderCount = 0
  let cancelledCount = 0
  let cancelledGmvCents = 0

  const fulfillmentMap = new Map<FulfillmentBucket, { count: number; gmvCents: number }>()
  const statusMap = new Map<string, { count: number; gmvCents: number }>()
  const dailyMap = new Map<string, { gmvCents: number; orderCount: number }>()

  for (const row of rows) {
    const amount = Number(row.total_amount) || 0
    const status = (row.status || 'pending').toLowerCase()
    const isCancelled = status === 'cancelled'

    if (isCancelled) {
      cancelledCount += 1
      cancelledGmvCents += amount
    } else {
      gmvCents += amount
      orderCount += 1

      const bucket = classifyFulfillment(row)
      const f = fulfillmentMap.get(bucket) || { count: 0, gmvCents: 0 }
      f.count += 1
      f.gmvCents += amount
      fulfillmentMap.set(bucket, f)

      const dayKey = format(new Date(row.created_at), 'yyyy-MM-dd')
      const d = dailyMap.get(dayKey) || { gmvCents: 0, orderCount: 0 }
      d.gmvCents += amount
      d.orderCount += 1
      dailyMap.set(dayKey, d)
    }

    const s = statusMap.get(status) || { count: 0, gmvCents: 0 }
    s.count += 1
    s.gmvCents += amount
    statusMap.set(status, s)
  }

  const fulfillmentMix = (['delivery', 'customer_pickup', 'unknown'] as FulfillmentBucket[])
    .map((method) => {
      const entry = fulfillmentMap.get(method) || { count: 0, gmvCents: 0 }
      return {
        method,
        label: FULFILLMENT_LABELS[method],
        count: entry.count,
        gmvCents: entry.gmvCents,
        pct: orderCount > 0 ? Math.round((entry.count / orderCount) * 1000) / 10 : 0,
      }
    })
    .filter((m) => m.count > 0 || m.method !== 'unknown')

  const statusFunnel = [
    ...FUNNEL_STATUSES.map((status) => {
      const entry = statusMap.get(status) || { count: 0, gmvCents: 0 }
      return {
        status,
        label: STATUS_LABELS[status] || status,
        count: entry.count,
        gmvCents: entry.gmvCents,
      }
    }),
    ...(statusMap.has('cancelled')
      ? [
          {
            status: 'cancelled',
            label: STATUS_LABELS.cancelled,
            count: statusMap.get('cancelled')!.count,
            gmvCents: statusMap.get('cancelled')!.gmvCents,
          },
        ]
      : []),
    ...[...statusMap.keys()]
      .filter((s) => !ORDER_STATUSES.includes(s as OrderStatus))
      .map((status) => ({
        status,
        label: STATUS_LABELS[status] || status,
        count: statusMap.get(status)!.count,
        gmvCents: statusMap.get(status)!.gmvCents,
      })),
  ]

  const dailyGmv = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      formattedDate: format(new Date(date + 'T12:00:00'), 'MMM dd'),
      gmvCents: v.gmvCents,
      orderCount: v.orderCount,
    }))

  return {
    rangeDays: days,
    since,
    gmvCents,
    orderCount,
    avgOrderValueCents: orderCount > 0 ? Math.round(gmvCents / orderCount) : 0,
    cancelledCount,
    cancelledGmvCents,
    fulfillmentMix,
    statusFunnel,
    dailyGmv,
  }
}
