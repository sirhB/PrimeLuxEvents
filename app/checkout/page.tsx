'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Check, AlertCircle, CalendarIcon, Clock, ArrowRight, ArrowLeft, ShoppingBag, Plus, Minus, Package, X } from 'lucide-react'
import { createOrder, calculateOrderTotal, type CheckoutFormData, type CartItem } from '@/app/actions/checkout'
import { uploadSignatureImage } from '@/app/actions/upload-signature'
import { formatCurrency } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/client'
import { adaptProduct, resolvePriceCents } from '@/lib/catalog/adapters'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { stripePromise } from '@/components/providers/stripe-provider'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import { createPaymentIntent } from '@/app/actions/create-payment-intent'
import { Elements } from '@stripe/react-stripe-js'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { SignatureCanvas } from '@/components/checkout/signature-canvas'




export default function CheckoutPage() {
    const router = useRouter()
    const { items, eventDetails, clearCart, isLoaded, addItem, updateQuantity, setEventDetails, removeItem } = useCart()
    const [currentStep, setCurrentStep] = useState(1)

    // Step 1: Supplemental Items State
    const [supplementalProducts, setSupplementalProducts] = useState<any[]>([])
    const [isLoadingSupplemental, setIsLoadingSupplemental] = useState(true)
    const [supplementalQuantities, setSupplementalQuantities] = useState<Record<string, number>>({})

    // Step 2 & 3 State
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cartProducts, setCartProducts] = useState<any[]>([])
    const [totals, setTotals] = useState<any>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [agreesToRentalAgreement, setAgreesToRentalAgreement] = useState(false)
    const [signatureData, setSignatureData] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [paymentChoice, setPaymentChoice] = useState<'full' | 'deposit'>('full')
    const [customAmount, setCustomAmount] = useState<string>('')
    const [paidAmount, setPaidAmount] = useState<number>(0)


    // Form Data
    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '(555) 123-4567',
        deliveryAddress: eventDetails?.venueAddress || '123 Test Avenue, New York, NY',
        deliveryDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        deliveryTime: eventDetails?.startTime || '09:00',
        deliveryNotes: eventDetails?.logistics?.notes || 'Gate code: 1234',
        eventDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        eventType: eventDetails?.eventType || 'Test Event',
        venueAddress: eventDetails?.venueAddress || '123 Test Avenue, New York, NY',
        pickupDate: '',
        pickupTime: '10:00',
        pickupNotes: '',
        sameDayPickup: false,
    })

    // Additional Event Details State (not directly in CheckoutFormData but needed for UI/Logic)
    const [date, setDate] = useState<Date | undefined>(eventDetails?.date || new Date(new Date().setDate(new Date().getDate() + 7)))
    const [startTime, setStartTime] = useState(eventDetails?.startTime || "14:00")
    const [endTime, setEndTime] = useState(eventDetails?.endTime || "18:00")
    const [venueType, setVenueType] = useState(eventDetails?.venueType || "private_residence")
    const [hasElevator, setHasElevator] = useState(eventDetails?.logistics?.hasElevator || false)
    const [hasStairs, setHasStairs] = useState(eventDetails?.logistics?.hasStairs || false)
    const [hasLoadingDock, setHasLoadingDock] = useState(eventDetails?.logistics?.hasLoadingDock || false)

    // Pickup Details State
    const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 8)))
    const [pickupTime, setPickupTime] = useState("10:00")
    const [sameDayPickup, setSameDayPickup] = useState(false)
    const [pickupNotes, setPickupNotes] = useState("")

    // Redirect if cart is empty (only if loaded and not successful)
    useEffect(() => {
        if (isLoaded && items.length === 0 && !isSuccess) {
            router.push('/catalog')
        }
    }, [items, isLoaded, router, isSuccess])

    // Fetch Supplemental Products
    useEffect(() => {
        async function fetchSupplemental() {
            const supabase = createClient()
            // Fetch some products and filter client side to be safe
            const cartIds = items.map(i => i.productId)

            const { data } = await supabase.from('products').select('*').limit(20)

            if (data) {
                // Filter out items already in cart; normalize plux price_cents → price
                const available = data
                    .map((row) => adaptProduct(row))
                    .filter((p): p is NonNullable<ReturnType<typeof adaptProduct>> => p != null && p.is_active)
                    .filter((p) => !cartIds.includes(p.id))
                // Shuffle and take 8
                const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 8)
                setSupplementalProducts(shuffled)

                // Initialize quantities to 1 for each product
                const initialQuantities: Record<string, number> = {}
                shuffled.forEach(p => {
                    initialQuantities[p.id] = 1
                })
                setSupplementalQuantities(initialQuantities)
            }
            setIsLoadingSupplemental(false)
        }

        if (currentStep === 1) {
            fetchSupplemental()
        }
    }, [currentStep, items])

    // Helper function to update supplemental product quantity
    const updateSupplementalQuantity = (productId: string, quantity: number) => {
        setSupplementalQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, Math.min(99, quantity))
        }))
    }

    // Helper function to add supplemental item to cart
    const handleAddSupplementalItem = (product: any) => {
        const quantity = supplementalQuantities[product.id] || 1
        addItem(product.id, quantity)
        toast.success('Added to cart!', {
            description: `${product.name} (${quantity})`
        })
    }

    // Fetch Cart Products
    useEffect(() => {
        async function fetchCartProducts() {
            if (items.length === 0) return

            const productIds = items.filter(item => item.productId).map((item) => item.productId)

            if (productIds.length === 0) {
                setCartProducts([])
                return
            }

            const supabase = createClient()
            const { data } = await supabase.from('products').select('*').in('id', productIds)

            if (data) {
                const adapted = data
                    .map((row) => adaptProduct(row))
                    .filter((p): p is NonNullable<ReturnType<typeof adaptProduct>> => p != null)
                setCartProducts(adapted)

                // Check for invalid items and remove them
                // Only check standard products
                const validIds = adapted.map(p => p.id)
                const invalidItems = items.filter(i => i.productId && !validIds.includes(i.productId))

                if (invalidItems.length > 0) {
                    console.log("Removing invalid items:", invalidItems)
                    // We need to be careful not to trigger infinite loops if removeItem updates items dependency
                    // But since we are inside useEffect[items], updating items will trigger this again.
                    // However, next time invalidItems will be empty.
                    // To avoid multiple re-renders, we can just do it.

                    invalidItems.forEach(item => {
                        removeItem(item.id)
                    })

                    toast.error("Some items were removed as they are no longer available")
                }
            }
        }
        fetchCartProducts()
    }, [items])

    // Calculate Totals
    useEffect(() => {
        async function recalculateTotals() {
            // We need at least a delivery address to calculate delivery fee
            // If we are in step 1 or 2, we might not have a final address yet, 
            // but we can try to calculate if address is present.
            // For step 3, we definitely need it.

            const addressToUse = formData.deliveryAddress || formData.venueAddress
            if (!addressToUse || items.length === 0) return

            setIsCalculating(true)
            try {
                const cartItems: CartItem[] = items.map((item) => ({
                    productId: item.productId,
                    packageId: item.packageId,
                    packageData: item.packageData,
                    packageSelections: item.packageSelections,
                    quantity: item.quantity,
                    modifiers: item.modifiers
                }))

                const calculated = await calculateOrderTotal(cartItems, addressToUse)

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
    }, [formData.deliveryAddress, formData.venueAddress, items])

    // Sync local state to formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            deliveryDate: date ? format(date, 'yyyy-MM-dd') : prev.deliveryDate,
            eventDate: date ? format(date, 'yyyy-MM-dd') : prev.eventDate,
            deliveryTime: startTime || prev.deliveryTime,
        }))
    }, [date, startTime])

    // Load saved data from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('checkout_form_data')
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData)

                // Restore Form Data
                if (parsed.formData) setFormData(parsed.formData)

                // Restore Event Details
                if (parsed.date) setDate(new Date(parsed.date))
                if (parsed.startTime) setStartTime(parsed.startTime)
                if (parsed.endTime) setEndTime(parsed.endTime)
                if (parsed.venueType) setVenueType(parsed.venueType)

                // Restore Logistics
                if (parsed.hasElevator !== undefined) setHasElevator(parsed.hasElevator)
                if (parsed.hasStairs !== undefined) setHasStairs(parsed.hasStairs)
                if (parsed.hasLoadingDock !== undefined) setHasLoadingDock(parsed.hasLoadingDock)

                // Restore Pickup Details
                if (parsed.pickupDate) setPickupDate(new Date(parsed.pickupDate))
                if (parsed.pickupTime) setPickupTime(parsed.pickupTime)
                if (parsed.sameDayPickup !== undefined) setSameDayPickup(parsed.sameDayPickup)
                if (parsed.pickupNotes) setPickupNotes(parsed.pickupNotes)

            } catch (e) {
                console.error("Failed to load saved checkout data", e)
            }
        }
    }, [])

    // Save data to localStorage on change
    useEffect(() => {
        // Only save if we have some data entered to avoid overwriting with empty initial state if loading is slow
        // But here initial state is empty strings, so it's fine.
        // We should probably debounce this or just let it run on every change (it's cheap).

        const dataToSave = {
            formData,
            date: date ? date.toISOString() : null,
            startTime,
            endTime,
            venueType,
            hasElevator,
            hasStairs,
            hasLoadingDock,
            pickupDate: pickupDate ? pickupDate.toISOString() : null,
            pickupTime,
            sameDayPickup,
            pickupNotes
        }

        localStorage.setItem('checkout_form_data', JSON.stringify(dataToSave))
    }, [formData, date, startTime, endTime, venueType, hasElevator, hasStairs, hasLoadingDock, pickupDate, pickupTime, sameDayPickup, pickupNotes])

    const handleNextStep = () => {
        if (currentStep === 2) {
            // Validate Step 2
            if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !date || !startTime || !endTime || !formData.venueAddress) {
                setError("Please fill in all required fields.")
                return
            }

            if (!sameDayPickup && !pickupDate) {
                setError("Please select a pickup date.")
                return
            }

            // Update Context with Event Details
            setEventDetails({
                date,
                startTime,
                endTime,
                venueAddress: formData.venueAddress,
                venueType,
                eventType: formData.eventType,
                logistics: {
                    hasElevator,
                    hasStairs,
                    hasLoadingDock,
                    notes: formData.deliveryNotes || ''
                }
            })

            // Also ensure delivery address is set (default to venue address if empty)
            if (!formData.deliveryAddress) {
                setFormData(prev => ({ ...prev, deliveryAddress: formData.venueAddress }))
            }

            setError(null)
        }

        if (currentStep === 2) {
            // Prepare for payment by creating a payment intent
            const preparePayment = async () => {
                setIsLoading(true)
                try {
                    const cartItems: CartItem[] = items.map((item) => ({
                        productId: item.productId,
                        packageId: item.packageId,
                        packageData: item.packageData,
                        packageSelections: item.packageSelections,
                        quantity: item.quantity,
                        modifiers: item.modifiers
                    }))

                    const addressToUse = formData.deliveryAddress || formData.venueAddress

                    // Default paidAmount is total totalAmount
                    let initialPaidAmount = totals?.totalAmount || 0
                    if (paymentChoice === 'deposit') {
                        const minDeposit = Math.ceil(initialPaidAmount * 0.5)
                        const enteredAmount = customAmount ? parseInt(customAmount.replace(/[^0-9]/g, '')) * 100 : 0
                        initialPaidAmount = Math.max(minDeposit, enteredAmount)
                    }
                    setPaidAmount(initialPaidAmount)

                    const result = await createPaymentIntent(cartItems, addressToUse, initialPaidAmount)

                    if (result.clientSecret) {
                        setClientSecret(result.clientSecret)
                    } else if (result.error) {
                        setError(result.error)
                    }
                } catch (err) {
                    console.error('Error preparing payment:', err)
                    setError('Failed to initialize payment. Please try again.')
                } finally {
                    setIsLoading(false)
                }
            }
            preparePayment()
        }


        setCurrentStep(prev => prev + 1)
        window.scrollTo(0, 0)
    }


    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1)
        window.scrollTo(0, 0)
    }

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const cartItems: CartItem[] = items.map((item) => ({
                productId: item.productId,
                packageId: item.packageId,
                packageData: item.packageData,
                packageSelections: item.packageSelections,
                quantity: item.quantity,
                modifiers: item.modifiers
            }))

            const finalFormData = {
                ...formData,
                deliveryDate: date ? format(date, 'yyyy-MM-dd') : formData.deliveryDate,
                eventDate: date ? format(date, 'yyyy-MM-dd') : formData.eventDate,
                deliveryTime: formData.deliveryTime || startTime,
                pickupDate: sameDayPickup ? (date ? format(date, 'yyyy-MM-dd') : formData.eventDate) : (pickupDate ? format(pickupDate, 'yyyy-MM-dd') : ''),
                pickupTime,
                pickupNotes,
                sameDayPickup,
            }

            let signatureUrl = ''
            if (signatureData) {
                const fileName = `${paymentIntentId || 'checkout'}-signature.png`
                const upload = await uploadSignatureImage(signatureData, fileName)
                if (upload.url) {
                    signatureUrl = upload.url
                } else if (upload.error) {
                    console.error('Error uploading signature:', upload.error)
                }
            }

            const result = await createOrder(finalFormData, cartItems, paymentIntentId, signatureUrl, paidAmount)

            if (result.success) {
                setIsSuccess(true)
                clearCart()
                localStorage.removeItem('checkout_form_data')
                // Don't set loading to false here, let the redirect happen
                router.push(`/order-confirmation?orderId=${result.orderId}`)
                return // Exit function to keep loading state true
            } else {
                setError(result.error || 'Failed to create order')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            // Only set loading to false if we didn't succeed (and thus didn't return early)
            if (!isSuccess) {
                setIsLoading(false)
            }
        }

    }

    const handleSubmit = async () => {
        if (!agreesToRentalAgreement) {
            setError("Please agree to the rental agreement terms before placing your order.")
            return
        }

        if (!signatureData) {
            setError("Please sign the rental agreement before placing your order.")
            return
        }

        // Mock payment for development if no clientSecret
        if (!clientSecret) {
            await handlePaymentSuccess('mock_pi_' + Math.random().toString(36).substring(7))
        }
    }


    if (items.length === 0 && isLoaded) return null

    const fieldClass =
        "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-11 sm:h-12 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-base"
    const labelClass = "text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400"
    const sectionTitleClass = "text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-tight"
    const cardClass = "bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border/5"
    const stickyBarClass =
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/10 bg-[#FDFBF7]/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:mt-8"

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <Card className="w-full border-gold/20 shadow-2xl shadow-gold/5">
                        <CardContent className="pt-8 pb-8 text-center space-y-5">
                            <motion.div
                                className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto border border-gold/20"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Check className="h-7 w-7" />
                            </motion.div>
                            <div className="space-y-2">
                                <motion.h2
                                    className="text-2xl sm:text-3xl font-serif text-foreground"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Order Placed Successfully!
                                </motion.h2>
                                <motion.p
                                    className="text-muted-foreground text-sm sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Thank you for your order. You'll receive a confirmation email shortly.
                                </motion.p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-20 pb-28 sm:pt-24 sm:pb-16 md:pt-28 relative">
            <div className="container max-w-6xl mx-auto px-4 relative z-10">
                {/* Compact sticky progress */}
                <motion.div
                    className="sticky top-16 z-30 -mx-4 px-4 py-3 mb-6 sm:mb-10 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-border/5 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:mx-0 sm:px-0 sm:py-0"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <div className="relative max-w-md mx-auto">
                        <div className="absolute left-4 right-4 top-[11px] h-px bg-gold/15">
                            <motion.div
                                className="h-full bg-gold"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%"
                                }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                        <div className="flex items-center justify-between relative">
                            {[
                                { num: 1, label: "Add-ons" },
                                { num: 2, label: "Details" },
                                { num: 3, label: "Pay" }
                            ].map((step) => (
                                <div key={step.num} className="flex flex-col items-center gap-1.5 relative z-10 min-w-[4.5rem]">
                                    <div
                                        className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 border",
                                            step.num < currentStep
                                                ? "bg-gold border-gold text-black"
                                                : step.num === currentStep
                                                    ? "bg-white border-gold text-gold ring-4 ring-gold/10"
                                                    : "bg-white border-border/20 text-gray-300"
                                        )}
                                    >
                                        {step.num < currentStep ? (
                                            <Check className="h-3 w-3 stroke-[3]" />
                                        ) : (
                                            <span>{step.num}</span>
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                                        step.num === currentStep ? "text-gray-900" : "text-gray-400"
                                    )}>
                                        {step.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="mb-6 sm:mb-10"
                    key={currentStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight text-gray-900 leading-snug">
                        {currentStep === 1 && <>Complete Your <span className="italic text-gold">Look</span></>}
                        {currentStep === 2 && <>Event & <span className="italic text-gold">Delivery</span></>}
                        {currentStep === 3 && <>Review & <span className="italic text-gold">Pay</span></>}
                    </h1>
                    <p className="mt-1.5 text-sm text-gray-500 font-light">
                        {currentStep === 1 && "Optional extras — skip anytime."}
                        {currentStep === 2 && "Tell us where and when."}
                        {currentStep === 3 && "Confirm items, sign, and pay."}
                    </p>
                </motion.div>

                {/* Step 1: Supplemental Items */}
                {currentStep === 1 && (
                    <motion.div
                        className="space-y-4 sm:space-y-8"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                            {isLoadingSupplemental ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse space-y-2">
                                        <div className="aspect-[4/5] bg-white rounded-2xl" />
                                        <div className="h-3 bg-white rounded w-3/4" />
                                    </div>
                                ))
                            ) : supplementalProducts.length === 0 ? (
                                <div className="col-span-2 lg:col-span-4 text-center py-10 text-sm text-gray-500">
                                    No add-ons available right now — continue to details.
                                </div>
                            ) : (
                                supplementalProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-2xl overflow-hidden border border-border/5 shadow-[0_6px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
                                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                                                <img
                                                    src={product.image_url || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2.5">
                                                <div>
                                                    <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>
                                                    <p className="text-gold font-bold text-xs sm:text-sm mt-1">{formatCurrency(resolvePriceCents(product))}</p>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-full px-2.5 py-1 border border-border/5">
                                                        <button
                                                            type="button"
                                                            aria-label="Decrease quantity"
                                                            className="text-gray-400 hover:text-gold transition-colors p-0.5"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) - 1)}
                                                            disabled={(supplementalQuantities[product.id] || 1) <= 1}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">
                                                            {supplementalQuantities[product.id] || 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            aria-label="Increase quantity"
                                                            className="text-gray-400 hover:text-gold transition-colors p-0.5"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-3 bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => handleAddSupplementalItem(product)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className={stickyBarClass}>
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4 max-w-6xl mx-auto">
                                <Button
                                    variant="ghost"
                                    onClick={handleNextStep}
                                    className="h-11 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 hover:text-gold"
                                >
                                    Skip add-ons
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    className="bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full px-8 h-12 text-[11px] font-bold uppercase tracking-[0.16em] w-full sm:w-auto"
                                >
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Event & Delivery Details */}
                {currentStep === 2 && (
                    <motion.div
                        className="space-y-8 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {error && (
                            <motion.div
                                className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-red-800"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-10 sm:space-y-12">
                            {/* Customer Info */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <h2 className={sectionTitleClass}>Contact</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="customerName" className={labelClass}>Full Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                            className={fieldClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="customerEmail" className={labelClass}>Email *</Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            required
                                            className={fieldClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="customerPhone" className={labelClass}>Phone *</Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            required
                                            className={fieldClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Event Details */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <h2 className={sectionTitleClass}>Event</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                                </div>
                                <div className="grid gap-5 sm:gap-6">
                                    <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="grid gap-1.5">
                                            <Label className={labelClass}>Event Date *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(fieldClass, "justify-start text-left hover:bg-transparent hover:border-gold", !date && "text-gray-300")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-gold shrink-0" />
                                                        {date ? format(date, "MMM d, yyyy") : <span>Select date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-border/10 shadow-2xl bg-[#FDFBF7]">
                                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3" />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label className={labelClass}>Start *</Label>
                                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={fieldClass} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label className={labelClass}>End *</Label>
                                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={fieldClass} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label className={labelClass}>Venue Address *</Label>
                                        <Input
                                            placeholder="123 Fifth Avenue, New York, NY"
                                            value={formData.venueAddress}
                                            onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value, deliveryAddress: e.target.value })}
                                            required
                                            className={fieldClass}
                                        />
                                        <p className="text-[10px] font-medium tracking-wide text-gray-400">Used as delivery address</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="grid gap-1.5">
                                            <Label className={labelClass}>Venue Type</Label>
                                            <Select value={venueType} onValueChange={setVenueType}>
                                                <SelectTrigger className={cn(fieldClass, "focus:ring-0 focus:border-gold")}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#FDFBF7] border-border/10">
                                                    <SelectItem value="hotel">Hotel</SelectItem>
                                                    <SelectItem value="private_residence">Private Residence</SelectItem>
                                                    <SelectItem value="corporate_office">Corporate Office</SelectItem>
                                                    <SelectItem value="event_space">Event Space</SelectItem>
                                                    <SelectItem value="outdoor">Outdoor / Tent</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className={labelClass}>Event Type</Label>
                                            <Input
                                                placeholder="Wedding, gala, corporate…"
                                                value={formData.eventType}
                                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Logistics */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <h2 className={sectionTitleClass}>Access</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-border/5">
                                        {[
                                            { id: "elevator", label: "Elevator", checked: hasElevator, onChange: setHasElevator },
                                            { id: "stairs", label: "Stairs", checked: hasStairs, onChange: setHasStairs },
                                            { id: "loading_dock", label: "Loading dock", checked: hasLoadingDock, onChange: setHasLoadingDock }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                                                    item.checked ? "bg-gold/10" : "hover:bg-gray-50"
                                                )}
                                                onClick={() => item.onChange(!item.checked)}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                    item.checked ? "bg-gold border-gold" : "border-gray-200"
                                                )}>
                                                    {item.checked && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[11px] font-bold uppercase tracking-wider",
                                                    item.checked ? "text-gray-900" : "text-gray-400"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className={labelClass}>Logistics notes</Label>
                                        <Textarea
                                            placeholder="Gate codes, parking, room names…"
                                            value={formData.deliveryNotes}
                                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                            className="min-h-[72px] bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-base resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pickup Information */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <h2 className={sectionTitleClass}>Pickup</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                                </div>
                                <div className="space-y-5">
                                    <button
                                        type="button"
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                                            sameDayPickup ? "bg-gold/5 border-gold" : "bg-white border-border/5 hover:border-gold/30"
                                        )}
                                        onClick={() => setSameDayPickup(!sameDayPickup)}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                                            sameDayPickup ? "bg-gold text-black" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-serif font-bold text-gray-900">Same-day pickup</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Return items the day of your event · fee applies</p>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                            sameDayPickup ? "bg-gold border-gold" : "border-gray-200"
                                        )}>
                                            {sameDayPickup && <Check className="h-3 w-3 text-black stroke-[3]" />}
                                        </div>
                                    </button>

                                    <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="space-y-1.5">
                                            <Label className={labelClass}>
                                                Pickup date {!sameDayPickup && "*"}
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            fieldClass,
                                                            "justify-start text-left hover:bg-transparent hover:border-gold w-full",
                                                            !pickupDate && !sameDayPickup && "text-gray-300",
                                                            sameDayPickup && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        disabled={sameDayPickup}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-gold shrink-0" />
                                                        {sameDayPickup
                                                            ? (date ? format(date, "MMM d, yyyy") : "Same as event")
                                                            : (pickupDate ? format(pickupDate, "MMM d, yyyy") : <span>Select date</span>)
                                                        }
                                                    </Button>
                                                </PopoverTrigger>
                                                {!sameDayPickup && (
                                                    <PopoverContent className="w-auto p-0 border-border/10 shadow-2xl bg-[#FDFBF7]">
                                                        <Calendar
                                                            mode="single"
                                                            selected={pickupDate}
                                                            onSelect={setPickupDate}
                                                            initialFocus
                                                            disabled={(d) => d < new Date()}
                                                            className="p-3"
                                                        />
                                                    </PopoverContent>
                                                )}
                                            </Popover>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="pickupTime" className={labelClass}>
                                                Preferred time
                                            </Label>
                                            <Input
                                                id="pickupTime"
                                                type="time"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="pickupNotes" className={labelClass}>
                                            Pickup notes
                                        </Label>
                                        <Textarea
                                            id="pickupNotes"
                                            placeholder="Any special pickup instructions?"
                                            value={pickupNotes}
                                            onChange={(e) => setPickupNotes(e.target.value)}
                                            className="min-h-[72px] bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-base resize-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className={stickyBarClass}>
                            <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5 shrink-0 py-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden xs:inline sm:inline">Back</span>
                                </button>
                                <Button
                                    onClick={handleNextStep}
                                    disabled={isLoading}
                                    className="bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full px-6 sm:px-8 h-12 text-[11px] font-bold uppercase tracking-[0.16em] flex-1 sm:flex-none"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Preparing…
                                        </>
                                    ) : (
                                        <>Continue to pay <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        className="grid lg:grid-cols-5 gap-6 lg:gap-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="lg:col-span-3 space-y-5 sm:space-y-6">
                            {/* Review Order */}
                            <div className={cardClass}>
                                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/5 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                                        <ShoppingBag className="h-4 w-4 text-gold" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Your order</h3>
                                    <span className="ml-auto text-xs text-gray-400 font-medium">{items.length} item{items.length === 1 ? '' : 's'}</span>
                                </div>
                                <div className="divide-y divide-border/5">
                                    {items.map((item, index) => {
                                        if (item.packageId && item.packageData) {
                                            const { name, price } = item.packageData
                                            const packagePrice = resolvePriceCents({ price })
                                            return (
                                                <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-5">
                                                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-border/5 bg-gray-50 overflow-hidden flex-shrink-0 relative">
                                                        {item.packageData.image_url ? (
                                                            <img src={item.packageData.image_url} alt={name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gold/5 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gold/60" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between gap-2 items-start">
                                                            <div className="min-w-0">
                                                                <h4 className="font-serif text-base font-bold text-gray-900 truncate">{name}</h4>
                                                                <p className="text-gold font-bold text-sm mt-0.5">{formatCurrency(packagePrice * item.quantity)}</p>
                                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gold/50 mt-1">Package</p>
                                                            </div>
                                                            <button type="button" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 p-1 shrink-0" aria-label="Remove">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        {item.packageData.selectionsSummary && (
                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                {item.packageData.selectionsSummary.flatMap((group: any) =>
                                                                    group.items.map((selection: any, sIdx: number) => (
                                                                        <span key={`${group.groupName}-${sIdx}`} className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                            {selection.name}{selection.quantity > 1 ? ` ×${selection.quantity}` : ''}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1 border border-border/5">
                                                                <button type="button" className="text-gray-400 hover:text-gold" onClick={() => { updateQuantity(item.id, item.quantity - 1); toast.info('Quantity updated') }} disabled={item.quantity <= 1} aria-label="Decrease">
                                                                    <Minus className="h-3.5 w-3.5" />
                                                                </button>
                                                                <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                                                                <button type="button" className="text-gray-400 hover:text-gold" onClick={() => { updateQuantity(item.id, item.quantity + 1); toast.info('Quantity updated') }} aria-label="Increase">
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        const product = cartProducts.find((p) => p.id === item.productId)
                                        if (!product) return null
                                        return (
                                            <div key={item.id} className="flex gap-3 sm:gap-4 p-4 sm:p-5">
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-border/5 bg-gray-50 overflow-hidden flex-shrink-0">
                                                    <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between gap-2 items-start">
                                                        <div className="min-w-0">
                                                            <h4 className="font-serif text-base font-bold text-gray-900 truncate">{product.name}</h4>
                                                            <p className="text-gold font-bold text-sm mt-0.5">{formatCurrency(resolvePriceCents(product) * item.quantity)}</p>
                                                        </div>
                                                        <button type="button" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 p-1 shrink-0" aria-label="Remove">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1 border border-border/5">
                                                            <button type="button" className="text-gray-400 hover:text-gold" onClick={() => { updateQuantity(item.id, item.quantity - 1); toast.info('Quantity updated') }} disabled={item.quantity <= 1} aria-label="Decrease">
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                                                            <button type="button" className="text-gray-400 hover:text-gold" onClick={() => { updateQuantity(item.id, item.quantity + 1); toast.info('Quantity updated') }} aria-label="Increase">
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Event & Delivery Review */}
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-border/5">
                                <div className="p-10 border-b border-border/5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                                                <CalendarIcon className="h-6 w-6 text-gold" />
                                            </div>
                                            <h3 className="text-2xl font-serif font-bold text-gray-900">Event Information</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-gold/70 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event Date</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <CalendarIcon className="h-4 w-4 text-gold flex-shrink-0" />
                                                <p className="font-medium text-gray-900">
                                                    {date ? format(date, 'PPP') : 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event Time</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                                                <p className="font-medium text-gray-900">
                                                    {startTime || 'TBD'}{endTime ? ` – ${endTime}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-8">
                                        {formData.eventType && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event Type</span>
                                                <p className="mt-2 font-medium text-gray-900">{formData.eventType}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Venue Type</span>
                                            <p className="mt-2 font-medium text-gray-900 capitalize">
                                                {venueType?.replace(/_/g, ' ') || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/5">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Venue / Delivery Address</span>
                                        <div className="flex items-start gap-2 mt-2">
                                            <MapPin className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
                                            <p className="font-medium text-gray-900 leading-relaxed">
                                                {formData.venueAddress || formData.deliveryAddress || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    {(hasElevator || hasStairs || hasLoadingDock) && (
                                        <div className="pt-6 border-t border-border/5">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Access</span>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                {hasElevator && (
                                                    <span className="text-xs font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-border/5">
                                                        Elevator Access
                                                    </span>
                                                )}
                                                {hasStairs && (
                                                    <span className="text-xs font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-border/5">
                                                        Stairs Required
                                                    </span>
                                                )}
                                                {hasLoadingDock && (
                                                    <span className="text-xs font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-border/5">
                                                        Loading Dock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {formData.deliveryNotes && (
                                        <div className="pt-6 border-t border-border/5">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Logistics Notes</span>
                                            <p className="mt-2 text-sm text-gray-500 italic font-light leading-relaxed">
                                                &ldquo;{formData.deliveryNotes}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery & Pickup Review */}
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-border/5">
                                <div className="p-10 border-b border-border/5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                                                <Truck className="h-6 w-6 text-gold" />
                                            </div>
                                            <h3 className="text-2xl font-serif font-bold text-gray-900">Delivery & Pickup</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-gold/70 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10 space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Delivery</h4>
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Delivery Date</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <CalendarIcon className="h-4 w-4 text-gold flex-shrink-0" />
                                                    <p className="font-medium text-gray-900">
                                                        {date ? format(date, 'PPP') : 'Not set'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Delivery Time</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                                                    <p className="font-medium text-gray-900">
                                                        {formData.deliveryTime || startTime || 'TBD'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Delivery Address</span>
                                            <div className="flex items-start gap-2 mt-2">
                                                <MapPin className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
                                                <p className="font-medium text-gray-900 leading-relaxed">
                                                    {formData.deliveryAddress || formData.venueAddress || 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-border/5 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Pickup</h4>
                                            {sameDayPickup && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-gold px-3 py-1 rounded-full">
                                                    Same-Day
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Pickup Date</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <CalendarIcon className="h-4 w-4 text-gold flex-shrink-0" />
                                                    <p className="font-medium text-gray-900">
                                                        {sameDayPickup
                                                            ? (date ? format(date, 'PPP') : 'Same as event date')
                                                            : (pickupDate ? format(pickupDate, 'PPP') : 'Not set')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Preferred Pickup Time</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                                                    <p className="font-medium text-gray-900">
                                                        {pickupTime || 'TBD'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {pickupNotes && (
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Pickup Instructions</span>
                                                <p className="mt-2 text-sm text-gray-500 italic font-light leading-relaxed">
                                                    &ldquo;{pickupNotes}&rdquo;
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Choice */}
                            <div className={cardClass}>
                                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/5">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Payment amount</h3>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentChoice('full')
                                                const amount = totals?.totalAmount || 0
                                                setPaidAmount(amount)
                                                setCurrentStep(2)
                                                setTimeout(() => handleNextStep(), 10)
                                            }}
                                            className={cn(
                                                "p-3.5 sm:p-5 rounded-2xl border-2 text-left transition-all space-y-1",
                                                paymentChoice === 'full' ? "border-gold bg-gold/5" : "border-gray-100 hover:border-gold/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Full</span>
                                                {paymentChoice === 'full' && <Check className="h-3.5 w-3.5 text-gold shrink-0" />}
                                            </div>
                                            <h4 className="text-sm sm:text-base font-serif font-bold text-gray-900">Pay in full</h4>
                                            <p className="text-sm sm:text-base font-bold text-gold">{totals ? formatCurrency(totals.totalAmount) : '…'}</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentChoice('deposit')
                                                const minDeposit = Math.ceil((totals?.totalAmount || 0) * 0.5)
                                                setPaidAmount(minDeposit)
                                                setCustomAmount((minDeposit / 100).toString())
                                                setCurrentStep(2)
                                                setTimeout(() => handleNextStep(), 10)
                                            }}
                                            className={cn(
                                                "p-3.5 sm:p-5 rounded-2xl border-2 text-left transition-all space-y-1",
                                                paymentChoice === 'deposit' ? "border-gold bg-gold/5" : "border-gray-100 hover:border-gold/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Deposit</span>
                                                {paymentChoice === 'deposit' && <Check className="h-3.5 w-3.5 text-gold shrink-0" />}
                                            </div>
                                            <h4 className="text-sm sm:text-base font-serif font-bold text-gray-900">50% now</h4>
                                            <p className="text-sm sm:text-base font-bold text-gold">Min. {totals ? formatCurrency(Math.ceil(totals.totalAmount * 0.5)) : '…'}</p>
                                        </button>
                                    </div>

                                    {paymentChoice === 'deposit' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2 pt-3 border-t border-border/5"
                                        >
                                            <Label htmlFor="custom-amount" className={labelClass}>Custom amount ($)</Label>
                                            <div className="relative">
                                                <span className="absolute left-0 bottom-3 text-lg font-light text-gray-400">$</span>
                                                <Input
                                                    id="custom-amount"
                                                    type="number"
                                                    value={customAmount}
                                                    onChange={(e) => {
                                                        setCustomAmount(e.target.value)
                                                        const val = parseFloat(e.target.value) * 100
                                                        const min = Math.ceil((totals?.totalAmount || 0) * 0.5)
                                                        if (val >= min && val <= (totals?.totalAmount || 0)) {
                                                            setPaidAmount(val)
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setCurrentStep(2)
                                                        setTimeout(() => handleNextStep(), 10)
                                                    }}
                                                    className="bg-transparent border-0 border-b border-gray-200 rounded-none pl-5 h-11 focus-visible:ring-0 focus-visible:border-gold font-light text-xl"
                                                    placeholder={((totals?.totalAmount || 0) / 200).toString()}
                                                />
                                            </div>
                                            {(parseFloat(customAmount) * 100) < Math.ceil((totals?.totalAmount || 0) * 0.5) && (
                                                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Min. {formatCurrency(Math.ceil((totals?.totalAmount || 0) * 0.5))}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Remaining balance follows the{' '}
                                        <Link href="/rental-agreement" target="_blank" className="text-gold font-semibold hover:underline">
                                            rental agreement
                                        </Link>.
                                    </p>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className={cardClass}>
                                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/5">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Payment details</h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {clientSecret ? (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <StripePaymentForm
                                                amount={paidAmount || totals?.totalAmount || 0}
                                                onSuccess={handlePaymentSuccess}
                                                disabled={!agreesToRentalAgreement || !signatureData || (paymentChoice === 'deposit' && paidAmount < Math.ceil((totals?.totalAmount || 0) * 0.5))}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                                            <p className="text-sm text-gray-500">Initializing secure payment…</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Signature */}
                            <div className={cardClass}>
                                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/5">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Sign agreement</h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <SignatureCanvas
                                        onSave={setSignatureData}
                                        onClear={() => setSignatureData(null)}
                                    />
                                    {!signatureData && (
                                        <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-wider">
                                            Signature required
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-24 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-gold/10">
                                <div className="bg-gradient-to-br from-[#1A1A1A] to-black text-white py-5 px-5 sm:px-6">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-center">Order summary</h3>
                                </div>
                                <div className="p-5 sm:p-6 space-y-5">
                                    {totals ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
                                            </div>
                                            {totals.discountAmount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span className="font-medium">{totals.discountName || 'Discount'}</span>
                                                    <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
                                                </div>
                                            )}
                                            {totals.setupFee > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Setup fee</span>
                                                    <span className="font-medium text-gray-900">{formatCurrency(totals.setupFee)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Tax ({(totals.taxRate * 100).toFixed(2)}%)</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(totals.taxAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Delivery</span>
                                                <span className="font-medium text-gray-900">{isCalculating ? '…' : formatCurrency(totals.deliveryFee)}</span>
                                            </div>
                                            <div className="pt-3 border-t border-gold/10 flex justify-between items-baseline">
                                                <span className="text-base font-serif font-bold text-gray-900">Total</span>
                                                <span className="font-bold text-2xl text-gold">{formatCurrency(totals.totalAmount)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                                        </div>
                                    )}

                                    <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10">
                                        <div className="flex items-start gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setAgreesToRentalAgreement(!agreesToRentalAgreement)}
                                                className={cn(
                                                    "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                    agreesToRentalAgreement ? "bg-gold border-gold" : "border-gold/30 hover:border-gold"
                                                )}
                                                aria-pressed={agreesToRentalAgreement}
                                                aria-label="Agree to rental agreement"
                                            >
                                                {agreesToRentalAgreement && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                                            </button>
                                            <label
                                                className="text-xs sm:text-sm font-medium cursor-pointer leading-relaxed text-gray-900"
                                                onClick={() => setAgreesToRentalAgreement(!agreesToRentalAgreement)}
                                            >
                                                I agree to the{' '}
                                                <Link
                                                    href="/rental-agreement"
                                                    target="_blank"
                                                    className="text-gold underline underline-offset-2 font-bold"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    rental agreement
                                                </Link>
                                            </label>
                                        </div>
                                    </div>

                                    {!clientSecret && (
                                        <Button
                                            className="w-full h-12 bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
                                            onClick={handleSubmit}
                                            disabled={isLoading || isCalculating || !totals || !agreesToRentalAgreement || !signatureData}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing…
                                                </>
                                            ) : (
                                                <>Place order <ArrowRight className="ml-2 h-4 w-4" /></>
                                            )}
                                        </Button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 hover:text-gold transition-colors flex items-center justify-center gap-1.5 py-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            <Dialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
                <DialogContent className="sm:max-w-[425px] border-destructive/20">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertCircle className="h-6 w-6" />
                            <DialogTitle className="text-xl">Error</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2">
                            {error}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button onClick={() => setError(null)} variant="outline" className="w-full sm:w-auto">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
