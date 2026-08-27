import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { AdminPage } from '@/components/admin/page-shell'

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
        <AdminPage>
            <DiscountsContent discounts={discounts} />
        </AdminPage>
    )
}
