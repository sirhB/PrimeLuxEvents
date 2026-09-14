import type { SupabaseClient } from '@supabase/supabase-js'
import { isWarehouseEligibleOrderStatus } from '@/lib/orders/status'
import type { ChecklistItem, WarehouseCategory, WarehouseTask } from '@/lib/warehouse/types'
import { eachDateInRange, type WeekendWindow } from '@/lib/warehouse/weekend'

export type PrepReadiness =
  | 'not_started'
  | 'in_progress'
  | 'ready'
  | 'loaded'
  | 'delivered'

export const PREP_READINESS_LABELS: Record<PrepReadiness, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  loaded: 'Loaded',
  delivered: 'Delivered',
}

export type StageStatus = {
  status: 'missing' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  taskId?: string
  progress?: number
}

export type WeekPrepOrderRow = {
  orderId: string
  customerName: string
  deliveryDate: string
  deliveryTime: string | null
  deliveryAddress: string | null
  orderStatus: string
  pick: StageStatus
  pack: StageStatus
  load: StageStatus
  delivery: StageStatus
  bagsAssigned: number
  bagsPacked: number
  readiness: PrepReadiness
}

export type WeekPrepSummary = Record<PrepReadiness, number> & { total: number }

function checklistProgress(checklist: ChecklistItem[] | undefined): number {
  if (!checklist || checklist.length === 0) return 0
  const done = checklist.filter((item) => item.completed).length
  return Math.round((done / checklist.length) * 100)
}

function stageFromTask(task: WarehouseTask | undefined): StageStatus {
  if (!task) return { status: 'missing' }
  return {
    status: task.status,
    taskId: task.id,
    progress: checklistProgress(task.checklist),
  }
}

export function computeOrderReadiness(input: {
  orderStatus: string
  pick: StageStatus
  pack: StageStatus
  load: StageStatus
  delivery: StageStatus
}): PrepReadiness {
  if (input.orderStatus === 'delivered' || input.orderStatus === 'completed') {
    return 'delivered'
  }
  if (input.delivery.status === 'completed' || input.load.status === 'completed') {
    return 'loaded'
  }
  if (input.delivery.status === 'in_progress') {
    return 'loaded'
  }
  if (input.pick.status === 'completed' && input.pack.status === 'completed') {
    return 'ready'
  }
  const anyStarted =
    input.pick.status === 'in_progress' ||
    input.pick.status === 'completed' ||
    input.pack.status === 'in_progress' ||
    input.pack.status === 'completed' ||
    input.load.status === 'in_progress' ||
    (input.pick.progress ?? 0) > 0 ||
    (input.pack.progress ?? 0) > 0
  return anyStarted ? 'in_progress' : 'not_started'
}

function emptySummary(): WeekPrepSummary {
  return {
    not_started: 0,
    in_progress: 0,
    ready: 0,
    loaded: 0,
    delivered: 0,
    total: 0,
  }
}

export function summarizeReadiness(rows: WeekPrepOrderRow[]): WeekPrepSummary {
  const summary = emptySummary()
  for (const row of rows) {
    summary[row.readiness] += 1
    summary.total += 1
  }
  return summary
}

export async function fetchWeekPrepCohort(
  supabase: SupabaseClient,
  window: WeekendWindow,
): Promise<{ rows: WeekPrepOrderRow[]; summary: WeekPrepSummary }> {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, customer_name, delivery_date, delivery_time, delivery_address, status')
    .gte('delivery_date', window.start)
    .lte('delivery_date', window.end)
    .neq('status', 'cancelled')
    .order('delivery_date', { ascending: true })

  if (ordersError) {
    console.error('Week prep orders query failed:', ordersError.message)
    return { rows: [], summary: emptySummary() }
  }

  const cohort = (orders || []).filter(
    (order) =>
      isWarehouseEligibleOrderStatus(order.status) ||
      order.status === 'delivered' ||
      order.status === 'completed',
  )

  if (cohort.length === 0) {
    return { rows: [], summary: emptySummary() }
  }

  const orderIds = cohort.map((order) => order.id)

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, status, task_type, warehouse_category, order_id, checklist, due_date')
    .in('order_id', orderIds)
    .in('task_type', ['warehouse', 'delivery'])

  if (tasksError) {
    console.error('Week prep tasks query failed:', tasksError.message)
  }

  const { data: bagRows, error: bagsError } = await supabase
    .from('bag_assignments')
    .select('order_id, warehouse_bags ( status )')
    .in('order_id', orderIds)

  if (bagsError && !bagsError.message.includes('does not exist')) {
    console.error('Week prep bags query failed:', bagsError.message)
  }

  const tasksByOrder = new Map<string, WarehouseTask[]>()
  for (const task of (tasks || []) as WarehouseTask[]) {
    if (!task.order_id) continue
    const list = tasksByOrder.get(task.order_id) || []
    list.push({
      ...task,
      checklist: Array.isArray(task.checklist) ? task.checklist : [],
    })
    tasksByOrder.set(task.order_id, list)
  }

  const bagsByOrder = new Map<string, { assigned: number; packed: number }>()
  for (const row of bagRows || []) {
    const orderId = (row as { order_id?: string }).order_id
    if (!orderId) continue
    const current = bagsByOrder.get(orderId) || { assigned: 0, packed: 0 }
    current.assigned += 1
    const bag = (
      row as {
        warehouse_bags?: { status?: string } | Array<{ status?: string }> | null
      }
    ).warehouse_bags
    const status = Array.isArray(bag) ? bag[0]?.status : bag?.status
    if (status === 'packed' || status === 'shipped') current.packed += 1
    bagsByOrder.set(orderId, current)
  }

  const rows: WeekPrepOrderRow[] = cohort.map((order) => {
    const orderTasks = tasksByOrder.get(order.id) || []
    const pick = stageFromTask(
      orderTasks.find((t) => t.task_type === 'warehouse' && t.warehouse_category === 'pick'),
    )
    const pack = stageFromTask(
      orderTasks.find((t) => t.task_type === 'warehouse' && t.warehouse_category === 'pack'),
    )
    const load = stageFromTask(
      orderTasks.find(
        (t) => t.task_type === 'warehouse' && t.warehouse_category === 'vehicle_load',
      ),
    )
    const delivery = stageFromTask(orderTasks.find((t) => t.task_type === 'delivery'))
    const bags = bagsByOrder.get(order.id) || { assigned: 0, packed: 0 }
    const readiness = computeOrderReadiness({
      orderStatus: order.status,
      pick,
      pack,
      load,
      delivery,
    })

    return {
      orderId: order.id,
      customerName: order.customer_name || 'Customer',
      deliveryDate: order.delivery_date as string,
      deliveryTime: order.delivery_time,
      deliveryAddress: order.delivery_address,
      orderStatus: order.status,
      pick,
      pack,
      load,
      delivery,
      bagsAssigned: bags.assigned,
      bagsPacked: bags.packed,
      readiness,
    }
  })

  return { rows, summary: summarizeReadiness(rows) }
}

/** Warehouse tasks due Mon–Sun covering prep days + weekend delivery days. */
export async function fetchPrepWeekDueTasks(
  supabase: SupabaseClient,
  window: WeekendWindow,
): Promise<WarehouseTask[]> {
  const friday = new Date(`${window.start}T12:00:00`)
  const monday = new Date(friday)
  monday.setDate(friday.getDate() - 4)
  const prepDates = eachDateInRange(monday.toISOString().slice(0, 10), window.end)

  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
      *,
      orders (
        id,
        customer_name,
        delivery_address,
        delivery_time,
        delivery_date
      )
    `,
    )
    .eq('task_type', 'warehouse')
    .in('due_date', prepDates)
    .in('warehouse_category', ['pick', 'pack', 'vehicle_load'] as WarehouseCategory[])
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Prep week due tasks query failed:', error.message)
    return []
  }

  return (data || []).map((task) => {
    const row = task as WarehouseTask & { checklist?: unknown }
    return {
      ...row,
      checklist: Array.isArray(row.checklist) ? row.checklist : [],
    }
  })
}
