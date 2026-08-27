'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateInventoryData {
    quantityAvailable?: number
    quantityReserved?: number
    lowStockThreshold?: number
}

export async function updateInventory(productId: string, data: UpdateInventoryData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.quantityAvailable !== undefined) updateData.quantity_available = data.quantityAvailable
        if (data.quantityReserved !== undefined) updateData.quantity_reserved = data.quantityReserved
        if (data.lowStockThreshold !== undefined) updateData.low_stock_threshold = data.lowStockThreshold

        const { error } = await supabase.from('products').update(updateData).eq('id', productId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/inventory')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function adjustInventory(
    productId: string,
    quantityChange: number,
    reason: string = 'Manual adjustment'
) {
    try {
        const supabase = await createClient()

        // Get current inventory
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('quantity_available')
            .eq('id', productId)
            .single()

        if (fetchError || !product) {
            return { success: false, error: 'Product not found' }
        }

        const newQuantity = Math.max(0, product.quantity_available + quantityChange)

        // Update inventory
        const { error: updateError } = await supabase
            .from('products')
            .update({ quantity_available: newQuantity })
            .eq('id', productId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        // Log to inventory_logs
        try {
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('inventory_logs').insert({
                product_id: productId,
                change_amount: quantityChange,
                reason,
                created_by: user?.id || null,
            })
        } catch (e) {
            console.log('Could not log to inventory_logs:', e)
        }

        // Also sync legacy stock column if present
        try {
            await supabase
                .from('products')
                .update({ stock: newQuantity })
                .eq('id', productId)
        } catch {
            // stock column may not exist on all deployments
        }

        // Log the adjustment if we have an audit log table
        try {
            await supabase.from('inventory_adjustments').insert({
                product_id: productId,
                quantity_change: quantityChange,
                reason,
                adjusted_by: (await supabase.auth.getUser()).data.user?.email || 'Admin',
            })
        } catch (e) {
            // Audit log table might not exist, continue anyway
            console.log('Could not log adjustment:', e)
        }

        revalidatePath('/admin/inventory')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function setLowStockAlert(productId: string, threshold: number) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('products')
            .update({ low_stock_threshold: threshold })
            .eq('id', productId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/inventory')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
