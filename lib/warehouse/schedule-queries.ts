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
    selectedDate: string,
    options?: { from?: string; to?: string }
): Promise<WarehouseTask[]> {
    let base = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('task_type', 'warehouse')

    if (options?.from && options?.to) {
        base = base.gte('due_date', options.from).lte('due_date', options.to)
    } else {
        base = base.eq('due_date', selectedDate)
    }

    const withScheduleOrder = await base
        .order('due_date', { ascending: true })
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
        let fallback = supabase
            .from('tasks')
            .select(TASK_SELECT)
            .eq('task_type', 'warehouse')

        if (options?.from && options?.to) {
            fallback = fallback.gte('due_date', options.from).lte('due_date', options.to)
        } else {
            fallback = fallback.eq('due_date', selectedDate)
        }

        const fallbackResult = await fallback.order('created_at', { ascending: false })

        if (fallbackResult.error) {
            console.error('Warehouse schedule tasks query failed:', fallbackResult.error.message)
            return []
        }

        return normalizeTasks(fallbackResult.data || [])
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
