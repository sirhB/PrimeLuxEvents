import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'

interface Customer {
    email: string
    name: string
    phone?: string
    orderCount: number
    quoteCount: number
    totalSpent: number
    lastOrderDate?: string
}

export default async function CustomersPage() {
    const supabase = await createClient()

    // Aggregate customer data from orders and quotes
    const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, customer_email, total_amount, created_at')

    const { data: quotes } = await supabase
        .from('quotes')
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
                quoteCount: 0,
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

    quotes?.forEach((quote) => {
        const email = quote.customer_email
        if (!email) return

        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email,
                name: quote.customer_name,
                phone: quote.customer_phone,
                orderCount: 0,
                quoteCount: 0,
                totalSpent: 0,
            })
        }

        const customer = customerMap.get(email)!
        customer.quoteCount++
        if (quote.customer_phone) {
            customer.phone = quote.customer_phone
        }
    })

    const customers = Array.from(customerMap.values()).sort(
        (a, b) => b.totalSpent - a.totalSpent
    )

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground mt-1">
                    View customer information and order history
                </p>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Quotes</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.email}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone || 'N/A'}</TableCell>
                                <TableCell>{customer.orderCount}</TableCell>
                                <TableCell>{customer.quoteCount}</TableCell>
                                <TableCell className="font-medium">
                                    ${customer.totalSpent.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {customer.lastOrderDate
                                        ? new Date(customer.lastOrderDate).toLocaleDateString()
                                        : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No customers found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
