import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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

    // Get rental reservations for this order
    const { data: reservations } = await supabase
        .from('rental_reservations')
        .select('*, products(name)')
        .eq('order_id', id)

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
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-muted-foreground mt-1">
                        Order ID: {order.id.slice(0, 8)}...
                    </p>
                </div>
                <PrintButton />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p>{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{order.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Order Date
                                </p>
                                <p>{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Update the status of this order</CardDescription>
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

            {/* Rental Reservations */}
            {reservations && reservations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Rental Reservations
                        </CardTitle>
                        <CardDescription>Scheduled rental dates for this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {reservation.products?.name || 'Unknown Product'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {reservation.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {new Date(reservation.start_date).toLocaleDateString()} -{' '}
                                            {new Date(reservation.end_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            Status: {reservation.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.order_items.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.products?.name || 'Unknown Product'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${item.price_at_time}</TableCell>
                                    <TableCell className="text-right">
                                        ${(item.quantity * item.price_at_time).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={3} className="font-bold text-right">
                                    Total Amount
                                </TableCell>
                                <TableCell className="font-bold text-right">
                                    ${order.total_amount}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                    <CardDescription>Track the progress of this order</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                            <div>
                                <p className="font-medium">Order Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                            <div>
                                <p className="font-medium">Current Status</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {order.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
