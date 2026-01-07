import { CategoryImagesClient } from './client'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoryImagesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch category
    const { data: category } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('id', id)
        .single()

    if (!category) {
        notFound()
    }

    // Fetch images
    const { data: images } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('category_id', id)
        .order('order_index')

    return <CategoryImagesClient category={category} images={images || []} />
}
