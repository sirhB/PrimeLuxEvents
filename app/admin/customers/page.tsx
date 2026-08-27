import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { requirePermission } from '@/lib/auth/authorization'
import Link from 'next/link'
import { formatCentsWithCommas } from '@/lib/format-money'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

const CustomersClient = dynamic(() => import('./customers-client').then(mod => mod.CustomersClient))
const CustomerStatsCards = dynamic(() => import('@/components/admin/customers/customer-stats-cards').then(mod => mod.CustomerStatsCards))
const TopCustomersWidget = dynamic(() => import('@/components/admin/customers/top-customers-widget').then(mod => mod.TopCustomersWidget))

interface Customer {
    email: string
    name: string
    phone?: string
    orderCount: number
    consultationCount: number
    totalSpent: number
    lastOrderDate?: string
}

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    await requirePermission('customers.view')
    const { page = '1', search } = await searchParams
    const supabase = await createClient()

    // Parallelize aggregation data fetching
    const [ordersRes, consultationsRes, archivedRes, recentOrdersRes] = await Promise.all([
        supabase
            .from('orders')
            .select('customer_name, customer_email, total_amount, created_at')
            .order('created_at', { ascending: false })
            .limit(2000), // Safety limit for dev aggregation
        supabase
            .from('consultations')
            .select('customer_name, customer_email, customer_phone, total_amount, created_at')
            .order('created_at', { ascending: false })
            .limit(2000),
        supabase.from('customer_details').select('email').eq('is_archived', true),
        supabase
            .from('orders')
            .select('id, customer_name, customer_email, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(6),
    ])

    const orders = ordersRes.data
    const consultations = consultationsRes.data
    const archivedEmails = new Set((archivedRes.data || []).map((r) => r.email.toLowerCase()))
    const recentOrders = recentOrdersRes.data || []

    // Combine and aggregate customer data (Keep logic same but faster thanks to parallelization and limits)
    const customerMap = new Map<string, Customer>()

    orders?.forEach((order) => {
        const email = order.customer_email
        if (!email) return

        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email,
                name: order.customer_name,
                orderCount: 0,
                consultationCount: 0,
                totalSpent: 0,
            })
        }

        const customer = customerMap.get(email)!
        customer.orderCount++
        customer.totalSpent += parseFloat(order.total_amount)

        if (!customer.lastOrderDate || new Date(order.created_at) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.created_at
        }
    })

    consultations?.forEach((consultation) => {
        const email = consultation.customer_email
        if (!email) return

        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email,
                name: consultation.customer_name,
                phone: consultation.customer_phone,
                orderCount: 0,
                consultationCount: 0,
                totalSpent: 0,
            })
        }

        const customer = customerMap.get(email)!
        customer.consultationCount++
        if (consultation.customer_phone) {
            customer.phone = consultation.customer_phone
        }
    })

    const customers = Array.from(customerMap.values())
        .filter((c) => !archivedEmails.has(c.email.toLowerCase()))
        .sort(
        (a, b) => b.totalSpent - a.totalSpent
    )

    // Calculate metrics
    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate new customers this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = customers.filter(c =>
        c.lastOrderDate && new Date(c.lastOrderDate) >= firstDayOfMonth
    ).length

    const currentPage = parseInt(page)
    const pageSize = 10

    let filteredCustomers = customers

    if (search) {
        const searchLower = search.toLowerCase()
        filteredCustomers = customers.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower) ||
            (c.phone && c.phone.includes(searchLower))
        )
    }

    const totalCount = filteredCustomers.length
    const start = (currentPage - 1) * pageSize
    const paginatedCustomers = filteredCustomers.slice(start, start + pageSize)

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="CRM"
                title="Customers"
                description="Customer insights and relationship management."
            />

            <CustomerStatsCards
                totalCustomers={totalCustomers}
                newThisMonth={newThisMonth}
                totalRevenue={totalRevenue}
                avgOrderValue={avgOrderValue}
            />

            {/* Top Customers Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopCustomersWidget customers={customers} />
                <div className="glass-card border-none p-6 space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-[var(--dashboard-text)]">Recent Activity</h3>
                        <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-widest">Latest customer orders</p>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-[var(--dashboard-text-muted)]">No recent orders</p>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between rounded-xl border border-[var(--dashboard-border)]/60 px-3 py-2 hover:bg-[var(--dashboard-card-hover)] transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-[var(--dashboard-text)]">{order.customer_name}</p>
                                        <p className="text-xs text-[var(--dashboard-text-muted)]">{order.customer_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[var(--dashboard-text)]">
                                            {formatCentsWithCommas(Number(order.total_amount))}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest text-[var(--dashboard-text-muted)]">{order.status}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <CustomersClient
                customers={paginatedCustomers}
                activeCustomers={customers.filter((c) => c.lastOrderDate && new Date(c.lastOrderDate) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
            />
        </AdminPage>
    )
}

