'use client'

import React, { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    Phone, Mail, Calendar, MapPin,
    ClipboardList, Clock, ArrowLeft,
    User, DollarSign, Package, Hash,
    Printer, Eye, MoreVertical, Pencil, Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { formatCents, formatCentsWithCommas } from '@/lib/format-money'
import { OrderStatusForm } from '@/components/admin/order-status-form'
import { updateOrderStatus } from '@/app/admin/orders/actions'
import { PrintButton } from '@/components/admin/print-button'
import { AdminQRCode } from '@/components/admin/qr-code'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

interface Order {
    id: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    delivery_date?: string
    delivery_time?: string
    delivery_address?: string
    rental_start_date?: string
    rental_end_date?: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrderDetailsPaneProps {
    order: Order
    onBack?: () => void
}

export function OrderDetailsPane({ order, onBack }: OrderDetailsPaneProps) {
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchOrderItems()
    }, [order.id])

    const fetchOrderItems = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(name, image_url)')
            .eq('order_id', order.id)

        if (data) setOrderItems(data)
        setIsLoading(false)
    }

    const handleUpdateStatus = async (formData: FormData) => {
        const newStatus = formData.get('status') as string
        await updateOrderStatus(order.id, newStatus)
        // The real-time sync will update the UI
    }

    const renderOrderItems = () => {
        const bundles: any[] = []
        const standalone: any[] = []
        const bundleMap = new Map()

        orderItems.forEach((item: any) => {
            if (item.bundle_id) {
                if (!bundleMap.has(item.bundle_id)) {
                    const b = {
                        id: item.bundle_id,
                        name: item.package_name || 'Package',
                        price: 0,
                        groups: []
                    }
                    bundleMap.set(item.bundle_id, b)
                    bundles.push(b)
                }
                const b = bundleMap.get(item.bundle_id)
                if (item.price_at_time > 0) b.price = item.price_at_time

                const gName = item.group_name || 'Included Items'
                let group = (b.groups as any[]).find((g: any) => g.name === gName)
                if (!group) {
                    group = { name: gName, items: [] }
                    b.groups.push(group)
                }
                group.items.push(item)
            } else {
                standalone.push(item)
            }
        })

        return (
            <div className="space-y-4">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Product</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-center">Qty</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Price</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {standalone.map((item: any) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                                <TableCell className="text-white font-medium">
                                    {item.products?.name || 'Unknown Product'}
                                </TableCell>
                                <TableCell className="text-white text-center">{item.quantity}</TableCell>
                                <TableCell className="text-[var(--dashboard-text-muted)] text-xs">{formatCents(item.price_at_time)}</TableCell>
                                <TableCell className="text-right text-white font-mono">
                                    {formatCentsWithCommas(item.quantity * item.price_at_time)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {bundles.map((bundle: any) => (
                            <React.Fragment key={bundle.id}>
                                <TableRow className="border-white/10 bg-[var(--dashboard-accent-gold)]/5">
                                    <TableCell className="text-[var(--dashboard-accent-gold)] font-bold">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            {bundle.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell className="text-[var(--dashboard-text-muted)] text-xs">{formatCents(bundle.price)}</TableCell>
                                    <TableCell className="text-right text-[var(--dashboard-accent-gold)] font-bold font-mono">
                                        {formatCentsWithCommas(bundle.price)}
                                    </TableCell>
                                </TableRow>
                                {bundle.groups.map((group: any, gIdx: number) => (
                                    <React.Fragment key={gIdx}>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell colSpan={4} className="pl-10 py-1 font-bold text-[9px] uppercase tracking-widest text-[var(--dashboard-text-muted)] opacity-50">
                                                {group.name}
                                            </TableCell>
                                        </TableRow>
                                        {group.items.map((subItem: any) => (
                                            <TableRow key={subItem.id} className="border-white/5 hover:bg-white/5 opacity-70">
                                                <TableCell className="text-white/80 pl-12 text-xs italic">
                                                    - {subItem.products?.name}
                                                </TableCell>
                                                <TableCell className="text-white/80 text-center text-xs">{subItem.quantity}</TableCell>
                                                <TableCell className="text-[var(--dashboard-text-muted)] text-[10px]">{formatCents(subItem.price_at_time)}</TableCell>
                                                <TableCell className="text-right text-white/80 text-xs font-mono">
                                                    {formatCentsWithCommas(subItem.quantity * subItem.price_at_time)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-end p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Total Amount</p>
                        <p className="text-2xl font-serif font-bold text-[var(--dashboard-accent-gold)]">
                            {formatCentsWithCommas(order.total_amount)}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-black/40 relative">
            {/* Immersive Header */}
            <div className="p-6 md:p-8 pb-4 md:pb-6 border-b border-[var(--dashboard-border)] bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onBack}
                                    className="lg:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2">
                                {order.customer_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--dashboard-text-muted)]">
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 opacity-70" />
                                    Placed {format(new Date(order.created_at), 'PPP')}
                                </span>
                                <span className="opacity-30">•</span>
                                <span className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono text-xs text-[var(--dashboard-accent-gold)]">
                                    <Hash className="h-3 w-3" /> {order.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <PrintButton />
                        <Button asChild className="h-12 px-6 rounded-2xl bg-[var(--dashboard-accent-gold)] text-black font-bold hover:bg-[var(--dashboard-accent-gold)]/90 shadow-lg shadow-[var(--dashboard-accent-gold)]/20 transition-all hover:scale-[1.02]">
                            <Link href={`/admin/orders/${order.id}`}>
                                Full Page View
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 pb-32">
                    {/* Main Info Column */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Order Status & Quick Actions */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-2 mb-6">
                                <ClipboardList className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Workflow Management
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <OrderStatusForm
                                        orderId={order.id}
                                        currentStatus={order.status}
                                        updateStatusAction={handleUpdateStatus}
                                    />
                                </div>
                                <div className="shrink-0 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <AdminQRCode
                                        url={`/admin/orders/${order.id}`}
                                        label="Order Slip"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-2 mb-6">
                                <Package className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Order Items
                            </h3>

                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-10 bg-white/5 rounded-xl" />
                                    <div className="h-24 bg-white/5 rounded-xl" />
                                    <div className="h-24 bg-white/5 rounded-xl" />
                                </div>
                            ) : (
                                renderOrderItems()
                            )}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Customer Info */}
                        <div className="bg-black/20 border border-white/10 rounded-3xl p-6 space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Client Dossier</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <User className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Name</p>
                                        <p className="text-sm font-medium text-white truncate">{order.customer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                        <Mail className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Email</p>
                                        <p className="text-sm font-medium text-white truncate">{order.customer_email}</p>
                                    </div>
                                </div>
                                {order.customer_phone && (
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Phone className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Phone</p>
                                            <p className="text-sm font-medium text-white truncate">{order.customer_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Event Logistics */}
                        <div className="bg-black/20 border border-white/10 rounded-3xl p-6 space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Logistics Intelligence</h4>
                            <div className="space-y-4">
                                {order.delivery_date && (
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                            <Calendar className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Delivery Date</p>
                                            <p className="text-sm font-medium text-white truncate">
                                                {format(new Date(order.delivery_date), 'PPP')}
                                                {order.delivery_time && ` at ${order.delivery_time}`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {order.delivery_address && (
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                            <MapPin className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Location</p>
                                            <p className="text-sm font-medium text-white leading-tight">{order.delivery_address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overbooked Warning */}
                        {order.is_overbooked && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                                    <Hash className="h-3 w-3" />
                                    Inventory Warning
                                </h4>
                                <p className="text-sm text-white font-medium">This order contains items that are currently overbooked for the selected dates.</p>
                                <Button variant="link" className="p-0 h-auto text-red-400 text-xs font-bold uppercase tracking-wider" asChild>
                                    <Link href={`/admin/delivery`}>Review Conflicts</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
