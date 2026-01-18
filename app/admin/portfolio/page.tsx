import { createClient } from '@/lib/supabase/server'
import nextDynamic from 'next/dynamic'

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
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <PortfolioContent categories={categories || []} />
        </div>
    )
}
