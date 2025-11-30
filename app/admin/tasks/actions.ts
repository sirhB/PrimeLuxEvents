'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateTaskData {
    title: string
    description?: string
    taskType: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'completed'
    assignedTo?: string
    dueDate?: string
    orderId?: string
}

export interface UpdateTaskData {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    status?: 'pending' | 'in_progress' | 'completed'
    assignedTo?: string
    dueDate?: string
}

export async function createTask(data: CreateTaskData) {
    try {
        const supabase = await createClient()

        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({
                title: data.title,
                description: data.description || null,
                task_type: data.taskType,
                priority: data.priority,
                status: data.status,
                assigned_to: data.assignedTo || null,
                due_date: data.dueDate || null,
                order_id: data.orderId || null,
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/tasks')
        return { success: true, data: newTask }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateTask(taskId: string, data: UpdateTaskData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.title !== undefined) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.priority !== undefined) updateData.priority = data.priority
        if (data.status !== undefined) updateData.status = data.status
        if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo
        if (data.dueDate !== undefined) updateData.due_date = data.dueDate

        const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/tasks')
        revalidatePath(`/admin/tasks/${taskId}`)
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function deleteTask(taskId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('tasks').delete().eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/tasks')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed') {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/tasks')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
