import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OrdersContent } from '@/components/admin/orders/orders-content'
import { requirePermission } from '@/lib/auth/authorization'

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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Commerce
                        </span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                            Orders
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Overview of your store's performance and recent orders.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/orders/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Order
                        </Link>
                    </Button>
                </div>
            </div>

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
        </div>
    )
}

