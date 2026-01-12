import { createClient } from '@/lib/supabase/server'
import { CustomersClient } from './customers-client'

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
        <CustomersClient
            customers={paginatedCustomers}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
        />
    )
}
