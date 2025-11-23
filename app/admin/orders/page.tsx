import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCents } from '@/lib/format-money'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: orders, count } = await query.range(start, end)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage customer orders
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search orders..." />
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

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Alerts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{order.customer_name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {order.customer_email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCents(order.total_amount)}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">{order.status}</span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {order.is_overbooked && (
                                            <span className="inline-flex items-center rounded-full border border-red-500 px-2.5 py-0.5 text-xs font-semibold text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                Overbooked
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {count !== null && count > 0 && (
                <PaginationControls
                    hasNextPage={end < count}
                    hasPrevPage={start > 0}
                    totalCount={count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}
