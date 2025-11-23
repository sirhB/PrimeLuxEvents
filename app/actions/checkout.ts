'use server'

import { createClient } from '@/lib/supabase/server'
import { getDistanceBetweenAddresses } from '@/lib/geocoding'
import { stripe, createMockPaymentIntent } from '@/lib/stripe'

export interface CheckoutFormData {
    customerName: string
    customerEmail: string
    customerPhone: string
    deliveryAddress: string
    deliveryDate: string
    deliveryTime: string
    deliveryNotes?: string
    eventDate: string
    eventType: string
    venueAddress: string
    pickupDate?: string
    pickupTime?: string
    pickupNotes?: string
    sameDayPickup?: boolean
}

export interface CartItem {
    productId: string
    quantity: number
    modifiers?: Record<string, any>
}

/**
 * Get settings from database
 */
async function getSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('settings').select('key, value')

    if (error) {
        console.error('Error fetching settings:', error)
        return null
    }

    const settings: Record<string, string> = {}
    data.forEach((setting) => {
        settings[setting.key] = setting.value
    })

    return settings
}

/**
 * Calculate delivery fee based on distance
 */
export async function calculateDeliveryFee(deliveryAddress: string): Promise<number> {
    try {
        const settings = await getSettings()
        if (!settings) {
            return 5000 // Default $50 if settings not available
        }

        const warehouseAddress = settings.warehouse_address || '123 Main St, New York, NY 10001'
        const baseFee = parseInt(settings.delivery_base_fee || '5000')
        const perMileRate = parseInt(settings.delivery_per_mile_rate || '150')

        // Calculate distance
        const distance = await getDistanceBetweenAddresses(warehouseAddress, deliveryAddress)

        if (distance === null) {
            console.error('Could not calculate distance, using base fee only')
            return baseFee
        }

        // Base fee + (distance * per mile rate)
        const totalFee = baseFee + Math.round(distance * perMileRate)

        return totalFee
    } catch (error) {
        console.error('Error calculating delivery fee:', error)
        return 5000 // Default $50 on error
    }
}

/**
 * Calculate order totals
 */
export async function calculateOrderTotal(items: CartItem[], deliveryAddress: string) {
    const supabase = await createClient()

    // Fetch products
    const productIds = items.map((item) => item.productId)
    const { data: products, error } = await supabase.from('products').select('*').in('id', productIds)

    if (error || !products) {
        throw new Error('Failed to fetch products')
    }

    // Calculate subtotal
    let subtotal = 0
    let setupFee = 0

    items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
            // Calculate modifier price
            const modifiersPrice = Object.values(item.modifiers || {}).reduce((acc: number, curr: any) => {
                return acc + (curr.priceAdjustment || 0)
            }, 0)

            subtotal += (product.price + modifiersPrice) * item.quantity
            if (product.setup_fee) {
                setupFee += product.setup_fee * item.quantity
            }
        }
    })

    // Get settings for tax rate
    const settings = await getSettings()
    const taxRate = parseFloat(settings?.tax_rate || '0.08875')

    // Calculate delivery fee
    const deliveryFee = await calculateDeliveryFee(deliveryAddress)

    // Calculate tax (on subtotal + setup fee, not delivery)
    const taxableAmount = subtotal + setupFee
    const taxAmount = Math.round(taxableAmount * taxRate)

    // Calculate total
    const totalAmount = subtotal + setupFee + taxAmount + deliveryFee

    return {
        subtotal,
        setupFee,
        taxRate,
        taxAmount,
        deliveryFee,
        totalAmount,
        products,
    }
}

/**
 * Create a new order
 */
export async function createOrder(formData: CheckoutFormData, items: CartItem[]) {
    try {
        const supabase = await createClient()

        // Calculate totals
        const totals = await calculateOrderTotal(items, formData.deliveryAddress)

        // Validate that all items exist
        if (totals.products.length !== items.length) {
            const foundIds = totals.products.map(p => p.id)
            const missingItems = items.filter(i => !foundIds.includes(i.productId))
            console.error('Missing products:', missingItems)
            throw new Error('Some items in your cart are no longer available. Please refresh the page.')
        }

        // Create payment intent (mock for now if no Stripe key)
        let paymentIntent
        if (stripe) {
            paymentIntent = await stripe.paymentIntents.create({
                amount: totals.totalAmount,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
            })
        } else {
            paymentIntent = await createMockPaymentIntent(totals.totalAmount)
        }

        // Check for stock availability
        let isOverbooked = false
        const eventDate = formData.eventDate || formData.deliveryDate

        // We'll assume a standard 1-day rental for now, or 3-day window (day before, day of, day after)
        // For strict checking, let's just check the event date
        const startDate = eventDate
        const endDate = eventDate

        for (const item of items) {
            const product = totals.products.find(p => p.id === item.productId)
            if (!product) continue

            // Get total reserved quantity for this product on this date
            const { data: reservations } = await supabase
                .from('rental_reservations')
                .select('quantity')
                .eq('product_id', item.productId)
                .lte('start_date', endDate)
                .gte('end_date', startDate)

            const totalReserved = reservations?.reduce((sum, r) => sum + r.quantity, 0) || 0
            const available = product.quantity_available || 0 // Default to 0 if not set, or maybe 1? Schema says default 1.

            if (totalReserved + item.quantity > available) {
                isOverbooked = true
                console.log(`Overbooking detected for product ${product.name}: Requested ${item.quantity}, Reserved ${totalReserved}, Available ${available}`)
            }
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                delivery_address: formData.deliveryAddress,
                delivery_date: formData.deliveryDate,
                delivery_time: formData.deliveryTime,
                delivery_notes: formData.deliveryNotes,
                subtotal: totals.subtotal,
                tax_rate: totals.taxRate,
                tax_amount: totals.taxAmount,
                delivery_fee: totals.deliveryFee,
                setup_fee: totals.setupFee,
                total_amount: totals.totalAmount,
                payment_intent_id: paymentIntent.id,
                payment_status: 'pending',
                status: 'pending',
                is_overbooked: isOverbooked,
                pickup_date: formData.sameDayPickup ? formData.eventDate : (formData.pickupDate || null),
                pickup_time: formData.pickupTime,
                pickup_notes: formData.pickupNotes,
                same_day_pickup: formData.sameDayPickup || false,
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error creating order:', orderError)
            throw new Error('Failed to create order')
        }

        // Create order items
        const orderItems = items.map((item) => {
            const product = totals.products.find((p) => p.id === item.productId)
            const modifiersPrice = Object.values(item.modifiers || {}).reduce((acc: number, curr: any) => {
                return acc + (curr.priceAdjustment || 0)
            }, 0)
            const priceAtTime = (product?.price || 0) + modifiersPrice

            return {
                order_id: order.id,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_time: priceAtTime,
                modifiers: item.modifiers || {}
            }
        })

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

        if (itemsError) {
            console.error('Error creating order items:', itemsError)
            throw new Error('Failed to create order items')
        }

        // Create rental reservations to block stock for this order
        const reservations = items.map((item) => ({
            product_id: item.productId,
            order_id: order.id,
            start_date: startDate,
            end_date: endDate,
            quantity: item.quantity,
            status: 'confirmed', // or pending
        }))

        const { error: reservationError } = await supabase.from('rental_reservations').insert(reservations)

        if (reservationError) {
            console.error('Error creating reservations:', reservationError)
            // We don't fail the order here, but we should log it. 
            // In a real system we might want to rollback or alert admin.
        }

        return {
            success: true,
            orderId: order.id,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        }
    } catch (error) {
        console.error('Error in createOrder:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

/**
 * Confirm payment (placeholder for Stripe integration)
 */
export async function confirmPayment(paymentIntentId: string) {
    try {
        const supabase = await createClient()

        if (stripe) {
            // Real Stripe confirmation
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

            // Update order payment status
            await supabase
                .from('orders')
                .update({
                    payment_status: paymentIntent.status,
                    payment_method: paymentIntent.payment_method as string,
                })
                .eq('payment_intent_id', paymentIntentId)

            return {
                success: true,
                status: paymentIntent.status,
            }
        } else {
            // Mock confirmation for development
            await supabase
                .from('orders')
                .update({
                    payment_status: 'succeeded',
                    payment_method: 'mock_card',
                })
                .eq('payment_intent_id', paymentIntentId)

            return {
                success: true,
                status: 'succeeded',
            }
        }
    } catch (error) {
        console.error('Error confirming payment:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}
