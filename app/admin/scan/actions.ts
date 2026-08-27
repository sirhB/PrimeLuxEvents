'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { adjustInventory } from '@/app/admin/inventory/actions'
import type { ChecklistItem } from '@/lib/warehouse/types'

export async function updateProductStock(id: string, adjustment: number) {
    const reason = adjustment > 0 ? 'Scanner stock increase' : 'Scanner stock decrease'
    const result = await adjustInventory(id, adjustment, reason)

    if (!result.success) {
        throw new Error(result.error || 'Failed to update stock')
    }

    const supabase = await createClient()
    const { data: product } = await supabase
        .from('products')
        .select('quantity_available')
        .eq('id', id)
        .single()

    revalidatePath('/admin/products')
    revalidatePath('/admin/scan')
    revalidatePath('/admin/inventory')

    return { success: true, newStock: product?.quantity_available ?? 0 }
}

export async function markPickItemComplete(
    taskId: string,
    productId: string
): Promise<{ success: boolean; error?: string; allComplete?: boolean }> {
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
            item.product_id === productId
                ? {
                      ...item,
                      completed: true,
                      completed_at: new Date().toISOString(),
                      completed_by: user?.id,
                  }
                : item
        )

        const allComplete = checklist.length > 0 && checklist.every((i) => i.completed)
        const updateData: Record<string, unknown> = {
            checklist,
            updated_at: new Date().toISOString(),
        }

        if (task.status === 'pending') {
            updateData.status = 'in_progress'
        }

        const { error } = await supabase.from('tasks').update(updateData).eq('id', taskId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/warehouse/schedule')
        revalidatePath('/admin/scan')
        return { success: true, allComplete }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function getPickTaskForOrder(orderId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('tasks')
        .select('id, checklist, status, warehouse_category')
        .eq('order_id', orderId)
        .in('warehouse_category', ['pick', 'pack'])
        .order('warehouse_category')
        .limit(1)
        .maybeSingle()
    return data
}
