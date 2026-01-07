import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Package } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'
import { ArrowLeft, Printer, Calendar, MapPin, Wrench } from 'lucide-react'
import Link from 'next/link'
import { PrintButton } from '@/components/admin/print-button'
import { OrderStatusForm } from '@/components/admin/order-status-form'
import { OrderInvoice } from '@/components/admin/order-invoice'
import { formatCents } from '@/lib/format-money'

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, image_url))')
        .eq('id', id)
        .single()



    if (error || !order) {
        notFound()
    }

    async function updateStatus(formData: FormData) {
        'use server'
        const status = formData.get('status') as string
        const supabase = await createClient()
        await supabase.from('orders').update({ status }).eq('id', id)
        revalidatePath(`/admin/orders/${id}`)
        revalidatePath('/admin/orders')
    }

    return (
        <>
            {/* Invoice for printing */}
            <OrderInvoice order={order} />

            {/* Order details for screen viewing */}
            <div className="flex flex-col gap-8 print:hidden p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="glass-card hover:bg-[var(--dashboard-card-hover)]">
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-4xl font-serif font-light tracking-tight text-[var(--dashboard-text)]">Order Details</h1>
                        <p className="text-[var(--dashboard-text-muted)] mt-1 font-light">
                            Order ID: {order.id.slice(0, 8)}...
                        </p>
                    </div>
                    <PrintButton />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Customer Information */}
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle className="text-[var(--dashboard-text)] font-serif font-light">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] mb-1">Name</p>
                                    <p className="text-[var(--dashboard-text)]">{order.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] mb-1">Email</p>
                                    <p className="text-[var(--dashboard-text)]">{order.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] mb-1">
                                        Order Date
                                    </p>
                                    <p className="text-[var(--dashboard-text)]">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status */}
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle className="text-[var(--dashboard-text)] font-serif font-light">Order Status</CardTitle>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">Update the status of this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderStatusForm
                                orderId={order.id}
                                currentStatus={order.status}
                                updateStatusAction={updateStatus}
                            />
                        </CardContent>
                    </Card>
                </div>



                {/* Order Items */}
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-[var(--dashboard-text)] font-serif font-light">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[var(--dashboard-border)] hover:bg-transparent">
                                    <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Product</TableHead>
                                    <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Quantity</TableHead>
                                    <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Price</TableHead>
                                    <TableHead className="text-right text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(() => {
                                    const bundles: any[] = []
                                    const standalone: any[] = []
                                    const bundleMap = new Map()

                                    order.order_items.forEach((item: any) => {
                                        if (item.bundle_id) {
                                            if (!bundleMap.has(item.bundle_id)) {
                                                const b = { id: item.bundle_id, name: item.package_name || 'Package', price: 0, items: [] }
                                                bundleMap.set(item.bundle_id, b)
                                                bundles.push(b)
                                            }
                                            const b = bundleMap.get(item.bundle_id)
                                            if (item.price_at_time > 0) b.price = item.price_at_time
                                            b.items.push(item)
                                        } else {
                                            standalone.push(item)
                                        }
                                    })

                                    return (
                                        <>
                                            {standalone.map((item: any) => (
                                                <TableRow key={item.id} className="border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]">
                                                    <TableCell className="text-[var(--dashboard-text)]">
                                                        <div className="flex items-center gap-3">
                                                            {item.products?.name || 'Unknown Product'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-[var(--dashboard-text)]">{item.quantity}</TableCell>
                                                    <TableCell className="text-[var(--dashboard-text)]">{formatCents(item.price_at_time)}</TableCell>
                                                    <TableCell className="text-right text-[var(--dashboard-text)]">
                                                        {formatCents(item.quantity * item.price_at_time)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {bundles.map((bundle: any) => (
                                                <React.Fragment key={bundle.id}>
                                                    <TableRow className="border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/30">
                                                        <TableCell className="text-[var(--dashboard-accent-gold)] font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                {bundle.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-[var(--dashboard-text)]">-</TableCell>
                                                        <TableCell className="text-[var(--dashboard-text)]">{formatCents(bundle.price)}</TableCell>
                                                        <TableCell className="text-right text-[var(--dashboard-accent-gold)] font-bold">
                                                            {formatCents(bundle.price)}
                                                        </TableCell>
                                                    </TableRow>
                                                    {bundle.items.map((subItem: any) => (
                                                        <TableRow key={subItem.id} className="border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)] opacity-70">
                                                            <TableCell className="text-[var(--dashboard-text)] pl-10 text-xs italic">
                                                                - {subItem.products?.name}
                                                            </TableCell>
                                                            <TableCell className="text-[var(--dashboard-text)] text-xs">{subItem.quantity}</TableCell>
                                                            <TableCell className="text-[var(--dashboard-text)] text-xs">{formatCents(subItem.price_at_time)}</TableCell>
                                                            <TableCell className="text-right text-[var(--dashboard-text)] text-xs">
                                                                {formatCents(subItem.quantity * subItem.price_at_time)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )
                                })()}
                                <TableRow className="border-[var(--dashboard-border)] hover:bg-transparent">
                                    <TableCell colSpan={3} className="font-bold text-right text-[var(--dashboard-text)] uppercase text-sm tracking-wider">
                                        Total Amount
                                    </TableCell>
                                    <TableCell className="font-bold text-right text-[var(--dashboard-accent-gold)] text-lg">
                                        {formatCents(order.total_amount)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-[var(--dashboard-text)] font-serif font-light">Order Timeline</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Track the progress of this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-3 w-3 rounded-full bg-[var(--dashboard-accent-gold)] mt-1 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                <div>
                                    <p className="font-medium text-[var(--dashboard-text)]">Order Created</p>
                                    <p className="text-sm text-[var(--dashboard-text-muted)] opacity-70">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-3 w-3 rounded-full bg-[var(--dashboard-text-muted)] opacity-30 mt-1" />
                                <div>
                                    <p className="font-medium text-[var(--dashboard-text)]">Current Status</p>
                                    <p className="text-sm text-[var(--dashboard-text-muted)] capitalize opacity-70">
                                        {order.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
