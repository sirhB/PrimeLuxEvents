'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface StripePaymentFormProps {
    onSuccess: (paymentIntentId: string, depositPaymentIntentId?: string | null) => void
    amount: number
    /** Refundable security deposit (separate charge) */
    depositAmount?: number
    depositClientSecret?: string | null
    disabled?: boolean
}

export function StripePaymentForm({
    onSuccess,
    amount,
    depositAmount = 0,
    depositClientSecret,
    disabled,
}: StripePaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const totalDue = amount + Math.max(0, depositAmount || 0)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)
        setErrorMessage(null)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: `${window.location.origin}/checkout/return`,
            },
        })

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.')
            setIsProcessing(false)
            toast.error('Payment failed', {
                description: error.message
            })
            return
        }

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
            setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'))
            setIsProcessing(false)
            return
        }

        let depositPaymentIntentId: string | null = null

        // Second charge: refundable security deposit (independent PaymentIntent for easy refunds)
        if (depositClientSecret && depositAmount > 0) {
            const paymentMethod =
                typeof paymentIntent.payment_method === 'string'
                    ? paymentIntent.payment_method
                    : paymentIntent.payment_method?.id

            if (!paymentMethod) {
                setErrorMessage('Order paid, but could not charge the security deposit. Please contact support.')
                setIsProcessing(false)
                return
            }

            const depositResult = await stripe.confirmPayment({
                clientSecret: depositClientSecret,
                redirect: 'if_required',
                confirmParams: {
                    payment_method: paymentMethod,
                    return_url: `${window.location.origin}/checkout/return`,
                },
            })

            if (depositResult.error) {
                setErrorMessage(
                    depositResult.error.message ||
                        'Order payment succeeded, but the security deposit charge failed. Please contact support.',
                )
                setIsProcessing(false)
                toast.error('Security deposit failed', {
                    description: depositResult.error.message,
                })
                return
            }

            if (depositResult.paymentIntent?.status === 'succeeded') {
                depositPaymentIntentId = depositResult.paymentIntent.id
            } else {
                setErrorMessage(
                    'Security deposit status: ' +
                        (depositResult.paymentIntent?.status || 'unknown'),
                )
                setIsProcessing(false)
                return
            }
        }

        try {
            await onSuccess(paymentIntent.id, depositPaymentIntentId)
        } catch (err) {
            console.error('Error in onSuccess callback:', err)
            setErrorMessage('Payment succeeded, but order creation failed. Please contact support.')
            setIsProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            {depositAmount > 0 && (
                <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm space-y-1">
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Order payment</span>
                        <span className="font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Security deposit (refundable)</span>
                        <span className="font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(depositAmount / 100)}
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                        Charged as a separate payment so your deposit can be refunded after return without touching the rental charge.
                    </p>
                </div>
            )}

            {errorMessage && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing || disabled}
                className="w-full h-12 text-base bg-gold text-black hover:bg-gold/90 rounded-full font-medium shadow-md transition-all duration-300"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing…
                    </>
                ) : (
                    `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDue / 100)}`
                )}
            </Button>
        </form>
    )
}
