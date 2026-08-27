import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChecklistItem, WarehouseCategory } from './types'

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
}

function buildChecklistFromOrderItems(
    items: Array<{ product_id: string; quantity: number; products?: { name: string } | null }>
): ChecklistItem[] {
    return items.map((item, index) => ({
        id: `item-${item.product_id}-${index}`,
        label: item.products?.name || 'Product',
        product_id: item.product_id,
        qty: item.quantity,
        completed: false,
    }))
}

async function getWarehouseRoleId(supabase: SupabaseClient): Promise<string | null> {
    const { data } = await supabase.from('roles').select('id').eq('name', 'warehouse').maybeSingle()
    return data?.id ?? null
}

async function deleteExistingOrderWarehouseTasks(supabase: SupabaseClient, orderId: string) {
    await supabase
        .from('tasks')
        .delete()
        .eq('order_id', orderId)
        .eq('task_type', 'warehouse')
        .in('warehouse_category', ['pick', 'pack', 'vehicle_load', 'returns_checkin'])
}

export interface GenerateOrderTasksResult {
    success: boolean
    taskIds?: string[]
    error?: string
}

export async function generateWarehouseTasksForOrder(
    supabase: SupabaseClient,
    orderId: string
): Promise<GenerateOrderTasksResult> {
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_name, delivery_date, delivery_time, delivery_address, rental_end_date, status')
        .eq('id', orderId)
        .single()

    if (orderError || !order) {
        return { success: false, error: orderError?.message || 'Order not found' }
    }

    if (!order.delivery_date) {
        return { success: false, error: 'Order has no delivery date' }
    }

    if (!['confirmed', 'processing', 'out_for_delivery'].includes(order.status)) {
        return { success: false, error: 'Order status does not require warehouse tasks' }
    }

    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity, products(name)')
        .eq('order_id', orderId)

    if (itemsError) {
        return { success: false, error: itemsError.message }
    }

    const checklist = buildChecklistFromOrderItems(orderItems || [])
    const warehouseRoleId = await getWarehouseRoleId(supabase)

    await deleteExistingOrderWarehouseTasks(supabase, orderId)

    const deliveryDate = order.delivery_date as string
    const customerLabel = order.customer_name || 'Customer'

    const chain: Array<{
        category: WarehouseCategory
        title: string
        dueDate: string
        scheduledStart: string
        description: string
    }> = [
        {
            category: 'pick',
            title: `Pick — ${customerLabel}`,
            dueDate: addDays(deliveryDate, -2),
            scheduledStart: '08:00:00',
            description: `Pick items for order. Delivery ${deliveryDate}.`,
        },
        {
            category: 'pack',
            title: `Pack — ${customerLabel}`,
            dueDate: addDays(deliveryDate, -1),
            scheduledStart: '09:00:00',
            description: `Pack items into bags for delivery ${deliveryDate}.`,
        },
        {
            category: 'vehicle_load',
            title: `Stage for Loading — ${customerLabel}`,
            dueDate: deliveryDate,
            scheduledStart: '07:00:00',
            description: `Stage packed items for vehicle loading. Delivery ${order.delivery_time || 'TBD'}.`,
        },
    ]

    if (order.rental_end_date) {
        chain.push({
            category: 'returns_checkin',
            title: `Returns Check-in — ${customerLabel}`,
            dueDate: addDays(order.rental_end_date as string, 1),
            scheduledStart: '10:00:00',
            description: `Check in returned items after rental ends ${order.rental_end_date}.`,
        })
    }

    const taskIds: string[] = []
    let parentTaskId: string | null = null

    for (const step of chain) {
        const { data: task, error: insertError } = await supabase
            .from('tasks')
            .insert({
                title: step.title,
                description: step.description,
                status: 'pending',
                priority: step.category === 'vehicle_load' ? 'high' : 'medium',
                task_type: 'warehouse',
                warehouse_category: step.category,
                order_id: orderId,
                assigned_role_id: warehouseRoleId,
                due_date: step.dueDate,
                scheduled_start: step.scheduledStart,
                checklist,
                parent_task_id: parentTaskId,
                meta_data: {
                    delivery_address: order.delivery_address,
                    auto_generated: true,
                },
            })
            .select('id')
            .single()

        if (insertError) {
            return { success: false, error: insertError.message }
        }

        if (task) {
            taskIds.push(task.id)
            if (!parentTaskId) parentTaskId = task.id
        }
    }

    // Ensure delivery task exists for handoff
    const { data: existingDelivery } = await supabase
        .from('tasks')
        .select('id')
        .eq('order_id', orderId)
        .eq('task_type', 'delivery')
        .maybeSingle()

    if (!existingDelivery) {
        await supabase.from('tasks').insert({
            title: `Delivery — ${order.delivery_address || customerLabel}`,
            description: `Deliver order to ${customerLabel}`,
            status: 'pending',
            priority: 'medium',
            task_type: 'delivery',
            order_id: orderId,
            due_date: deliveryDate,
            due_time: order.delivery_time,
            delivery_items: checklist.map((c) => ({
                product_id: c.product_id,
                name: c.label,
                quantity: c.qty,
                loaded: false,
            })),
        })
    }

    return { success: true, taskIds }
}

export async function generateWarehouseTasksForDeliveryDate(
    supabase: SupabaseClient,
    deliveryDate: string
): Promise<{ success: boolean; generated: number; errors: string[] }> {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id')
        .eq('delivery_date', deliveryDate)
        .in('status', ['confirmed', 'processing', 'out_for_delivery'])

    if (error) {
        return { success: false, generated: 0, errors: [error.message] }
    }

    const errors: string[] = []
    let generated = 0

    for (const order of orders || []) {
        const result = await generateWarehouseTasksForOrder(supabase, order.id)
        if (result.success) {
            generated++
        } else if (result.error) {
            errors.push(result.error)
        }
    }

    return { success: errors.length === 0, generated, errors }
}

export async function syncVehicleLoadToDelivery(
    supabase: SupabaseClient,
    warehouseTaskId: string
): Promise<{ success: boolean; error?: string }> {
    const { data: loadTask, error: loadError } = await supabase
        .from('tasks')
        .select('order_id, checklist, warehouse_category')
        .eq('id', warehouseTaskId)
        .single()

    if (loadError || !loadTask || loadTask.warehouse_category !== 'vehicle_load') {
        return { success: false, error: 'Invalid vehicle load task' }
    }

    if (!loadTask.order_id) {
        return { success: true }
    }

    const deliveryItems = (loadTask.checklist || []).map(
        (item: ChecklistItem) => ({
            product_id: item.product_id,
            name: item.label,
            quantity: item.qty,
            loaded: item.completed,
        })
    )

    const { error: updateError } = await supabase
        .from('tasks')
        .update({
            delivery_items: deliveryItems,
            status: 'in_progress',
            updated_at: new Date().toISOString(),
        })
        .eq('order_id', loadTask.order_id)
        .eq('task_type', 'delivery')

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    return { success: true }
}
