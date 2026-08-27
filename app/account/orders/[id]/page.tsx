'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Check,
    Loader2,
    Package,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    ArrowRight,
    ShoppingBag,
    FileText,
    Download,
    AlertCircle,
    CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/stripe'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { StripeProvider, stripePromise } from '@/components/providers/stripe-provider'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import { createBalancePaymentIntent } from '@/app/actions/create-payment-intent'
import { Elements } from '@stripe/react-stripe-js'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { SignaturePad } from '@/components/signature-pad'

function OrderDetailContent() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string
    const [order, setOrder] = useState<any>(null)
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId) return

            const supabase = createClient()

            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single()

            if (orderError || !orderData) {
                setError('Order not found or you do not have permission to view it.')
                setIsLoading(false)
                return
            }

            setOrder(orderData)

            // Fetch order items with product details
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', orderId)

            if (itemsData) {
                setOrderItems(itemsData)
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
                    groups: [],
                    items: []
                }
                bundleMap.set(item.bundle_id, b)
                bundles.push(b)
            }
            const b = bundleMap.get(item.bundle_id)
            if (item.price_at_time > 0) {
                b.price = item.price_at_time
            }
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
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="h-12 w-12 animate-spin text-gold" />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
                    <AlertCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-serif mb-4">Access Denied</h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">{error || 'Something went wrong.'}</p>
                <Button asChild className="bg-gold text-black hover:bg-black hover:text-white">
                    <Link href="/catalog">Go to Catalog</Link>
                </Button>
            </div>
        )
    }

    const remainingBalance = order.total_amount - (order.balance_paid || 0)
    const isPaid = remainingBalance <= 0 || order.payment_status === 'paid' || order.payment_status === 'succeeded'

    const handlePayBalance = async () => {
        setIsProcessingPayment(true)
        try {
            const result = await createBalancePaymentIntent(order.id, remainingBalance)
            if (result.clientSecret) {
                setClientSecret(result.clientSecret)
                setIsPaymentModalOpen(true)
            } else {
                toast.error(result.error || 'Failed to initialize payment')
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const handlePaymentSuccess = async () => {
        setIsPaymentModalOpen(false)
        toast.success('Payment successful! Updating order...')
        // Refresh order data
        const supabase = createClient()
        const { data } = await supabase.from('orders').select('*').eq('id', order.id).single()
        if (data) setOrder(data)
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-24 md:py-32">
            <div className="container max-w-5xl mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/account/orders" className="text-xs font-bold uppercase tracking-widest text-gold hover:text-black transition-colors">
                                My Orders
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Detail</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tighter">
                            Order <span className="italic text-gold">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="rounded-full border-gold/20 hover:bg-gold/5 flex items-center gap-2"
                            asChild
                        >
                            <a href={`/api/orders/${order.id}/invoice?type=invoice`} download>
                                <Download className="h-4 w-4" />
                                Invoice PDF
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full border-gold/20 hover:bg-gold/5 flex items-center gap-2"
                            asChild
                        >
                            <a href={`/api/orders/${order.id}/invoice?type=agreement`} download>
                                <Download className="h-4 w-4" />
                                Rental Agreement PDF
                            </a>
                        </Button>
                        {!order.signature_url && (
                            <Button
                                onClick={() => setIsSignatureModalOpen(true)}
                                className="rounded-full bg-black text-white hover:bg-gold hover:text-black flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Sign Agreement
                            </Button>
                        )}
                        {!isPaid && order.billing_party === 'partner' && (
                            <p className="text-xs text-muted-foreground max-w-xs text-right">
                                Partner settle-up order — end clients cannot pay this balance on PrimeLux.
                            </p>
                        )}
                        {!isPaid && (
                            <Button
                                onClick={handlePayBalance}
                                disabled={isProcessingPayment}
                                className="rounded-full bg-gold text-black hover:bg-black hover:text-white flex items-center gap-2"
                            >
                                {isProcessingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                {order.billing_party === 'partner'
                                    ? `Pay PrimeLux (${formatCurrency(remainingBalance)})`
                                    : `Pay Balance (${formatCurrency(remainingBalance)})`}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-gold/10 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-gray-50/50 border-b border-gold/10">
                                <CardTitle className="text-lg font-serif">Rental Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {standalone.map((item) => (
                                        <div key={item.id} className="flex gap-6 p-6 group">
                                            <div className="h-24 w-24 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.products?.image_url || '/placeholder.svg'}
                                                    alt={item.products?.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-serif text-lg font-bold truncate">{item.products?.name}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>

                                                {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {Object.entries(item.modifiers).map(([key, val]: [string, any]) => (
                                                            <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                {val.name || key}: {val.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col justify-center">
                                                <p className="font-bold text-gold">{formatCurrency(item.price_at_time * item.quantity)}</p>
                                                <p className="text-xs text-gray-400">{formatCurrency(item.price_at_time)} ea</p>
                                            </div>
                                        </div>
                                    ))}

                                    {bundles.map((bundle) => (
                                        <div key={bundle.id} className="p-6 bg-amber-50/10 border-t border-amber-100/50 first:border-t-0">
                                            <div className="flex gap-6 mb-6">
                                                <div className="h-24 w-24 rounded-2xl border border-gold/10 bg-white flex items-center justify-center flex-shrink-0 text-gold shadow-sm">
                                                    <Package className="h-10 w-10" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-serif text-xl font-bold text-gray-900">{bundle.name}</h4>
                                                            <p className="text-[10px] uppercase tracking-widest font-bold text-gold mt-1">Luxury Package</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gold text-lg">{formatCurrency(bundle.price)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-30 space-y-4 pt-4 border-t border-gold/5">
                                                {bundle.groups.map((group: any, gIdx: number) => (
                                                    <div key={gIdx} className="space-y-2">
                                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{group.name}</p>
                                                        <div className="grid sm:grid-cols-2 gap-2">
                                                            {group.items.map((item: any) => (
                                                                <div key={item.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-gold/5 shadow-sm">
                                                                    <span className="text-gray-700 flex items-center gap-2 font-light">
                                                                        <div className="h-1 w-1 rounded-full bg-gold" />
                                                                        {item.products?.name}
                                                                    </span>
                                                                    <span className="text-gold font-bold">x{item.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50/80 p-8 space-y-4 border-t border-gold/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-light uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.setup_fee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 font-light uppercase tracking-widest text-[10px] font-bold">Setup Fee</span>
                                            <span className="font-medium">{formatCurrency(order.setup_fee || 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-light uppercase tracking-widest text-[10px] font-bold">Tax ({((order.tax_rate || 0) * 100).toFixed(2)}%)</span>
                                        <span className="font-medium">{formatCurrency(order.tax_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-light uppercase tracking-widest text-[10px] font-bold">Delivery Fee</span>
                                        <span className="font-medium">{formatCurrency(order.delivery_fee || 0)}</span>
                                    </div>
                                    <div className="pt-6 border-t border-gold/20">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-serif text-2xl font-light">Total Amount</span>
                                            <span className="font-bold text-3xl text-gold">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-2xl bg-gold/5 border border-gold/10 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Status: <span className={cn(isPaid ? "text-green-600" : "text-amber-600")}>{order.payment_status?.toUpperCase()}</span></p>
                                            <p className="text-sm font-light">Paid: <span className="font-bold text-gray-900">{formatCurrency(order.balance_paid || 0)}</span></p>
                                        </div>
                                        {!isPaid && (
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-red-500 mb-1">Balance Due</p>
                                                <p className="text-xl font-bold text-gray-900">{formatCurrency(remainingBalance)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Details & Logistics */}
                    <div className="space-y-8">
                        {/* Event Details */}
                        <Card className="border-gold/10 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b border-gold/10 bg-gray-50/30">
                                <CardTitle className="flex items-center gap-2 text-md font-serif">
                                    <Calendar className="h-4 w-4 text-gold" />
                                    Event Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</span>
                                        <p className="mt-1 font-medium">{order.delivery_date ? format(new Date(order.delivery_date), 'PPP') : 'TBD'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Time</span>
                                        <p className="mt-1 font-medium">{order.delivery_time || 'TBD'}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Venue Type</span>
                                    <p className="mt-1 font-medium capitalize">{order.venue_type?.replace('_', ' ') || 'Event Space'}</p>
                                </div>
                                <div className="pt-4 border-t border-gold/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Delivery Address</span>
                                    <div className="flex items-start gap-2 mt-2">
                                        <MapPin className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
                                        <p className="text-sm font-light leading-relaxed">{order.delivery_address}</p>
                                    </div>
                                </div>
                                {order.delivery_notes && (
                                    <div className="pt-4 border-t border-gold/5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Special Instructions</span>
                                        <p className="mt-2 text-sm text-gray-500 italic font-light leading-relaxed">"{order.delivery_notes}"</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Agreement & Signature */}
                        {order.signature_url && (
                            <Card className="border-gold/10 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="border-b border-gold/10 bg-gray-50/30">
                                    <CardTitle className="flex items-center gap-2 text-md font-serif">
                                        <FileText className="h-4 w-4 text-gold" />
                                        Rental Agreement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Signature Captured</p>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gold/20 flex items-center justify-center h-32">
                                            <img
                                                src={order.signature_url}
                                                alt="Customer Signature"
                                                className="max-h-full max-w-full object-contain grayscale"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-center font-light italic">
                                            Signed on {order.signed_at ? format(new Date(order.signed_at), 'PPPp') : 'N/A'}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50/50 p-4 border-t border-gold/5">
                                    <Button variant="ghost" size="sm" className="w-full text-gold hover:text-black font-bold uppercase tracking-widest text-[10px]" asChild>
                                        <a href={`/api/orders/${order.id}/invoice?type=agreement`} target="_blank" rel="noreferrer">
                                            View Full Agreement
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {!order.signature_url && (
                            <Card className="border-gold/10 shadow-sm bg-white overflow-hidden border-dashed">
                                <CardContent className="p-10 text-center space-y-4">
                                    <div className="h-16 w-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-lg font-bold">Awaiting Signature</h3>
                                        <p className="text-sm text-muted-foreground">Please sign the rental agreement to confirm your booking.</p>
                                    </div>
                                    <Button
                                        onClick={() => setIsSignatureModalOpen(true)}
                                        className="bg-black text-white hover:bg-gold hover:text-black rounded-full"
                                    >
                                        Sign Now
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Modals */}
                <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                    <DialogContent className="sm:max-w-[600px] border-gold/10 p-0 overflow-hidden">
                        <DialogHeader className="p-8 bg-gray-50/50 border-b border-gold/10">
                            <DialogTitle className="text-2xl font-serif">Sign Rental Agreement</DialogTitle>
                            <DialogDescription>
                                Please draw your signature below to authorize the rental agreement.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8">
                            <SignaturePad
                                orderId={order.id}
                                onSigned={(url) => {
                                    setOrder({ ...order, signature_url: url, signed_at: new Date().toISOString() })
                                    setIsSignatureModalOpen(false)
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-gold/10 p-0 overflow-hidden">
                        <DialogHeader className="p-8 bg-gray-50/50 border-b border-gold/10">
                            <DialogTitle className="text-2xl font-serif">Pay Balance</DialogTitle>
                            <DialogDescription>
                                Securely pay the remaining balance for Order #{order.id.slice(0, 8).toUpperCase()}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8">
                            <div className="mb-6 p-4 rounded-2xl bg-gold/5 border border-gold/10 flex justify-between items-center">
                                <span className="text-sm font-light text-gray-500 uppercase tracking-widest font-bold text-[10px]">Balance Due</span>
                                <span className="text-2xl font-bold text-gold">{formatCurrency(remainingBalance)}</span>
                            </div>
                            {clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm
                                        amount={remainingBalance}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                </Elements>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default function OrderDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                    <Loader2 className="h-12 w-12 animate-spin text-gold" />
                </div>
            }
        >
            <OrderDetailContent />
        </Suspense>
    )
}
