import { createClient } from '@/lib/supabase/server'
import { PortfolioCategoryForm } from '@/components/admin/portfolio-category-form'
import { notFound } from 'next/navigation'

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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <PortfolioCategoryForm category={category} />
        </div>
    )
}
