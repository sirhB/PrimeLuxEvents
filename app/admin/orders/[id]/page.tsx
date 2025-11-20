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
import { toast } from 'sonner'

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
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Email:</span>
                                <span>{order.customer_email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Update the status of this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={updateStatus} className="flex gap-4">
                            <Select name="status" defaultValue={order.status}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Update</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

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
        </div>
    )
}
