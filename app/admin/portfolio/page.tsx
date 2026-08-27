import { createClient } from '@/lib/supabase/server'
import nextDynamic from 'next/dynamic'
import { AdminPage } from '@/components/admin/page-shell'

const PortfolioContent = nextDynamic(
    () => import('./portfolio-content').then(mod => mod.PortfolioContent)
)

export const dynamic = 'force-dynamic'

export default async function PortfolioAdminPage() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('name')

    return (
        <AdminPage>
            <PortfolioContent categories={categories || []} />
        </AdminPage>
    )
}
