'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateOrderData {
    customerName: string
    customerEmail: string
    customerPhone?: string
    deliveryDate: string
    deliveryTime?: string
    deliveryAddress: string
    rentalStartDate: string
    rentalEndDate: string
    items: Array<{ productId: string; quantity: number }>
    status?: string
    totalAmount: number
}

export interface UpdateOrderData {
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    deliveryDate?: string
    deliveryTime?: string
    deliveryAddress?: string
    rentalStartDate?: string
    rentalEndDate?: string
    status?: string
    totalAmount?: number
}

export async function createOrder(data: CreateOrderData) {
    try {
        const supabase = await createClient()

        // Get current user (admin)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert({
                customer_name: data.customerName,
                customer_email: data.customerEmail,
                customer_phone: data.customerPhone || null,
                delivery_date: data.deliveryDate,
                delivery_time: data.deliveryTime || null,
                delivery_address: data.deliveryAddress,
                rental_start_date: data.rentalStartDate,
                rental_end_date: data.rentalEndDate,
                status: data.status || 'pending',
                total_amount: data.totalAmount,
                created_by: user?.email || 'Admin',
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/orders')
        return { success: true, data: newOrder }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateOrder(orderId: string, data: UpdateOrderData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.customerName !== undefined) updateData.customer_name = data.customerName
        if (data.customerEmail !== undefined) updateData.customer_email = data.customerEmail
        if (data.customerPhone !== undefined) updateData.customer_phone = data.customerPhone
        if (data.deliveryDate !== undefined) updateData.delivery_date = data.deliveryDate
        if (data.deliveryTime !== undefined) updateData.delivery_time = data.deliveryTime
        if (data.deliveryAddress !== undefined) updateData.delivery_address = data.deliveryAddress
        if (data.rentalStartDate !== undefined) updateData.rental_start_date = data.rentalStartDate
        if (data.rentalEndDate !== undefined) updateData.rental_end_date = data.rentalEndDate
        if (data.status !== undefined) updateData.status = data.status
        if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function deleteOrder(orderId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('orders').delete().eq('id', orderId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
export async function updateOrdersStatusBulk(orderIds: string[], status: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .in('id', orderIds)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
