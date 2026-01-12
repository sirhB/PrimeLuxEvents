import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCents } from '@/lib/format-money'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'

interface DashboardOrderListProps {
    orders: any[]
    title: string
    viewAllLink?: string
    emptyMessage?: string
}

export function DashboardOrderList({
    orders,
    title,
    viewAllLink,
    emptyMessage = "No orders found.",
}: DashboardOrderListProps) {
    return (
        <div className="glass-card rounded-3xl border-none p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif text-[var(--dashboard-text)] font-medium">
                    {title}
                </h3>
                {viewAllLink && (
                    <Button variant="link" asChild className="text-[var(--dashboard-accent-gold)] p-0 h-auto">
                        <Link href={viewAllLink}>View All</Link>
                    </Button>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="text-[var(--dashboard-text-muted)] text-sm py-8 text-center bg-black/5 rounded-xl">
                    {emptyMessage}
                </div>
            ) : (
                <div className="overflow-auto -mx-2 px-2">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent">
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Order ID</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Customer</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Date</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Total</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                    <TableCell className="font-mono text-xs px-2 py-3 text-[var(--dashboard-text)]">
                                        #{order.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-[var(--dashboard-text)] font-medium">
                                        {order.customer_name}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-[var(--dashboard-text-muted)] text-xs">
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-[var(--dashboard-text)]">
                                        {formatCents(order.total_amount)}
                                    </TableCell>
                                    <TableCell className="px-2 py-3">
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-white/10 hover:text-[var(--dashboard-accent-gold)]">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
