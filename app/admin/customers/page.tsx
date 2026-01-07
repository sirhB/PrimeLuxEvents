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
import { formatCentsWithCommas } from '@/lib/format-money'

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
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">All Customers</TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Active Only</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <div className="flex items-center justify-between gap-4 glass-card p-6 rounded-3xl border-none">
                        <div className="w-full max-w-md">
                            <SearchInput placeholder="Search customers..." />
                        </div>
                        <Button className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold uppercase text-[10px] tracking-widest px-6 h-11">
                            Add Customer
                        </Button>
                    </div>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-black/20">
                                    <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                        <TableHead className="w-12 pl-6">
                                            <Checkbox className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]" />
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4">Customer</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Contact Info</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-center">Engagement</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-right">Value</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Last Activity</TableHead>
                                        <TableHead className="w-12 pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.email} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                            <TableCell className="pl-6">
                                                <Checkbox className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]" />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-serif text-lg text-[var(--dashboard-text)]">{customer.name}</span>
                                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] font-medium uppercase tracking-tight">{customer.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {customer.phone ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--dashboard-accent-gold)]">
                                                            <Phone className="h-3 w-3" />
                                                            {customer.phone}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-[var(--dashboard-text-muted)] uppercase italic opacity-30">No phone</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-[var(--dashboard-text)]">{customer.orderCount}</span>
                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Orders</span>
                                                    </div>
                                                    <div className="w-[1px] h-4 bg-[var(--dashboard-border)]" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-[var(--dashboard-text)]">{customer.consultationCount}</span>
                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Leads</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-mono font-bold text-[var(--dashboard-text)]">
                                                    {formatCentsWithCommas(customer.totalSpent)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                                    {customer.lastOrderDate
                                                        ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : <span className="opacity-30 italic">No orders</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass-card border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                                                        <DropdownMenuItem className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-[var(--dashboard-accent-gold)] focus:text-black">
                                                            <Eye className="h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-[var(--dashboard-accent-gold)] focus:text-black">
                                                            <Mail className="h-4 w-4" />
                                                            Contact
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedCustomers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-40">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <Users className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">No customers found</p>
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
                    <div className="flex items-center justify-center h-60 glass-card rounded-3xl border-none">
                        <p className="text-[var(--dashboard-text-muted)] font-light">Active customers view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
