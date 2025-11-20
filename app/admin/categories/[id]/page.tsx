import { createClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/category-form'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !category) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
            <CategoryForm category={category} />
        </div>
    )
}
