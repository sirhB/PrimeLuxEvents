'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface StripePaymentFormProps {
    onSuccess: (paymentIntentId: string) => void
    amount: number
}

export function StripePaymentForm({ onSuccess, amount }: StripePaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        })

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.')
            setIsProcessing(false)
            toast.error('Payment failed', {
                description: error.message
            })
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id)
        } else {
            setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'))
            setIsProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 text-lg bg-gold text-black hover:bg-gold/90 rounded-full font-medium shadow-lg hover:shadow-gold/20 transition-all duration-300"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)}`
                )}
            </Button>
        </form>
    )
}
