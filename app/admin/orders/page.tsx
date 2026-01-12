import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'
import { OrdersTable } from '@/components/admin/orders-table'
import { OrderStatsCards } from '@/components/admin/orders/order-stats-cards'
import { DashboardOrderList } from '@/components/admin/orders/dashboard-order-list'


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
        supabase.from('orders').select('total_amount').eq('status', 'delivered'), // Revenue (approx, fully paid)
        supabase.from('orders').select('id', { count: 'exact', head: true }), // Total Orders
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'), // Pending
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'), // Delivered
    ])

    // 2. Fetch Recent Orders (Limit 5)
    const recentOrdersPromise = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    // 3. Fetch Action Required Orders (Pending, Limit 5)
    const pendingOrdersPromise = supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }) // Oldest first for action items? Or newest? let's do oldest first to clear backlog
        .limit(5)

    // 4. Fetch Main Table Data
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
        case 'id_asc':
            query = query.order('id', { ascending: true })
            break
        case 'id_desc':
            query = query.order('id', { ascending: false })
            break
        case 'customer_name_asc':
            query = query.order('customer_name', { ascending: true })
            break
        case 'customer_name_desc':
            query = query.order('customer_name', { ascending: false })
            break
        case 'total_amount_asc':
            query = query.order('total_amount', { ascending: true })
            break
        case 'total_amount_desc':
            query = query.order('total_amount', { ascending: false })
            break
        case 'created_at_asc':
            query = query.order('created_at', { ascending: true })
            break
        case 'created_at_desc':
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false })
            break
    }

    const tablePromise = query.range(start, end)

    // Await all data
    const [
        [revenueResult, totalOrdersResult, pendingOrdersResult, deliveredOrdersResult],
        { data: recentOrders },
        { data: pendingOrders },
        { data: orders, count }
    ] = await Promise.all([
        metricsPromise,
        recentOrdersPromise,
        pendingOrdersPromise,
        tablePromise
    ])

    // Calculate specific metrics
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

            {/* Dashboard Statistics */}
            <OrderStatsCards
                totalRevenue={totalRevenue}
                totalOrders={totalOrdersCount}
                pendingOrders={pendingOrdersCount}
                deliveredOrders={deliveredOrdersCount}
            />

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardOrderList
                    title="Recent Orders"
                    orders={recentOrders || []}
                    viewAllLink="/admin/orders"
                />
                <DashboardOrderList
                    title="Needs Confirmation"
                    orders={pendingOrders || []}
                    emptyMessage="All caught up! No pending orders."
                    viewAllLink="/admin/orders?status=pending"
                />
            </div>

            {/* Main Orders List (Collapsible/Tabbed) */}
            <div className="space-y-4">
                <h2 className="text-2xl font-serif text-[var(--dashboard-text)] mt-8">All Orders</h2>

                <Tabs defaultValue={status || 'all'} className="w-full">
                    <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                        <TabsTrigger value="all" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                            <Link href="/admin/orders">All Orders</Link>
                        </TabsTrigger>
                        <TabsTrigger value="pending" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                            <Link href="/admin/orders?status=pending">Pending</Link>
                        </TabsTrigger>
                        <TabsTrigger value="delivered" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                            <Link href="/admin/orders?status=delivered">Completed</Link>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                            <Link href="/admin/orders?status=cancelled">Cancelled</Link>
                        </TabsTrigger>
                    </TabsList>

                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col xxl:flex-row gap-6 items-start xxl:items-center justify-between glass-card p-6 rounded-3xl border-none">
                            <div className="w-full max-w-md">
                                <SearchInput placeholder="Search orders..." />
                            </div>
                            <StatusFilter
                                statuses={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'confirmed', label: 'Confirmed' },
                                    { value: 'processing', label: 'Processing' },
                                    { value: 'delivered', label: 'Delivered' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                            />
                        </div>

                        <OrdersTable orders={orders || []} />

                        {count !== null && count > 0 && (
                            <div className="mt-8 flex justify-center">
                                <PaginationControls
                                    hasNextPage={end < count}
                                    hasPrevPage={start > 0}
                                    totalCount={count}
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                />
                            </div>
                        )}
                    </div>
                </Tabs>
            </div>

        </div>
    )
}

