'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProductStock(id: string, adjustment: number) {
    const supabase = await createClient()

    // Get current stock
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single()

    if (fetchError || !product) {
        throw new Error('Product not found')
    }

    const newStock = Math.max(0, product.stock + adjustment)

    const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)

    if (updateError) {
        throw new Error('Failed to update stock')
    }

    revalidatePath('/admin/products')
    revalidatePath('/admin/scan')

    return { success: true, newStock }
}
