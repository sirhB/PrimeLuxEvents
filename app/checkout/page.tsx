'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { createOrder, calculateOrderTotal, type CheckoutFormData, type CartItem } from '@/app/actions/checkout'
import { formatCurrency } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, eventDetails, clearCart, isLoaded } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [products, setProducts] = useState<any[]>([])
    const [totals, setTotals] = useState<any>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: eventDetails?.venueAddress || '',
        deliveryDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        deliveryTime: eventDetails?.startTime || '',
        deliveryNotes: '',
        eventDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        eventType: eventDetails?.eventType || '',
        venueAddress: eventDetails?.venueAddress || '',
    })

    // Redirect if cart is empty
    useEffect(() => {
        if (isLoaded && items.length === 0) {
            router.push('/catalog')
        }
    }, [items, isLoaded, router])

    // Fetch products and calculate totals
    useEffect(() => {
        async function fetchProductsAndCalculate() {
            if (items.length === 0 || !formData.deliveryAddress) return

            const supabase = createClient()
            const productIds = items.map((item) => item.productId)
            const { data } = await supabase.from('products').select('*').in('id', productIds)

            if (data) {
                setProducts(data)
            }
        }

        fetchProductsAndCalculate()
    }, [items])

    // Recalculate totals when delivery address changes
    useEffect(() => {
        async function recalculateTotals() {
            if (!formData.deliveryAddress || items.length === 0) return

            setIsCalculating(true)
            try {
                const cartItems: CartItem[] = items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }))

                const calculated = await calculateOrderTotal(cartItems, formData.deliveryAddress)
                setTotals(calculated)
            } catch (err) {
                console.error('Error calculating totals:', err)
            } finally {
                setIsCalculating(false)
            }
        }

        const debounce = setTimeout(() => {
            recalculateTotals()
        }, 500)

        return () => clearTimeout(debounce)
    }, [formData.deliveryAddress, items])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const cartItems: CartItem[] = items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }))

            const result = await createOrder(formData, cartItems)

            if (result.success) {
                setIsSuccess(true)
                clearCart()

                // Redirect to success page after 2 seconds
                setTimeout(() => {
                    router.push(`/order-confirmation?orderId=${result.orderId}`)
                }, 2000)
            } else {
                setError(result.error || 'Failed to create order')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    if (items.length === 0) {
        return null
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto">
                            <Check className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-serif">Order Placed Successfully!</h2>
                        <p className="text-muted-foreground">
                            Thank you for your order. You'll receive a confirmation email shortly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container max-w-6xl mx-auto px-4">
                <h1 className="text-4xl font-serif mb-8">Checkout</h1>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>We'll use this to contact you about your order</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Full Name *</Label>
                                    <Input
                                        id="customerName"
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email *</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        required
                                        value={formData.customerEmail}
                                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone Number *</Label>
                                    <Input
                                        id="customerPhone"
                                        type="tel"
                                        required
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Details</CardTitle>
                                <CardDescription>When and where should we deliver your items?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                                    <Textarea
                                        id="deliveryAddress"
                                        required
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        placeholder="123 Main St, New York, NY 10001"
                                    />
                                    {isCalculating && (
                                        <p className="text-sm text-muted-foreground">Calculating delivery fee...</p>
                                    )}
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryDate">Delivery Date *</Label>
                                        <Input
                                            id="deliveryDate"
                                            type="date"
                                            required
                                            value={formData.deliveryDate}
                                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryTime">Delivery Time *</Label>
                                        <Input
                                            id="deliveryTime"
                                            type="time"
                                            required
                                            value={formData.deliveryTime}
                                            onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryNotes">Special Instructions (Optional)</Label>
                                    <Textarea
                                        id="deliveryNotes"
                                        value={formData.deliveryNotes}
                                        onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                        placeholder="Loading dock access, parking instructions, etc."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                                <CardDescription>Secure payment processing powered by Stripe</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/50 border border-border rounded-lg p-6 text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Payment processing will be integrated once Stripe is configured.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        For now, orders will be created with pending payment status.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Cart Items */}
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {items.map((item) => {
                                        const product = products.find((p) => p.id === item.productId)
                                        if (!product) return null

                                        return (
                                            <div key={item.productId} className="flex gap-3 text-sm">
                                                <div className="h-12 w-12 rounded border bg-muted overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={product.image_url || '/placeholder.svg'}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.name}</p>
                                                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">{formatCurrency(product.price * item.quantity)}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Totals */}
                                {totals && (
                                    <div className="space-y-2 pt-4 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatCurrency(totals.subtotal)}</span>
                                        </div>
                                        {totals.setupFee > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Setup Fee</span>
                                                <span>{formatCurrency(totals.setupFee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax ({(totals.taxRate * 100).toFixed(2)}%)</span>
                                            <span>{formatCurrency(totals.taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Delivery Fee</span>
                                            <span>{isCalculating ? '...' : formatCurrency(totals.deliveryFee)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>{formatCurrency(totals.totalAmount)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-destructive">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || isCalculating || !totals}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </Button>

                                <p className="text-xs text-muted-foreground text-center">
                                    By placing your order, you agree to our terms and conditions.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    )
}
