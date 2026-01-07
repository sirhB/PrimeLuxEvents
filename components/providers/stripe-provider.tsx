'use client'

import { ReactNode } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe'

export const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface StripeProviderProps {
    children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    )
}
