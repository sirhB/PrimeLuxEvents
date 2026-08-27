import type { SupabaseClient } from '@supabase/supabase-js'
import type { WarehouseTask } from './types'

const TASK_SELECT = `
    *,
    orders (
        id,
        customer_name,
        delivery_address,
        delivery_time,
        delivery_date
    )
`

function normalizeTasks(raw: unknown[]): WarehouseTask[] {
    return raw.map((task) => {
        const row = task as WarehouseTask & { checklist?: unknown }
        return {
            ...row,
            checklist: Array.isArray(row.checklist) ? row.checklist : [],
        }
    })
}

export async function fetchWarehouseScheduleTasks(
    supabase: SupabaseClient,
    selectedDate: string
): Promise<WarehouseTask[]> {
    const base = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('task_type', 'warehouse')
        .eq('due_date', selectedDate)

    const withScheduleOrder = await base
        .order('scheduled_start', { ascending: true, nullsFirst: false })

    if (!withScheduleOrder.error) {
        return normalizeTasks(withScheduleOrder.data || [])
    }

    const message = withScheduleOrder.error.message || ''
    if (
        message.includes('scheduled_start') ||
        message.includes('warehouse_category') ||
        message.includes('does not exist')
    ) {
        const fallback = await supabase
            .from('tasks')
            .select(TASK_SELECT)
            .eq('task_type', 'warehouse')
            .eq('due_date', selectedDate)
            .order('created_at', { ascending: false })

        if (fallback.error) {
            console.error('Warehouse schedule tasks query failed:', fallback.error.message)
            return []
        }

        return normalizeTasks(fallback.data || [])
    }

    console.error('Warehouse schedule tasks query failed:', message)
    return []
}

export async function fetchStaffOnShift(
    supabase: SupabaseClient,
    selectedDate: string
): Promise<string[]> {
    const { data, error } = await supabase
        .from('staff_shifts')
        .select('user_id')
        .eq('shift_date', selectedDate)

    if (error) {
        if (!error.message.includes('does not exist')) {
            console.error('Staff shifts query failed:', error.message)
        }
        return []
    }

    return data?.map((s) => s.user_id) || []
}
