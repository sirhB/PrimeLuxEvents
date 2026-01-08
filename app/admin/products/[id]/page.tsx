import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const [productResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('*'),
    ])

    // Fetch variants if this product is part of a group
    let variants: any[] = []
    if (productResult.data && productResult.data.group_id) {
        const { data: variantsData } = await supabase
            .from('products')
            .select('id, name, color, image_url, slug')
            .eq('group_id', productResult.data.group_id)
            .order('created_at', { ascending: true })

        variants = variantsData || []
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <ProductForm
                product={productResult.data}
                categories={categoriesResult.data || []}
                variants={variants}
            />
        </div>
    )
}
