import { CategoryImagesClient } from './client'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function CategoryImagesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: category } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('id', id)
        .single()

    if (!category) {
        notFound()
    }

    const { data: images } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('category_id', id)
        .order('order_index')

    return (
        <AdminPage>
            <CategoryImagesClient category={category} images={images || []} />
        </AdminPage>
    )
}
