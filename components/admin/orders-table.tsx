'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, MoreVertical, Pencil, Trash2, Hash } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { SortableHeader } from '@/components/admin/sortable-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCents, formatCentsWithCommas } from '@/lib/format-money'
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
}


export function OrdersTable({ orders }: OrdersTableProps) {
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

            <Card className="border-none glass-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                            <TableHead className="w-12 pl-6">
                                <Checkbox
                                    checked={selectedIds.length === orders.length && orders.length > 0}
                                    onCheckedChange={toggleAll}
                                    className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4">
                                <SortableHeader column="id" label="Invoice No." />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="customer_name" label="Client" className="min-w-[180px]" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="created_at" label="Placement Date" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="total_amount" label="Total Value" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Order Status</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Payment</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                data-state={selectedIds.includes(order.id) ? 'selected' : ''}
                                className="group/row hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors"
                            >
                                <TableCell className="pl-6">
                                    <Checkbox
                                        checked={selectedIds.includes(order.id)}
                                        onCheckedChange={() => toggleOne(order.id)}
                                        className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                    />
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 font-mono font-bold text-[var(--dashboard-accent-gold)]">
                                        <Hash className="h-3 w-3 opacity-50" />
                                        {order.id.slice(0, 8).toUpperCase()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-lg text-[var(--dashboard-text)] group-hover/row:text-[var(--dashboard-accent-gold)] transition-colors">
                                            {order.customer_name}
                                        </span>
                                        <span className="text-[10px] text-[var(--dashboard-text-muted)] font-bold tracking-widest uppercase opacity-70">
                                            {order.customer_email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-[var(--dashboard-text-muted)] font-light italic">
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="font-mono font-bold text-[var(--dashboard-text)] text-base">
                                    {formatCentsWithCommas(order.total_amount)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        className="rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                    />
                                </TableCell>
                                <TableCell>
                                    {order.is_overbooked ? (
                                        <StatusBadge status="Overbooked" variant="cancelled" className="rounded-lg text-[10px] font-bold uppercase tracking-widest" />
                                    ) : (
                                        <StatusBadge status="Paid" variant="success" className="rounded-lg text-[10px] font-bold uppercase tracking-widest" />
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild title="View Details">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-card border-[var(--dashboard-border)] bg-black/95 text-[var(--dashboard-text)]">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2 hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-2 hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit Order
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                                                <DropdownMenuItem className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors">
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
            </Card>
        </div>
    )
}
