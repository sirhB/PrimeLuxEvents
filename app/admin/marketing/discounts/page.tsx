import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'

const DiscountsContent = dynamic(
    () => import('@/components/admin/marketing/discounts-content').then(mod => mod.DiscountsContent)
)

export default async function DiscountsPage() {
    const supabase = await createClient()
    const { data: discounts } = await supabase
        .from('tiered_discounts')
        .select('*')
        .order('min_cart_total', { ascending: true })

    return (
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <DiscountsContent discounts={discounts} />
        </div>
    )
}
