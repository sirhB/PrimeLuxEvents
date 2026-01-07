'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, MoreVertical, Pencil, Trash2, Hash } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SortableHeader } from '@/components/admin/sortable-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCents } from '@/lib/format-money'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Order {
    id: string
    customer_name: string
    customer_email: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrdersTableProps {
    orders: Order[]
    getStatusVariant: (status: string) => any
}

export function OrdersTable({ orders, getStatusVariant }: OrdersTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleAll = () => {
        if (selectedIds.length === orders.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(orders.map(o => o.id))
        }
    }

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    return (
        <div className="relative">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="sticky bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full glass-morphism border border-[var(--dashboard-accent-gold)] shadow-2xl bg-black/80 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold text-[var(--dashboard-accent-gold)] uppercase tracking-widest px-2">
                            {selectedIds.length} Selected
                        </span>
                        <div className="w-px h-6 bg-border/50 mx-2" />
                        <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary rounded-full font-bold uppercase text-[10px] tracking-wider">
                            Update Status
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary rounded-full font-bold uppercase text-[10px] tracking-wider">
                            Print Invoices
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="rounded-full font-bold uppercase text-[10px] tracking-wider">
                            Cancel
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="rounded-[var(--radius)] border border-border bg-card/30 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableCell className="w-12">
                                <Checkbox
                                    checked={selectedIds.length === orders.length && orders.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableCell>
                            <SortableHeader column="id" label="Invoice" />
                            <SortableHeader column="customer_name" label="Customer" className="min-w-[180px]" />
                            <SortableHeader column="created_at" label="Date" />
                            <SortableHeader column="total_amount" label="Amount" />
                            <TableCell>Order Status</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell className="text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                data-state={selectedIds.includes(order.id) ? 'selected' : ''}
                                className="group/row transition-colors"
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(order.id)}
                                        onCheckedChange={() => toggleOne(order.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-semibold text-primary">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 opacity-50" />
                                        {order.id.slice(0, 8)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground group-hover/row:text-primary transition-colors">
                                            {order.customer_name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-light tracking-wide uppercase">
                                            {order.customer_email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-light">
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="font-serif">
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
                                        <StatusBadge status="Paid" variant="success" />
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon-sm" asChild>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <MoreVertical className="h-3.5 w-3.5 opacity-50" />
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
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
