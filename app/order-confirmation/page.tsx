'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Package, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/stripe'
import { format } from 'date-fns'

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const [order, setOrder] = useState<any>(null)
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId) return

            const supabase = createClient()

            // Fetch order
            const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).single()

            if (orderData) {
                setOrder(orderData)

                // Fetch order items with product details
                const { data: itemsData } = await supabase
                    .from('order_items')
                    .select('*, products(*)')
                    .eq('order_id', orderId)

                if (itemsData) {
                    setOrderItems(itemsData)
                }
            }

            setIsLoading(false)
        }

        fetchOrder()
    }, [orderId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">Order not found</p>
                        <Button asChild className="mt-4">
                            <Link href="/catalog">Continue Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
                        <Check className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-serif mb-2">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your order. We've sent a confirmation email to {order.customer_email}
                    </p>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Order Number:</span>
                                <p className="font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Order Date:</span>
                                <p>{format(new Date(order.created_at), 'PPP')}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status:</span>
                                <p className="capitalize">{order.status}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Payment Status:</span>
                                <p className="capitalize">{order.payment_status}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <p>{order.customer_name}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p>{order.customer_email}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Phone:</span>
                                <p>{order.customer_phone}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Delivery Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Delivery Address:</span>
                            <p>{order.delivery_address}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-muted-foreground">Delivery Date:</span>
                                <p>{order.delivery_date ? format(new Date(order.delivery_date), 'PPP') : 'TBD'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Delivery Time:</span>
                                <p>{order.delivery_time || 'TBD'}</p>
                            </div>
                        </div>
                        {order.delivery_notes && (
                            <div>
                                <span className="text-muted-foreground">Special Instructions:</span>
                                <p>{order.delivery_notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                    <div className="h-16 w-16 rounded border bg-muted overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.products?.image_url || '/placeholder.svg'}
                                            alt={item.products?.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.products?.name}</h4>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.price_at_time * item.quantity)}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price_at_time)} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.setup_fee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Setup Fee</span>
                                    <span>{formatCurrency(order.setup_fee)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Tax ({((order.tax_rate || 0) * 100).toFixed(2)}%)
                                </span>
                                <span>{formatCurrency(order.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>{formatCurrency(order.delivery_fee)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="outline">
                        <Link href="/catalog">Continue Shopping</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
