'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createOrder, type CartItem } from '@/app/actions/checkout'
import { useCart } from '@/components/providers/cart-provider'
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function CheckoutReturnContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { items, clearCart, isLoaded } = useCart()

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Processing your payment...')

    const paymentIntentId = searchParams.get('payment_intent')
    const redirectStatus = searchParams.get('redirect_status')

    useEffect(() => {
        if (!isLoaded) return

        if (!paymentIntentId || !redirectStatus) {
            setStatus('error')
            setMessage('Invalid payment information received.')
            return
        }

        if (items.length === 0) {
            setStatus('error')
            setMessage('Your cart is empty. If you believe this is an error, please contact support.')
            return
        }

        const handleReturn = async () => {
            if (redirectStatus === 'succeeded') {
                try {
                    // Retrieve stored form data
                    const savedData = localStorage.getItem('checkout_form_data')
                    if (!savedData) {
                        throw new Error('Could not find order details. Please contact support.')
                    }

                    const parsedData = JSON.parse(savedData)
                    const formData = parsedData.formData

                    // Reconstruct final form data similar to checkout page
                    const finalFormData = {
                        ...formData,
                        deliveryDate: formData.deliveryDate,
                        eventDate: formData.eventDate,
                        pickupDate: parsedData.sameDayPickup
                            ? formData.eventDate
                            : (parsedData.pickupDate ? new Date(parsedData.pickupDate).toISOString().split('T')[0] : ''),
                        pickupTime: parsedData.pickupTime,
                        pickupNotes: parsedData.pickupNotes,
                        sameDayPickup: parsedData.sameDayPickup,
                    }

                    const cartItems: CartItem[] = items.map((item) => ({
                        productId: item.productId,
                        packageId: item.packageId,
                        packageData: item.packageData,
                        packageSelections: item.packageSelections,
                        quantity: item.quantity,
                        modifiers: item.modifiers
                    }))

                    // Create the order
                    const result = await createOrder(finalFormData, cartItems, paymentIntentId)

                    if (result.success) {
                        setStatus('success')
                        clearCart()
                        localStorage.removeItem('checkout_form_data')
                        router.push(`/order-confirmation?orderId=${result.orderId}`)
                    } else {
                        throw new Error(result.error || 'Failed to create order')
                    }

                } catch (err) {
                    console.error(err)
                    setStatus('error')
                    setMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
                }
            } else {
                setStatus('error')
                setMessage('Payment was not successful. Please try again.')
            }
        }

        handleReturn()

    }, [paymentIntentId, redirectStatus, items, router, clearCart, isLoaded])



    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full border-destructive/20">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-serif">Something went wrong</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <Button asChild className="w-full">
                            <Link href="/checkout">Return to Checkout</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
                <h2 className="text-xl font-serif">Finalizing your order...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </div>
        </div>
    )
}

export default function CheckoutReturnPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckoutReturnContent />
        </Suspense>
    )
}
