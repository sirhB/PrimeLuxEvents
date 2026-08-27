'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getDistanceBetweenAddresses } from '@/lib/geocoding'
import { stripe, createMockPaymentIntent, allowMockPayments } from '@/lib/stripe'
import { resolvePriceCents } from '@/lib/catalog/adapters'

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
    productId?: string
    packageId?: string
    packageData?: {
        name: string
        price: number
    }
    packageSelections?: Record<string, string[]>
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

    // Fetch products for standard items
    const productIds = items
        .filter(item => item.productId)
        .map((item) => item.productId as string)

    // Also fetch products that are part of packages (if we want to validate stock/existence later),
    // but for price calculation, we use the package price.
    // We still return 'products' list for standard items verification.

    let products: any[] = []
    if (productIds.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('id', productIds)
        if (error) throw new Error('Failed to fetch products')
        // plux uses price_cents — normalize for checkout math that reads product.price
        products = (data || []).map((p: any) => ({
            ...p,
            price: resolvePriceCents(p),
            quantity_available:
                typeof p.quantity_available === 'number'
                    ? p.quantity_available
                    : (p.specifications?.quantity_available ?? 1),
        }))
    }

    // Calculate subtotal
    let subtotal = 0
    let setupFee = 0

    items.forEach((item) => {
        // Handle Package Items
        if (item.packageId && item.packageData) {
            subtotal += resolvePriceCents({ price: item.packageData.price }) * item.quantity
            // Packages might have their own setup fee logic, usually included or 0
            return
        }

        // Handle Standard Product Items
        if (item.productId) {
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

    // --- TIERED DISCOUNTS LOGIC ---
    let discountAmount = 0
    let discountName = ''

    // Check if user is logged in and has "planner" role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Check for planner role
        const { data: roles } = await supabase
            .from('user_roles')
            .select('role_id, roles(name)')
            .eq('user_id', user.id)
            .single()

        // Note: The previous schema check showed user_roles links to roles table via role_id.
        // And roles have a 'name' column.

        let isPlanner = false
        if (roles && roles.roles) {
            // Supabase returns joined data as object or array depending on query
            // strict types might require casting, but let's check the shape
            // referencing 20251130_create_user_management_system.sql
            // roles table has 'name'. user_roles has 'role_id'.
            // Actually, let's just use the query:
            const { data: userRole } = await supabase
                .from('user_roles')
                .select('roles!inner(name)')
                .eq('user_id', user.id)
                .eq('roles.name', 'planner')
                .single()

            if (userRole) isPlanner = true
        }

        if (isPlanner) {
            // Fetch active discounts
            const { data: discounts } = await supabase
                .from('tiered_discounts')
                .select('*')
                .eq('is_active', true)
                .order('min_cart_total', { ascending: false }) // Check highest threshold first

            if (discounts && discounts.length > 0) {
                // Find the best eligible discount
                const cartValueCents = subtotal // Discount applies to subtotal (merchandise only usually)

                for (const discount of discounts) {
                    if (cartValueCents >= discount.min_cart_total) {
                        if (discount.discount_type === 'percentage') {
                            // value is percentage (e.g. 5 for 5%)
                            discountAmount = Math.round(subtotal * (discount.discount_value / 100))
                        } else {
                            // value is fixed amount in cents
                            discountAmount = discount.discount_value
                        }

                        // Cap discount at subtotal to prevent negative or free shipping abuse if needed
                        if (discountAmount > subtotal) {
                            discountAmount = subtotal
                        }

                        discountName = discount.name
                        break // Stop after finding the highest applicable tier
                    }
                }
            }
            // ------------------------------

            // Calculate total
            // Total = Subtotal - Discount + Setup + Tax + Delivery
            // Note: Tax usually applies to the discounted price.
            // Let's recalculate tax based on discounted taxable amount.

        }
    }

    // Adjusted Taxable Amount
    const discountedSubtotal = Math.max(0, subtotal - discountAmount)
    const adjustedTaxableAmount = discountedSubtotal + setupFee
    const adjustedTaxAmount = Math.round(adjustedTaxableAmount * taxRate)

    const totalAmount = discountedSubtotal + setupFee + adjustedTaxAmount + deliveryFee

    return {
        subtotal,
        discountAmount,
        discountName,
        setupFee,
        taxRate,
        taxAmount: adjustedTaxAmount,
        deliveryFee,
        totalAmount,
        products,
    }
}

/**
 * Create a new order
 */
export async function createOrder(formData: CheckoutFormData, items: CartItem[], paymentIntentId?: string, signatureUrl?: string, paidAmount?: number) {
    try {
        // Session client for identity; service role for writes after server-side validation
        // (RLS no longer allows open public inserts on orders / items / reservations).
        const supabase = await createClient()
        const admin = createServiceClient()

        // Calculate totals
        const totals = await calculateOrderTotal(items, formData.deliveryAddress)

        // Validate that all STANDARD items exist
        const foundProductIds = totals.products.map(p => p.id)
        const missingProducts = items.filter(i => i.productId && !foundProductIds.includes(i.productId))

        if (missingProducts.length > 0) {
            console.error('Missing products:', missingProducts)
            throw new Error('Some items in your cart are no longer available. Please refresh the page.')
        }

        // Fetch Package Data for validation and decomposition
        const packageIds = [...new Set(items.filter(i => i.packageId).map(i => i.packageId))]
        let packages: any[] = []
        let allOptions: any[] = []

        if (packageIds.length > 0) {
            // 1. Fetch basic packages and static items
            const { data: pkgData, error: pkgError } = await supabase
                .from('packages')
                .select('*, package_items(product_id, quantity)')
                .in('id', packageIds)

            if (pkgError) {
                console.error('Error fetching packages:', pkgError)
                throw new Error('Failed to fetch package details')
            }
            packages = pkgData || []

            // 2. Fetch all groups for these packages
            const { data: groupData, error: groupError } = await supabase
                .from('package_item_groups')
                .select('id, name, package_id')
                .in('package_id', packageIds)

            if (groupError) {
                console.error('Error fetching package groups:', groupError)
            } else {
                const groupIds = groupData?.map(g => g.id) || []

                if (groupIds.length > 0) {
                    // 3. Fetch all options for these groups
                    const { data: optData, error: optError } = await supabase
                        .from('package_item_options')
                        .select('id, product_id, quantity, group_id')
                        .in('group_id', groupIds)

                    if (optError) {
                        console.error('Error fetching options:', optError)
                    } else if (optData) {
                        // Map group name to each option for later use
                        allOptions = optData.map(opt => ({
                            ...opt,
                            group_name: groupData.find(g => g.id === opt.group_id)?.name || 'Selection'
                        }))
                    }
                }
            }
        }

        const missingPackages = items.filter(i => i.packageId && !packages.find(p => p.id === i.packageId))
        if (missingPackages.length > 0) {
            throw new Error('Some packages in your cart are no longer available.')
        }

        // Use provided payment intent ID, create a real Stripe PI, or (dev-only) a mock
        let finalPaymentIntentId = paymentIntentId
        if (!finalPaymentIntentId) {
            if (stripe) {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: paidAmount ?? totals.totalAmount,
                    currency: 'usd',
                    automatic_payment_methods: {
                        enabled: true,
                    },
                })
                finalPaymentIntentId = paymentIntent.id
            } else if (allowMockPayments()) {
                const paymentIntent = await createMockPaymentIntent(paidAmount ?? totals.totalAmount)
                finalPaymentIntentId = paymentIntent.id
            } else {
                throw new Error('Stripe is not configured. Payments cannot be processed.')
            }
        }


        // Check for stock availability
        let isOverbooked = false
        const eventDate = formData.eventDate || formData.deliveryDate
        const startDate = eventDate
        const endDate = eventDate

        // Helper to aggregate required quantities per product ID
        const requiredQuantities: Record<string, number> = {}

        items.forEach(item => {
            if (item.productId) {
                requiredQuantities[item.productId] = (requiredQuantities[item.productId] || 0) + item.quantity
            } else if (item.packageId) {
                const pkg = packages.find(p => p.id === item.packageId)
                if (pkg) {
                    // Static items
                    pkg.package_items?.forEach((pi: any) => {
                        requiredQuantities[pi.product_id] = (requiredQuantities[pi.product_id] || 0) + (item.quantity * (pi.quantity || 1))
                    })
                    // Configurable items (Selections)
                    if (item.packageSelections) {
                        const optionIds = Object.values(item.packageSelections).flat()
                        optionIds.forEach(optId => {
                            const option = allOptions.find(o => o.id === optId)
                            if (option) {
                                requiredQuantities[option.product_id] = (requiredQuantities[option.product_id] || 0) + (item.quantity * (option.quantity || 1))
                            }
                        })
                    }
                }
            }
        })

        // Check stock for aggregated quantities
        for (const [productId, qty] of Object.entries(requiredQuantities)) {
            let product = totals.products.find(p => p.id === productId)
            if (!product) {
                const { data } = await supabase
                    .from('products')
                    .select('name, specifications, price_cents')
                    .eq('id', productId)
                    .single()
                product = data
                    ? {
                          ...data,
                          quantity_available: data.specifications?.quantity_available ?? 1,
                          price: data.price_cents ?? 0,
                      }
                    : null
            }

            if (!product) continue

            // rental_reservations may not exist on plux — treat missing table as zero reserved
            let totalReserved = 0
            try {
                const { data: reservations, error: resErr } = await supabase
                    .from('rental_reservations')
                    .select('quantity')
                    .eq('product_id', productId)
                    .lte('start_date', endDate)
                    .gte('end_date', startDate)
                if (!resErr) {
                    totalReserved = reservations?.reduce((sum, r) => sum + r.quantity, 0) || 0
                }
            } catch {
                totalReserved = 0
            }

            const available = product.quantity_available || 1

            if (totalReserved + qty > available) {
                isOverbooked = true
                console.log(`Overbooking detected for product ${product.name}: Requested ${qty}, Reserved ${totalReserved}, Available ${available}`)
            }
        }

        const {
            data: { user: checkoutUser },
        } = await supabase.auth.getUser()

        const initialBalancePaid = paidAmount ?? (paymentIntentId ? totals.totalAmount : 0)
        const paymentStatus = paymentIntentId
            ? (initialBalancePaid >= totals.totalAmount ? 'paid' : 'partially_paid')
            : 'unpaid'

        // Create order (service role — validated above)
        const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                user_id: checkoutUser?.id ?? null,
                delivery_address: formData.deliveryAddress,
                delivery_date: formData.deliveryDate,
                delivery_time: formData.deliveryTime,
                delivery_notes: formData.deliveryNotes,
                subtotal: totals.subtotal,
                discount_total: totals.discountAmount || 0, // Add this
                discount_name: totals.discountName || null, // Add this
                tax_rate: totals.taxRate,
                tax_amount: totals.taxAmount,
                delivery_fee: totals.deliveryFee,
                setup_fee: totals.setupFee,
                total_amount: totals.totalAmount,
                payment_intent_id: finalPaymentIntentId,
                payment_status: paymentStatus,
                status: 'pending',
                is_overbooked: isOverbooked,
                pickup_date: formData.sameDayPickup ? formData.eventDate : (formData.pickupDate || null),
                pickup_time: formData.pickupTime,
                pickup_notes: formData.pickupNotes,
                same_day_pickup: formData.sameDayPickup || false,
                signature_url: signatureUrl,
                signed_at: signatureUrl ? new Date().toISOString() : null,
                balance_paid: initialBalancePaid,
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error creating order:', orderError)
            throw new Error('Failed to create order')
        }

        // Create order items (Decomposition)
        const orderItems: any[] = []

        items.forEach(item => {
            if (item.productId) {
                const product = totals.products.find((p) => p.id === item.productId)
                const modifiersPrice = Object.values(item.modifiers || {}).reduce((acc: number, curr: any) => {
                    return acc + (curr.priceAdjustment || 0)
                }, 0)
                const priceAtTime = (product?.price || 0) + modifiersPrice

                orderItems.push({
                    order_id: order.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    price_at_time: priceAtTime,
                    modifiers: item.modifiers || {}
                })
            } else if (item.packageId && item.packageData) {
                const pkg = packages.find(p => p.id === item.packageId)
                const packageContents: { productId: string, quantity: number, groupName: string }[] = []

                if (pkg) {
                    pkg.package_items?.forEach((pi: any) => {
                        packageContents.push({
                            productId: pi.product_id,
                            quantity: pi.quantity || 1,
                            groupName: 'Included Items'
                        })
                    })
                }
                if (item.packageSelections) {
                    const optionIds = Object.values(item.packageSelections).flat()
                    optionIds.forEach(optId => {
                        const option = allOptions.find(o => o.id === optId)
                        if (option) {
                            packageContents.push({
                                productId: option.product_id,
                                quantity: option.quantity || 1,
                                groupName: option.group_name || 'Selection'
                            })
                        }
                    })
                }

                if (packageContents.length > 0) {
                    const packagePrice = item.packageData.price
                    const bundleId = crypto.randomUUID()

                    packageContents.forEach((content, index) => {
                        if (content.productId) {
                            orderItems.push({
                                order_id: order.id,
                                product_id: content.productId,
                                quantity: item.quantity * content.quantity,
                                price_at_time: index === 0 ? packagePrice : 0,
                                modifiers: {},
                                package_id: item.packageId,
                                package_name: item.packageData?.name,
                                bundle_id: bundleId,
                                group_name: content.groupName
                            })
                        }
                    })
                }
            }
        })

        if (orderItems.length > 0) {
            const { error: itemsError } = await admin.from('order_items').insert(orderItems)
            if (itemsError) {
                console.error('Error creating order items:', itemsError)
                throw new Error('Failed to create order items')
            }
        }

        // Create rental reservations
        const reservations = Object.entries(requiredQuantities).map(([productId, qty]) => ({
            product_id: productId,
            order_id: order.id,
            start_date: startDate,
            end_date: endDate,
            quantity: qty,
            status: 'confirmed',
        }))

        if (reservations.length > 0) {
            const { error: reservationError } = await admin.from('rental_reservations').insert(reservations)
            if (reservationError) {
                console.error('Error creating reservations:', reservationError)
            }
        }

        return {
            success: true,
            orderId: order.id,
            paymentIntentId: finalPaymentIntentId,
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
 * Confirm payment (Stripe only — mock confirmations are blocked in production)
 */
export async function confirmPayment(paymentIntentId: string) {
    try {
        const admin = createServiceClient()

        if (stripe) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

            await admin
                .from('orders')
                .update({
                    payment_status: paymentIntent.status === 'succeeded' ? 'paid' : paymentIntent.status,
                    payment_method: paymentIntent.payment_method as string,
                })
                .eq('payment_intent_id', paymentIntentId)

            return {
                success: true,
                status: paymentIntent.status,
            }
        }

        if (!allowMockPayments()) {
            throw new Error('Stripe is not configured')
        }

        await admin
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_method: 'mock_card',
            })
            .eq('payment_intent_id', paymentIntentId)

        return {
            success: true,
            status: 'succeeded',
        }
    } catch (error) {
        console.error('Error confirming payment:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}
