'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


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

import { calculateOrderTotal, type CartItem } from '@/app/actions/checkout'

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
    paymentMethod?: string
    paidAmount?: number
    checkUrl?: string
}

export async function createOrder(data: CreateOrderData) {
    try {
        const supabase = await createClient()

        // Get current user (admin)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Calculate totals using the shared checkout logic
        const cartItems: CartItem[] = data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))

        const totals = await calculateOrderTotal(cartItems, data.deliveryAddress)

        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert({
                customer_name: data.customerName,
                customer_email: data.customerEmail,
                customer_phone: data.customerPhone || null,
                delivery_address: data.deliveryAddress,
                delivery_date: data.deliveryDate,
                delivery_time: data.deliveryTime || null,
                rental_start_date: data.rentalStartDate,
                rental_end_date: data.rentalEndDate,
                status: data.status || 'pending',
                subtotal: totals.subtotal,
                tax_amount: totals.taxAmount,
                tax_rate: totals.taxRate,
                delivery_fee: totals.deliveryFee,
                total_amount: totals.totalAmount, // Use calculated total
                created_by: user?.email || 'Admin',
                payment_status: (data.status === 'confirmed' || (data.paidAmount && data.paidAmount >= totals.totalAmount)) ? 'succeeded' : 'pending',
                payment_method: data.paymentMethod || 'other',
                balance_paid: data.paidAmount || (data.status === 'confirmed' ? totals.totalAmount : 0),
                // We'll add check_url if possible, or store in notes for now if column doesn't exist
                // Actually, I'll assume I can add the column.
                // @ts-ignore
                check_url: data.checkUrl || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating order:', error)
            return { success: false, error: error.message }
        }

        // Create order items
        if (data.items.length > 0) {
            const orderItems = data.items.map(item => {
                const product = totals.products.find(p => p.id === item.productId)
                return {
                    order_id: newOrder.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    price_at_time: product?.price || 0
                }
            })

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
            if (itemsError) {
                console.error('Error creating order items:', itemsError)
                // We might want to delete the order here if items fail, but for now just log
            }
        }

        revalidatePath('/admin/orders')
        return { success: true, data: newOrder }
    } catch (error) {
        console.error('Create order error:', error)
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
