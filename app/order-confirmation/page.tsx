'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Package, Mail, Phone, MapPin, Calendar, Clock, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/stripe'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

function OrderConfirmationContent() {
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

                // Trigger confetti
                const duration = 3 * 1000
                const animationEnd = Date.now() + duration
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now()

                    if (timeLeft <= 0) {
                        return clearInterval(interval)
                    }

                    const particleCount = 50 * (timeLeft / duration)

                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
                }, 250)
            }

            setIsLoading(false)
        }

        fetchOrder()
    }, [orderId])

    // Derived variables for grouping
    const bundles: any[] = []
    const standalone: any[] = []
    const bundleMap = new Map()

    orderItems.forEach(item => {
        if (item.bundle_id) {
            if (!bundleMap.has(item.bundle_id)) {
                const b = {
                    id: item.bundle_id,
                    name: item.package_name || 'Package',
                    price: 0,
                    groups: [], // Array of { name: string, items: [] }
                    items: []
                }
                bundleMap.set(item.bundle_id, b)
                bundles.push(b)
            }
            const b = bundleMap.get(item.bundle_id)
            if (item.price_at_time > 0) {
                b.price = item.price_at_time
            }
            // Group by group_name within the bundle
            const gName = item.group_name || 'Included Items'
            let group = b.groups.find((g: any) => g.name === gName)
            if (!group) {
                group = { name: gName, items: [] }
                b.groups.push(group)
            }
            group.items.push(item)
            b.items.push(item)
        } else {
            standalone.push(item)
        }
    })

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
        <div className="min-h-screen bg-background py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent -z-10" />

            <div className="container max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-6 shadow-sm"
                    >
                        <Check className="h-12 w-12" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">Order Confirmed!</h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Thank you for choosing PrimeLux Events. We've sent a confirmation email to <span className="font-medium text-foreground">{order.customer_email}</span>.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                        <Package className="h-4 w-4" />
                        Order #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-6"
                >
                    <Card className="overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(order.created_at), 'PPP')}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {standalone.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-6 hover:bg-muted/10 transition-colors">
                                        <div className="h-20 w-20 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.products?.image_url || '/placeholder.svg'}
                                                alt={item.products?.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-base truncate">{item.products?.name}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(item.price_at_time * item.quantity)}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price_at_time)} ea</p>
                                        </div>
                                    </div>
                                ))}

                                {bundles.map((bundle) => (
                                    <div key={bundle.id} className="p-6 hover:bg-muted/10 transition-colors border-t border-border/50 first:border-t-0">
                                        <div className="flex gap-4 mb-4">
                                            <div className="h-20 w-20 rounded-lg border bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                                                <Package className="h-10 w-10" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-base text-amber-900">{bundle.name}</h4>
                                                        <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mt-1">Package Deal</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-amber-900">{formatCurrency(bundle.price)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-24 space-y-4 pt-2 border-t border-border/10">
                                            {bundle.groups.map((group: any, gIdx: number) => (
                                                <div key={gIdx} className="space-y-2">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{group.name}</p>
                                                    {group.items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-muted-foreground flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                                                                {item.products?.name}
                                                            </span>
                                                            <span className="text-gray-400">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-muted/30 p-6 space-y-3">
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
                                <div className="flex justify-between font-serif text-xl pt-4 border-t border-border/50 mt-4">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-border/50 shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-serif">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Delivery Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</span>
                                    <p className="mt-1">{order.delivery_address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p>{order.delivery_date ? format(new Date(order.delivery_date), 'PPP') : 'TBD'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <p>{order.delivery_time || 'TBD'}</p>
                                        </div>
                                    </div>
                                </div>
                                {order.delivery_notes && (
                                    <div className="pt-2 border-t border-border/50">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</span>
                                        <p className="mt-1 text-sm text-muted-foreground italic">"{order.delivery_notes}"</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-serif">
                                    <Mail className="h-5 w-5 text-primary" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</span>
                                    <p className="mt-1 font-medium">{order.customer_name}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                                    <p className="mt-1">{order.customer_email}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p>{order.customer_phone}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button asChild variant="outline" size="lg" className="h-12 px-8">
                            <Link href="/catalog">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="h-12 px-8">
                            <Link href="/">
                                Return Home
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <OrderConfirmationContent />
        </Suspense>
    )
}
