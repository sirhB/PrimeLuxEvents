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
    // We append the color to the name to keep it distinct but related
    // e.g. "Bamboo Chair" -> "Bamboo Chair (Gold)"

    // Check if name already has parentheses, if so, strip them for the base name
    const baseName = sourceProduct.name.replace(/\s+\(.*\)$/, '')
    const newName = `${baseName} (${newColor})`

    // Generate a simple slug
    const newSlug = `${sourceProduct.slug}-${newColor.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

    const { data, error } = await supabase
        .from('products')
        .insert({
            name: newName,
            description: sourceProduct.description,
            price: sourceProduct.price,
            category_id: sourceProduct.category_id,
            stock: sourceProduct.stock,
            image_url: newImage, // The new specific image
            images: [], // Start with empty gallery
            is_featured: false, // Default to not featured
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
