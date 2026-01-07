'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Check, AlertCircle, CalendarIcon, Clock, MapPin, Truck, ArrowRight, ArrowLeft, ShoppingBag, Plus, Minus, Package } from 'lucide-react'
import { createOrder, calculateOrderTotal, type CheckoutFormData, type CartItem } from '@/app/actions/checkout'
import { formatCurrency } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/client'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { StripeProvider, stripePromise } from '@/components/providers/stripe-provider'
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
    const [clientSecret, setClientSecret] = useState<string | null>(null)


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
                // Filter out items already in cart
                const available = data.filter(p => !cartIds.includes(p.id))
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
            const supabase = createClient()
            const productIds = items.map((item) => item.productId)
            const { data } = await supabase.from('products').select('*').in('id', productIds)

            if (data) {
                setCartProducts(data)

                // Check for invalid items and remove them
                const validIds = data.map(p => p.id)
                const invalidItems = items.filter(i => !validIds.includes(i.productId))

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
                const cartItems: CartItem[] = items
                    .filter(item => !!item.productId)
                    .map((item) => ({
                        productId: item.productId as string,
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
                    const cartItems: CartItem[] = items
                        .filter(item => !!item.productId)
                        .map((item) => ({
                            productId: item.productId as string,
                            quantity: item.quantity,
                            modifiers: item.modifiers
                        }))

                    const addressToUse = formData.deliveryAddress || formData.venueAddress
                    const result = await createPaymentIntent(cartItems, addressToUse)

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
            const cartItems: CartItem[] = items
                .filter(item => !!item.productId)
                .map((item) => ({
                    productId: item.productId as string,
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

            const result = await createOrder(finalFormData, cartItems, paymentIntentId)

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
    }


    if (items.length === 0 && isLoaded) return null

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Card className="max-w-md w-full border-gold/20 shadow-2xl shadow-gold/5">
                        <CardContent className="pt-10 pb-10 text-center space-y-6">
                            <motion.div
                                className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto border border-gold/20"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Check className="h-10 w-10" />
                            </motion.div>
                            <div className="space-y-2">
                                <motion.h2
                                    className="text-3xl font-serif text-foreground"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Order Placed Successfully!
                                </motion.h2>
                                <motion.p
                                    className="text-muted-foreground text-lg"
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
        <div className="min-h-screen bg-[#FDFBF7] py-24 md:py-40 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold/50 to-transparent" />

            <div className="container max-w-6xl mx-auto px-4 relative z-10">
                {/* Progress Steps - Redesigned */}
                <motion.div
                    className="mb-24"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="relative max-w-2xl mx-auto">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-[15px] w-full h-[1px] bg-gold/10">
                            <motion.div
                                className="h-full bg-gold"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%"
                                }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="flex items-start justify-between relative">
                            {[
                                { num: 1, label: "Add-ons", desc: "Complete your look" },
                                { num: 2, label: "Details", desc: "Event information" },
                                { num: 3, label: "Payment", desc: "Review & confirm" }
                            ].map((step) => (
                                <div key={step.num} className="flex flex-col items-center gap-4 relative z-10 group cursor-default">
                                    {/* Step Circle */}
                                    <motion.div
                                        className={cn(
                                            "relative h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-500 border",
                                            step.num < currentStep
                                                ? "bg-gold border-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                                                : step.num === currentStep
                                                    ? "bg-white border-gold text-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                    : "bg-white border-border/10 text-gray-300"
                                        )}
                                        initial={false}
                                        animate={{
                                            scale: step.num === currentStep ? 1.2 : 1,
                                        }}
                                    >
                                        {step.num < currentStep ? (
                                            <Check className="h-3 w-3 stroke-[3]" />
                                        ) : (
                                            <span>{step.num}</span>
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <div className="text-center space-y-1">
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500",
                                            step.num === currentStep ? "text-gray-900" : "text-gray-400"
                                        )}>
                                            {step.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="text-center mb-16"
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-gray-900 leading-tight">
                        {currentStep === 1 && <>Complete Your <span className="italic text-gold">Look</span></>}
                        {currentStep === 2 && <>Event & <span className="italic text-gold">Delivery</span> Details</>}
                        {currentStep === 3 && <>Review & <span className="italic text-gold">Payment</span></>}
                    </h1>
                </motion.div>

                {/* Step 1: Supplemental Items */}
                {currentStep === 1 && (
                    <motion.div
                        className="space-y-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {isLoadingSupplemental ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse space-y-4">
                                        <div className="aspect-[4/5] bg-white rounded-[2rem]" />
                                        <div className="h-4 bg-white rounded w-3/4 mx-auto" />
                                    </div>
                                ))
                            ) : (
                                supplementalProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: index * 0.1,
                                            ease: "easeOut"
                                        }}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-border/5 transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 flex flex-col h-full">
                                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                                                <img
                                                    src={product.image_url || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                    <Button
                                                        className="w-full bg-white text-black hover:bg-gold hover:text-black rounded-full text-[10px] font-bold uppercase tracking-widest h-10 shadow-xl"
                                                        onClick={() => handleAddSupplementalItem(product)}
                                                    >
                                                        Add to Order
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="p-8 flex flex-col flex-1 text-center">
                                                <h3 className="font-serif text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                                                <p className="text-gold font-bold text-sm mb-6">{formatCurrency(product.price)}</p>

                                                <div className="mt-auto flex items-center justify-center gap-6 bg-gray-50 rounded-full px-4 py-2 border border-border/5">
                                                    <button
                                                        className="text-gray-400 hover:text-gold transition-colors"
                                                        onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) - 1)}
                                                        disabled={(supplementalQuantities[product.id] || 1) <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-xs font-bold w-4">
                                                        {supplementalQuantities[product.id] || 1}
                                                    </span>
                                                    <button
                                                        className="text-gray-400 hover:text-gold transition-colors"
                                                        onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-center pt-16 border-t border-border/5">
                            <Button
                                onClick={handleNextStep}
                                size="lg"
                                className="bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full px-12 h-16 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 group"
                            >
                                Continue to Details <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Event & Delivery Details */}
                {currentStep === 2 && (
                    <motion.div
                        className="space-y-20 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {error && (
                            <motion.div
                                className="bg-red-50 border border-red-100 rounded-[2rem] p-8 flex items-center gap-4 text-red-800"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertCircle className="h-6 w-6 shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-24">
                            {/* Customer Info */}
                            <section className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Contact Information</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent"></div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-12">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="customerName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Full Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                            className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email Address *</Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            required
                                            className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Phone Number *</Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            required
                                            className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Event Details */}
                            <section className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Event Details</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent"></div>
                                </div>
                                <div className="grid gap-12">
                                    <div className="grid sm:grid-cols-2 gap-12">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event Date *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 justify-start text-left font-light text-lg hover:bg-transparent hover:border-gold transition-colors", !date && "text-gray-300")}
                                                    >
                                                        <CalendarIcon className="mr-3 h-5 w-5 text-gold" />
                                                        {date ? format(date, "PPP") : <span>Select Date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-border/10 shadow-2xl bg-[#FDFBF7]">
                                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-4" />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Start Time *</Label>
                                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors font-light text-lg" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">End Time *</Label>
                                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors font-light text-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Venue Address *</Label>
                                        <Input
                                            placeholder="E.g. 123 Fifth Avenue, New York, NY"
                                            value={formData.venueAddress}
                                            onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value, deliveryAddress: e.target.value })}
                                            required
                                            className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg"
                                        />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">Default delivery address</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-12">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Venue Type</Label>
                                            <Select value={venueType} onValueChange={setVenueType}>
                                                <SelectTrigger className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus:ring-0 focus:border-gold transition-colors font-light text-lg">
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
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event Type</Label>
                                            <Input
                                                placeholder="E.g. Wedding Gala"
                                                value={formData.eventType}
                                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                                className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Logistics */}
                            <section className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Logistics & Access</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent"></div>
                                </div>
                                <div className="space-y-12">
                                    <div className="grid sm:grid-cols-3 gap-8 p-10 bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-border/5">
                                        {[
                                            { id: "elevator", label: "Elevator Access", checked: hasElevator, onChange: setHasElevator },
                                            { id: "stairs", label: "Stairs Required", checked: hasStairs, onChange: setHasStairs },
                                            { id: "loading_dock", label: "Loading Dock", checked: hasLoadingDock, onChange: setHasLoadingDock }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => item.onChange(!item.checked)}>
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                    item.checked ? "bg-gold border-gold" : "border-gray-200 group-hover:border-gold"
                                                )}>
                                                    {item.checked && <Check className="h-3 w-3 text-black stroke-[3]" />}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-widest transition-colors",
                                                    item.checked ? "text-gray-900" : "text-gray-400 group-hover:text-gold"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Additional Logistics Notes</Label>
                                        <Textarea
                                            placeholder="Gate codes, parking instructions, specific room names..."
                                            value={formData.deliveryNotes}
                                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                            className="min-h-[120px] bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pickup Information */}
                            <section className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Pickup Information</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent"></div>
                                </div>
                                <div className="space-y-12">
                                    {/* Same Day Pickup Toggle */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-between p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group",
                                            sameDayPickup ? "bg-gold/5 border-gold shadow-[0_20px_40px_rgba(212,175,55,0.1)]" : "bg-white border-border/5 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:border-gold/30"
                                        )}
                                        onClick={() => setSameDayPickup(!sameDayPickup)}
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className={cn(
                                                "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500",
                                                sameDayPickup ? "bg-gold text-black" : "bg-gray-50 text-gray-400 group-hover:bg-gold/10 group-hover:text-gold"
                                            )}>
                                                <Clock className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-serif font-bold text-gray-900">Same-Day Pickup</h4>
                                                <p className="text-sm text-gray-500 mt-1 font-light">Return items the same day as your event</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Additional fee applies</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                            sameDayPickup ? "bg-gold border-gold" : "border-gray-200 group-hover:border-gold"
                                        )}>
                                            {sameDayPickup && <Check className="h-4 w-4 text-black stroke-[3]" />}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-12">
                                        {/* Pickup Date */}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                Pickup Date {!sameDayPickup && "*"}
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 justify-start text-left font-light text-lg hover:bg-transparent hover:border-gold transition-colors w-full",
                                                            !pickupDate && !sameDayPickup && "text-gray-300",
                                                            sameDayPickup && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        disabled={sameDayPickup}
                                                    >
                                                        <CalendarIcon className="mr-3 h-5 w-5 text-gold" />
                                                        {sameDayPickup
                                                            ? (date ? format(date, "PPP") : "Same as event date")
                                                            : (pickupDate ? format(pickupDate, "PPP") : <span>Select Date</span>)
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
                                                            disabled={(date) => date < new Date()}
                                                            className="p-4"
                                                        />
                                                    </PopoverContent>
                                                )}
                                            </Popover>
                                        </div>

                                        {/* Pickup Time */}
                                        <div className="space-y-2">
                                            <Label htmlFor="pickupTime" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                Preferred Pickup Time
                                            </Label>
                                            <Input
                                                id="pickupTime"
                                                type="time"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-14 focus-visible:ring-0 focus-visible:border-gold transition-colors font-light text-lg"
                                            />
                                        </div>
                                    </div>

                                    {/* Pickup Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pickupNotes" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            Pickup Instructions
                                        </Label>
                                        <Textarea
                                            id="pickupNotes"
                                            placeholder="Any special instructions for pickup?"
                                            value={pickupNotes}
                                            onChange={(e) => setPickupNotes(e.target.value)}
                                            className="min-h-[120px] bg-transparent border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light text-lg resize-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-16 border-t border-border/5">
                            <button
                                onClick={handlePrevStep}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gold transition-colors flex items-center gap-2 group"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Add-ons
                            </button>
                            <Button
                                onClick={handleNextStep}
                                size="lg"
                                className="bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full px-12 h-16 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 group w-full sm:w-auto"
                            >
                                Continue to Payment <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        className="grid lg:grid-cols-3 gap-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="lg:col-span-2 space-y-12">
                            {/* Review Order */}
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-border/5">
                                <div className="p-10 border-b border-border/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 text-gold" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-gray-900">Review Your Order</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-border/5">
                                    {items.map((item, index) => {
                                        const product = cartProducts.find((p) => p.id === item.productId)
                                        if (!product) return null
                                        return (
                                            <motion.div
                                                key={item.productId}
                                                className="flex gap-8 p-10 hover:bg-gray-50/50 transition-all duration-300 group"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <div className="h-32 w-32 rounded-[2rem] border border-border/5 bg-gray-50 overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img
                                                        src={product.image_url || '/placeholder.svg'}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-serif text-xl font-bold text-gray-900 mb-2">{product.name}</h4>
                                                        <p className="text-gold font-bold text-lg">{formatCurrency(product.price * item.quantity)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-6 mt-6">
                                                        <div className="flex items-center gap-6 bg-gray-50 rounded-full px-6 py-2 border border-border/5">
                                                            <button
                                                                className="text-gray-400 hover:text-gold transition-colors"
                                                                onClick={() => {
                                                                    updateQuantity(item.id, item.quantity - 1)
                                                                    toast.info('Quantity updated')
                                                                }}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="text-sm font-bold w-6 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                className="text-gray-400 hover:text-gold transition-colors"
                                                                onClick={() => {
                                                                    updateQuantity(item.id, item.quantity + 1)
                                                                    toast.info('Quantity updated')
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-border/5">
                                <div className="p-10 border-b border-border/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                                            <Truck className="h-6 w-6 text-gold" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-gray-900">Payment Method</h3>
                                    </div>
                                </div>
                                <div className="p-10">
                                    {clientSecret ? (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <StripePaymentForm
                                                amount={totals?.totalAmount || 0}
                                                onSuccess={handlePaymentSuccess}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                            <Loader2 className="h-10 w-10 animate-spin text-gold" />
                                            <p className="text-sm font-light text-gray-500">Initializing secure payment...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-white rounded-[3rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-gold/10">
                                <div className="bg-gradient-to-br from-[#1A1A1A] to-black text-white py-10 px-8">
                                    <h3 className="text-2xl font-serif font-bold text-center">Order Summary</h3>
                                </div>
                                <div className="p-10 space-y-8">
                                    {totals ? (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-light text-gray-500">Subtotal</span>
                                                    <span className="text-base font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
                                                </div>
                                                {totals.setupFee > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-light text-gray-500">Setup Fee</span>
                                                        <span className="text-base font-medium text-gray-900">{formatCurrency(totals.setupFee)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-light text-gray-500">Tax ({(totals.taxRate * 100).toFixed(2)}%)</span>
                                                    <span className="text-base font-medium text-gray-900">{formatCurrency(totals.taxAmount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-light text-gray-500">Delivery Fee</span>
                                                    <span className="text-base font-medium text-gray-900">{isCalculating ? '...' : formatCurrency(totals.deliveryFee)}</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gold/10">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-lg font-serif font-bold text-gray-900">Total</span>
                                                    <span className="font-bold text-3xl text-gold">{formatCurrency(totals.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-10 w-10 animate-spin text-gold" />
                                        </div>
                                    )}

                                    {/* Rental Agreement */}
                                    <div className="p-8 bg-gold/5 rounded-[2rem] border border-gold/10 space-y-4">
                                        <div className="flex items-start gap-5">
                                            <div className="pt-0.5">
                                                <div
                                                    onClick={() => setAgreesToRentalAgreement(!agreesToRentalAgreement)}
                                                    className={cn(
                                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer",
                                                        agreesToRentalAgreement ? "bg-gold border-gold" : "border-gold/30 hover:border-gold"
                                                    )}
                                                >
                                                    {agreesToRentalAgreement && <Check className="h-3 w-3 text-black stroke-[3]" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <label
                                                    htmlFor="rental-agreement"
                                                    className="text-sm font-medium cursor-pointer leading-relaxed block select-none text-gray-900"
                                                    onClick={() => setAgreesToRentalAgreement(!agreesToRentalAgreement)}
                                                >
                                                    I agree to the{' '}
                                                    <Link
                                                        href="/rental-agreement"
                                                        target="_blank"
                                                        className="text-gold hover:text-gold/80 underline underline-offset-4 font-bold transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        PrimeLux Events Rental Agreement
                                                    </Link>
                                                    {' '}terms and conditions
                                                </label>
                                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                                    By checking this box, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions in our rental agreement.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!clientSecret && (
                                        <Button
                                            className="w-full h-16 bg-[#1A1A1A] text-white hover:bg-gold hover:text-black rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 group"
                                            onClick={handleSubmit}
                                            disabled={isLoading || isCalculating || !totals || !agreesToRentalAgreement}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing Order...
                                                </>
                                            ) : (
                                                <>Place Order <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                                            )}
                                        </Button>
                                    )}

                                    <button
                                        onClick={handlePrevStep}
                                        className="w-full text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gold transition-colors flex items-center justify-center gap-2 group py-4"
                                    >
                                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Details
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
        </div >
    )
}
