import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OrdersContent } from '@/components/admin/orders/orders-content'
import { requirePermission } from '@/lib/auth/authorization'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string; sort?: string }>
}) {
    await requirePermission('orders.view')
    const { page = '1', search, status, sort = 'newest' } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Metrics (Parallel execution for performance)
    const metricsPromise = Promise.all([
        // Only fetch total_amount for delivered orders to sum revenue
        supabase.from('orders').select('total_amount').eq('status', 'delivered'),
        // Accurate counts for the dashboard cards
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    ])

    // 3. Prepare Main Table Query & Pagination
    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })

    if (search) {
        query = query.or(`id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    // Apply sorting
    switch (sort) {
        case 'id_asc': query = query.order('id', { ascending: true }); break
        case 'id_desc': query = query.order('id', { ascending: false }); break
        case 'customer_name_asc': query = query.order('customer_name', { ascending: true }); break
        case 'customer_name_desc': query = query.order('customer_name', { ascending: false }); break
        case 'total_amount_asc': query = query.order('total_amount', { ascending: true }); break
        case 'total_amount_desc': query = query.order('total_amount', { ascending: false }); break
        case 'created_at_asc': query = query.order('created_at', { ascending: true }); break
        case 'created_at_desc':
        case 'newest':
        default: query = query.order('created_at', { ascending: false }); break
    }

    // 4. Fetch Dashboard Lists and Table Data in parallel with metrics
    const [
        [revenueResult, totalOrdersResult, pendingOrdersResult, deliveredOrdersResult],
        { data: recentOrders },
        { data: pendingOrders },
        { data: orders, count }
    ] = await Promise.all([
        metricsPromise,
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(5),
        query.range(start, end)
    ])

    // Calculate metrics locally
    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const totalOrdersCount = totalOrdersResult.count || 0
    const pendingOrdersCount = pendingOrdersResult.count || 0
    const deliveredOrdersCount = deliveredOrdersResult.count || 0

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Commerce"
                title="Orders"
                description="Overview of your store's performance and recent orders."
                actions={
                    <Button asChild className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
                        <Link href="/admin/orders/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Order
                        </Link>
                    </Button>
                }
            />

            <OrdersContent
                totalRevenue={totalRevenue}
                totalOrdersCount={totalOrdersCount}
                pendingOrdersCount={pendingOrdersCount}
                deliveredOrdersCount={deliveredOrdersCount}
                recentOrders={recentOrders || []}
                pendingOrders={pendingOrders || []}
                orders={orders || []}
                count={count}
                status={status}
                currentPage={currentPage}
                pageSize={pageSize}
                start={start}
                end={end}
            />
        </AdminPage>
    )
}

