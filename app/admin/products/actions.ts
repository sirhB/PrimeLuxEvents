'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProductVariant(
    sourceProduct: any,
    newColor: string,
    newImage: string | null
) {
    const supabase = await createClient()

    // 1. Generate or ensure group_id
    let groupId = sourceProduct.group_id
    if (!groupId) {
        groupId = crypto.randomUUID()
        // Update source product to have this group_id
        await supabase
            .from('products')
            .update({ group_id: groupId, color: sourceProduct.color || 'Original' })
            .eq('id', sourceProduct.id)
    }

    // 2. Prepare new product data
    const baseName = sourceProduct.name.replace(/\s+\(.*\)$/, '')
    const newName = `${baseName} (${newColor})`

    // Generate a simple slug
    const newSlug = `${sourceProduct.slug}-${newColor.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`

    const { data, error } = await supabase
        .from('products')
        .insert({
            name: newName,
            description: sourceProduct.description,
            price: sourceProduct.price,
            category_id: sourceProduct.category_id,
            stock: sourceProduct.stock,
            image_url: newImage,
            images: [],
            is_featured: false,
            slug: newSlug,
            assembly_items: sourceProduct.assembly_items,
            group_id: groupId,
            color: newColor,
            modifiers: sourceProduct.modifiers,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating variant:', error)
        throw new Error('Failed to create variant')
    }

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${sourceProduct.id}`)

    return { success: true, newProductId: data.id }
}

export async function linkProductVariant(currentProductId: string, targetProductId: string) {
    const supabase = await createClient()

    // Get both products to check their group status
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, group_id, color')
        .in('id', [currentProductId, targetProductId])

    if (fetchError || !products || products.length !== 2) {
        throw new Error('Failed to fetch products to link')
    }

    const p1 = products.find(p => p.id === currentProductId)
    const p2 = products.find(p => p.id === targetProductId)

    if (!p1 || !p2) throw new Error('Product not found')

    let groupId = p1.group_id || p2.group_id || crypto.randomUUID()

    // Update both to use the same group ID
    // Also ensure they have a 'color' set if missing, to avoid UI weirdness
    const updates = []

    updates.push(
        supabase.from('products').update({
            group_id: groupId,
            color: p1.color || 'Original'
        }).eq('id', p1.id)
    )

    updates.push(
        supabase.from('products').update({
            group_id: groupId,
            color: p2.color || 'Variant'
        }).eq('id', p2.id)
    )

    await Promise.all(updates)

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${currentProductId}`)
    revalidatePath(`/admin/products/${targetProductId}`)

    return { success: true }
}

export async function unlinkProductVariant(productId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .update({ group_id: null })
        .eq('id', productId)

    if (error) throw new Error('Failed to unlink product')

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)

    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
        throw new Error('Failed to delete product')
    }

    revalidatePath('/admin/products')
}
