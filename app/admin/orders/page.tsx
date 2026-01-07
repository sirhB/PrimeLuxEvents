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
import { OrdersTable } from '@/components/admin/orders-table'

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
    searchParams: Promise<{ page?: string; search?: string; status?: string; sort?: string }>
}) {
    const { page = '1', search, status, sort = 'newest' } = await searchParams
    const supabase = await createClient()

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

    const { data: orders, count } = await query.range(start, end)

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
                            View and manage customer orders and track fulfillment status.
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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex flex-col xxl:flex-row gap-6 items-start xxl:items-center justify-between glass-morphism p-6 rounded-3xl border border-border/50">
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

                    <OrdersTable orders={orders || []} getStatusVariant={getStatusVariant} />

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
                </TabsContent>

                <TabsContent value="pending" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 bg-card/30 rounded-3xl border border-dashed border-border/50 backdrop-blur-sm">
                        <p className="text-muted-foreground font-light text-center">Filtered views coming soon</p>
                    </div>
                </TabsContent>
                <TabsContent value="completed" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 bg-card/30 rounded-3xl border border-dashed border-border/50 backdrop-blur-sm">
                        <p className="text-muted-foreground font-light text-center">Filtered views coming soon</p>
                    </div>
                </TabsContent>
                <TabsContent value="cancelled" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 bg-card/30 rounded-3xl border border-dashed border-border/50 backdrop-blur-sm">
                        <p className="text-muted-foreground font-light text-center">Filtered views coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
