'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePortfolioImage(imageId: string, categoryId: string) {
    const supabase = await createClient()

    try {
        // Get the image URL before deleting to remove from storage
        const { data: image } = await supabase
            .from('portfolio_images')
            .select('image_url')
            .eq('id', imageId)
            .single()

        if (!image) {
            return { error: 'Image not found' }
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('portfolio_images')
            .delete()
            .eq('id', imageId)

        if (dbError) {
            return { error: dbError.message }
        }

        // Extract file path from URL and delete from storage
        try {
            const url = new URL(image.image_url)
            const pathParts = url.pathname.split('/')
            const fileName = pathParts[pathParts.length - 1]

            await supabase.storage
                .from('portfolio')
                .remove([fileName])
        } catch (storageError) {
            // Continue even if storage deletion fails
            console.error('Storage deletion error:', storageError)
        }

        revalidatePath(`/admin/portfolio/${categoryId}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updatePortfolioImageOrder(imageId: string, newOrderIndex: number, categoryId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('portfolio_images')
            .update({ order_index: newOrderIndex })
            .eq('id', imageId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/admin/portfolio/${categoryId}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updatePortfolioImage(
    imageId: string,
    categoryId: string,
    data: { title?: string; description?: string }
) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('portfolio_images')
            .update(data)
            .eq('id', imageId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/admin/portfolio/${categoryId}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function createPortfolioCategory(data: {
    name: string
    slug: string
    description?: string
    cover_image?: string
}) {
    const supabase = await createClient()

    try {
        const { data: category, error } = await supabase
            .from('portfolio_categories')
            .insert(data)
            .select()
            .single()

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/portfolio')
        return { success: true, data: category }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updatePortfolioCategory(
    id: string,
    data: {
        name?: string
        slug?: string
        description?: string
        cover_image?: string
    }
) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('portfolio_categories')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/portfolio')
        revalidatePath(`/admin/portfolio/${id}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deletePortfolioCategory(id: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('portfolio_categories')
            .delete()
            .eq('id', id)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/portfolio')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
