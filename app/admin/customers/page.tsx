import { createClient } from '@/lib/supabase/server'
import { CustomersClient } from './customers-client'
import { CustomerStatsCards } from '@/components/admin/customers/customer-stats-cards'
import { TopCustomersWidget } from '@/components/admin/customers/top-customers-widget'

interface Customer {
    email: string
    name: string
    phone?: string
    orderCount: number
    consultationCount: number
    totalSpent: number
    lastOrderDate?: string
}

import { requirePermission } from '@/lib/auth/authorization'

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    await requirePermission('customers.view')
    const { page = '1', search } = await searchParams
    const supabase = await createClient()

    // Aggregate customer data from orders and consultations
    const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, customer_email, total_amount, created_at')

    const { data: consultations } = await supabase
        .from('consultations')
        .select('customer_name, customer_email, customer_phone, total_amount, created_at')

    // Combine and aggregate customer data
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

    const customers = Array.from(customerMap.values()).sort(
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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            CRM
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Customers
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Customer insights and relationship management.
                    </p>
                </div>
            </div>

            {/* Dashboard Statistics */}
            <CustomerStatsCards
                totalCustomers={totalCustomers}
                newThisMonth={newThisMonth}
                totalRevenue={totalRevenue}
                avgOrderValue={avgOrderValue}
            />

            {/* Top Customers Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopCustomersWidget customers={customers} />
                {/* Placeholder for future widget */}
                <div className="glass-card border-none flex flex-col items-center justify-center p-6 text-[var(--dashboard-text-muted)]">
                    <p>Recent Activity (Coming Soon)</p>
                </div>
            </div>

            {/* Customer List */}
            <CustomersClient
                customers={paginatedCustomers}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
            />
        </div>
    )
}

