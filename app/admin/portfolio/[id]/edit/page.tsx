import { createClient } from '@/lib/supabase/server'
import { PortfolioCategoryForm } from '@/components/admin/portfolio-category-form'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function EditPortfolioCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
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

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Portfolio', href: '/admin/portfolio' }, { label: category.name }]}
                title="Edit Portfolio Category"
                description="Update gallery category details and cover image."
            />
            <PortfolioCategoryForm category={category} />
        </AdminPage>
    )
}
