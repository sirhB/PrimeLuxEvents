'use client'

import dynamic from 'next/dynamic'
import { StatusFilter } from '@/components/admin/status-filter'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const OrderStatsCards = dynamic(() => import('@/components/admin/orders/order-stats-cards').then(m => m.OrderStatsCards), {
    loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-32 animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})
const DashboardOrderList = dynamic(() => import('@/components/admin/orders/dashboard-order-list').then(m => m.DashboardOrderList), {
    loading: () => <div className="h-64 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})
const OrdersWorkspace = dynamic(() => import('@/components/admin/orders/orders-workspace').then(m => m.OrdersWorkspace), {
    loading: () => <div className="h-[600px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})

interface Order {
    id: string
    customer_name: string
    customer_email: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrdersContentProps {
    totalRevenue: number
    totalOrdersCount: number
    pendingOrdersCount: number
    deliveredOrdersCount: number
    recentOrders: any[]
    pendingOrders: any[]
    orders: Order[]
    count: number | null
    status?: string
    currentPage: number
    pageSize: number
    start: number
    end: number
}

export function OrdersContent({
    totalRevenue,
    totalOrdersCount,
    pendingOrdersCount,
    deliveredOrdersCount,
    recentOrders,
    pendingOrders,
    orders,
    count,
    status,
    currentPage,
    pageSize,
    start,
    end,
}: OrdersContentProps) {
    return (
        <div className="flex flex-col gap-8">
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

            {/* Main Orders Workspace */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-serif text-[var(--dashboard-text)]">Orders Workspace</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-4 glass-card p-2 rounded-2xl border-none">
                        <div className="w-full max-w-xs">
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
                </div>

                <OrdersWorkspace initialOrders={orders} />

                {count !== null && count > 0 && (
                    <div className="mt-8 flex justify-center pb-12">
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
        </div>
    )
}
