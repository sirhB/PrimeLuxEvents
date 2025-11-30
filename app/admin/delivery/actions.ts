'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateDeliveryData {
    orderId: string
    taskType: 'delivery' | 'pickup' | 'return_trip'
    scheduledDate: string
    scheduledTime?: string
    address: string
    instructions?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
}

export interface UpdateDeliveryData {
    taskType?: 'delivery' | 'pickup' | 'return_trip'
    scheduledDate?: string
    scheduledTime?: string
    address?: string
    instructions?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
    status?: 'pending' | 'in_progress' | 'completed'
    routeOrder?: number
}

export async function createDeliveryTask(data: CreateDeliveryData) {
    try {
        const supabase = await createClient()

        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({
                order_id: data.orderId,
                task_type: data.taskType,
                title: `${data.taskType === 'delivery' ? 'Delivery' : data.taskType === 'pickup' ? 'Pickup' : 'Return'} - ${data.address}`,
                due_date: data.scheduledDate,
                priority: data.priority || 'medium',
                status: 'pending',
                assigned_to: data.assignedTo || null,
                description: data.instructions || null,
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/delivery')
        return { success: true, data: newTask }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateDeliveryTask(taskId: string, data: UpdateDeliveryData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.taskType !== undefined) updateData.task_type = data.taskType
        if (data.scheduledDate !== undefined) updateData.due_date = data.scheduledDate
        if (data.priority !== undefined) updateData.priority = data.priority
        if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo
        if (data.instructions !== undefined) updateData.description = data.instructions
        if (data.status !== undefined) updateData.status = data.status
        if (data.routeOrder !== undefined) updateData.route_order = data.routeOrder

        const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/delivery')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function deleteDeliveryTask(taskId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('tasks').delete().eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/delivery')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateDeliveryStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed') {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/delivery')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function reorderDeliveryRoute(taskIds: string[], routeOrder: Record<string, number>) {
    try {
        const supabase = await createClient()

        // Update all tasks with their new route order
        const updates = taskIds.map((taskId) =>
            supabase.from('tasks').update({ route_order: routeOrder[taskId] }).eq('id', taskId)
        )

        const results = await Promise.all(updates)
        const hasError = results.some((result) => result.error)

        if (hasError) {
            return { success: false, error: 'Failed to update route order for some tasks' }
        }

        revalidatePath('/admin/delivery')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
