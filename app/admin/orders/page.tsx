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
import { Eye, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCents } from '@/lib/format-money'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from '@/components/ui/status-badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Helper function to map order status to badge variant
function getStatusVariant(status: string): 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default' {
    const statusMap: Record<string, 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default'> = {
        'delivered': 'success',
        'confirmed': 'success',
        'pending': 'pending',
        'processing': 'pending',
        'cancelled': 'cancelled',
        'on-hold': 'on-hold',
    }
    return statusMap[status.toLowerCase()] || 'default'
}

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
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        View and manage customer orders
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Order
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <SearchInput placeholder="Search" />
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
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900">Orders</h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox />
                                        </TableHead>
                                        <TableHead sortable>Invoice</TableHead>
                                        <TableHead sortable>Customer</TableHead>
                                        <TableHead sortable>Date</TableHead>
                                        <TableHead sortable>Amount</TableHead>
                                        <TableHead>Order Status</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell className="font-semibold text-blue-600">
                                                #{order.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{order.customer_name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {order.customer_email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                {formatCents(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    variant={getStatusVariant(order.status)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {order.is_overbooked ? (
                                                    <StatusBadge status="Overbooked" variant="cancelled" />
                                                ) : (
                                                    <StatusBadge status="Paid" variant="paid" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2">
                                                            <Pencil className="h-4 w-4" />
                                                            Edit Order
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {orders?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-32">
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-gray-500">No orders found.</p>
                                                </div>
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
                </TabsContent>

                <TabsContent value="pending" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Filtered views coming soon</p>
                    </div>
                </TabsContent>
                <TabsContent value="completed" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Filtered views coming soon</p>
                    </div>
                </TabsContent>
                <TabsContent value="cancelled" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Filtered views coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
