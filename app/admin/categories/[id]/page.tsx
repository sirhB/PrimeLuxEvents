import { createClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/category-form'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

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
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Categories', href: '/admin/categories' }, { label: category.name }]}
                title="Edit Category"
                description="Update category name, slug, and description."
            />
            <CategoryForm category={category} />
        </AdminPage>
    )
}
