'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    generateWarehouseTasksForDeliveryDate,
    generateWarehouseTasksForOrder,
    syncVehicleLoadToDelivery,
} from '@/lib/warehouse/task-generator'
import type { ChecklistItem, WarehouseCategory } from '@/lib/warehouse/types'
import { WAREHOUSE_CATEGORIES } from '@/lib/warehouse/types'

function revalidateWarehousePaths() {
    revalidatePath('/admin/warehouse/schedule')
    revalidatePath('/admin/calendar')
    revalidatePath('/admin/tasks')
    revalidatePath('/admin/delivery')
    revalidatePath('/admin/pack-slip')
}

export interface CreateWarehouseTaskData {
    title: string
    description?: string
    warehouseCategory: WarehouseCategory
    dueDate: string
    scheduledStart?: string
    estimatedMinutes?: number
    assignedTo?: string
    assignedRoleId?: string
    orderId?: string
    checklist?: ChecklistItem[]
    priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export async function createWarehouseTask(data: CreateWarehouseTaskData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { data: task, error } = await supabase
            .from('tasks')
            .insert({
                title: data.title,
                description: data.description || null,
                status: 'pending',
                priority: data.priority || 'medium',
                task_type: 'warehouse',
                warehouse_category: data.warehouseCategory,
                due_date: data.dueDate,
                scheduled_start: data.scheduledStart || null,
                estimated_minutes: data.estimatedMinutes || null,
                assigned_to: data.assignedTo || null,
                assigned_role_id: data.assignedRoleId || null,
                order_id: data.orderId || null,
                checklist: data.checklist || [],
                created_by: user?.id || null,
            })
            .select()
            .single()

        if (error) return { success: false, error: error.message }

        revalidateWarehousePaths()
        return { success: true, data: task }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function updateWarehouseTaskStatus(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString(),
        }

        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString()
            updateData.completed_by = user?.id || null
        }

        const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)

        if (error) return { success: false, error: error.message }

        if (status === 'completed') {
            const { data: task } = await supabase
                .from('tasks')
                .select('warehouse_category')
                .eq('id', taskId)
                .single()

            if (task?.warehouse_category === 'vehicle_load') {
                await syncVehicleLoadToDelivery(supabase, taskId)
            }
        }

        revalidateWarehousePaths()
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function updateChecklistItem(
    taskId: string,
    itemId: string,
    completed: boolean
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('checklist, status')
            .eq('id', taskId)
            .single()

        if (fetchError || !task) {
            return { success: false, error: 'Task not found' }
        }

        const checklist: ChecklistItem[] = (task.checklist || []).map((item: ChecklistItem) =>
            item.id === itemId
                ? {
                      ...item,
                      completed,
                      completed_at: completed ? new Date().toISOString() : undefined,
                      completed_by: completed ? user?.id : undefined,
                  }
                : item
        )

        const allComplete = checklist.length > 0 && checklist.every((i) => i.completed)
        const updateData: Record<string, unknown> = {
            checklist,
            updated_at: new Date().toISOString(),
        }

        if (task.status === 'pending' && completed) {
            updateData.status = 'in_progress'
        }

        const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)

        if (error) return { success: false, error: error.message }

        revalidateWarehousePaths()
        return { success: true, allComplete }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function completeWarehouseTask(
    taskId: string,
    notes?: string,
    imageUrl?: string
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { data: task } = await supabase
            .from('tasks')
            .select('warehouse_category')
            .eq('id', taskId)
            .single()

        const { error } = await supabase
            .from('tasks')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                completed_by: user?.id || null,
                completion_notes: notes || null,
                completion_image_url: imageUrl || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taskId)

        if (error) return { success: false, error: error.message }

        if (task?.warehouse_category === 'vehicle_load') {
            await syncVehicleLoadToDelivery(supabase, taskId)
        }

        revalidateWarehousePaths()
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function reassignWarehouseTask(
    taskId: string,
    assignedTo?: string | null,
    assignedRoleId?: string | null
) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('tasks')
            .update({
                assigned_to: assignedTo || null,
                assigned_role_id: assignedRoleId || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taskId)

        if (error) return { success: false, error: error.message }

        revalidateWarehousePaths()
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function generateTasksForOrder(orderId: string) {
    const supabase = await createClient()
    const result = await generateWarehouseTasksForOrder(supabase, orderId)
    if (result.success) revalidateWarehousePaths()
    return result
}

export async function generateTasksForDeliveryDate(deliveryDate: string) {
    const supabase = await createClient()
    const result = await generateWarehouseTasksForDeliveryDate(supabase, deliveryDate)
    if (result.generated > 0) revalidateWarehousePaths()
    return result
}

export async function generateRecurringTasks(date?: string) {
    try {
        const supabase = await createClient()
        const targetDate = date || new Date().toISOString().split('T')[0]
        const dayName = new Date(targetDate + 'T12:00:00')
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase()

        const { data: templates, error } = await supabase
            .from('warehouse_task_templates')
            .select('*')
            .eq('is_active', true)

        if (error) return { success: false, error: error.message, created: 0 }

        let created = 0
        for (const template of templates || []) {
            const rule = template.recurrence_rule as string
            const matches =
                rule === `weekly:${dayName}` ||
                rule === 'daily' ||
                (rule.startsWith('weekly:') && rule.endsWith(dayName))

            if (!matches) continue

            const { data: existing } = await supabase
                .from('tasks')
                .select('id')
                .eq('title', template.title)
                .eq('due_date', targetDate)
                .eq('is_recurring', true)
                .maybeSingle()

            if (existing) continue

            const { error: insertError } = await supabase.from('tasks').insert({
                title: template.title,
                description: template.description,
                status: 'pending',
                priority: 'medium',
                task_type: 'warehouse',
                warehouse_category: template.warehouse_category,
                assigned_role_id: template.assigned_role_id,
                due_date: targetDate,
                checklist: template.checklist || [],
                estimated_minutes: template.estimated_minutes,
                is_recurring: true,
                recurrence_rule: template.recurrence_rule,
            })

            if (!insertError) created++
        }

        revalidateWarehousePaths()
        return { success: true, created }
    } catch (error) {
        return {
            success: false,
            created: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

export async function getWarehouseTasksForDate(date: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            orders (
                id,
                customer_name,
                delivery_address,
                delivery_time,
                delivery_date
            )
        `)
        .eq('task_type', 'warehouse')
        .eq('due_date', date)
        .order('scheduled_start', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })

    if (error) return { success: false, error: error.message, tasks: [] }
    return { success: true, tasks: data || [] }
}

export async function updateChecklistFromOrder(
    taskId: string,
    orderId: string
) {
    try {
        const supabase = await createClient()

        const { data: orderItems, error } = await supabase
            .from('order_items')
            .select('product_id, quantity, products(name)')
            .eq('order_id', orderId)

        if (error) return { success: false, error: error.message }

        const checklist: ChecklistItem[] = (orderItems || []).map((item, index) => ({
            id: `item-${item.product_id}-${index}`,
            label: (item.products as { name: string } | null)?.name || 'Product',
            product_id: item.product_id,
            qty: item.quantity,
            completed: false,
        }))

        await supabase
            .from('tasks')
            .update({ checklist, updated_at: new Date().toISOString() })
            .eq('id', taskId)

        revalidateWarehousePaths()
        return { success: true, checklist }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function updateTaskChecklist(taskId: string, checklist: ChecklistItem[]) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('tasks')
            .update({ checklist, updated_at: new Date().toISOString() })
            .eq('id', taskId)

        if (error) return { success: false, error: error.message }

        revalidateWarehousePaths()
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function getPickTaskForOrder(orderId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('tasks')
        .select('id, warehouse_category, status, checklist')
        .eq('order_id', orderId)
        .eq('warehouse_category', 'pick')
        .maybeSingle()
    return data
}

export async function getPackTaskForOrder(orderId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('tasks')
        .select('id, warehouse_category, status, checklist')
        .eq('order_id', orderId)
        .eq('warehouse_category', 'pack')
        .maybeSingle()
    return data
}

// Staff shifts
export async function getShiftsForWeek(startDate: string) {
    const supabase = await createClient()
    const end = new Date(startDate + 'T12:00:00')
    end.setDate(end.getDate() + 6)
    const endDate = end.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('staff_shifts')
        .select(`
            *,
            user_profiles (id, full_name, email)
        `)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date')

    if (error) return { success: false, error: error.message, shifts: [] }
    return { success: true, shifts: data || [] }
}

export async function upsertStaffShift(data: {
    userId: string
    shiftDate: string
    startTime?: string
    endTime?: string
    notes?: string
}) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('staff_shifts').upsert(
            {
                user_id: data.userId,
                shift_date: data.shiftDate,
                start_time: data.startTime || null,
                end_time: data.endTime || null,
                notes: data.notes || null,
            },
            { onConflict: 'user_id,shift_date' }
        )

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/team/shifts')
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function deleteStaffShift(shiftId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('staff_shifts').delete().eq('id', shiftId)
        if (error) return { success: false, error: error.message }
        revalidatePath('/admin/team/shifts')
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

