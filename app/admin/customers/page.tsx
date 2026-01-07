import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Users, MoreVertical, Eye, Mail, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
                        View customer information and order history.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">All Customers</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <SearchInput placeholder="Search" />
                        <Button>Add new</Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="px-6 py-4 border-b border-border">
                                <h2 className="text-base font-semibold text-foreground">Customers</h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox />
                                        </TableHead>
                                        <TableHead sortable>Name</TableHead>
                                        <TableHead sortable>Email</TableHead>
                                        <TableHead sortable>Phone</TableHead>
                                        <TableHead sortable>Orders</TableHead>
                                        <TableHead sortable>Consultations</TableHead>
                                        <TableHead sortable>Total Spent</TableHead>
                                        <TableHead sortable>Last Order</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.email}>
                                            <TableCell>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    {customer.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {customer.phone ? (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                        {customer.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                                    {customer.orderCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                                                    {customer.consultationCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground">
                                                ${customer.totalSpent.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {customer.lastOrderDate
                                                    ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                    : <span className="text-gray-400">N/A</span>}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedCustomers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center h-32">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users className="h-8 w-8 text-gray-400" />
                                                    <p className="text-muted-foreground">No customers found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {totalCount > 0 && (
                        <PaginationControls
                            hasNextPage={start + pageSize < totalCount}
                            hasPrevPage={start > 0}
                            totalCount={totalCount}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    )}
                </TabsContent>

                <TabsContent value="active" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-card rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Active customers view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
