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

    // Form Data
    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: eventDetails?.venueAddress || '',
        deliveryDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        deliveryTime: eventDetails?.startTime || '',
        deliveryNotes: eventDetails?.logistics?.notes || '',
        eventDate: eventDetails?.date ? new Date(eventDetails.date).toISOString().split('T')[0] : '',
        eventType: eventDetails?.eventType || '',
        venueAddress: eventDetails?.venueAddress || '',
        pickupDate: '',
        pickupTime: '',
        pickupNotes: '',
        sameDayPickup: false,
    })

    // Additional Event Details State (not directly in CheckoutFormData but needed for UI/Logic)
    const [date, setDate] = useState<Date | undefined>(eventDetails?.date)
    const [startTime, setStartTime] = useState(eventDetails?.startTime || "")
    const [endTime, setEndTime] = useState(eventDetails?.endTime || "")
    const [venueType, setVenueType] = useState(eventDetails?.venueType || "")
    const [hasElevator, setHasElevator] = useState(eventDetails?.logistics?.hasElevator || false)
    const [hasStairs, setHasStairs] = useState(eventDetails?.logistics?.hasStairs || false)
    const [hasLoadingDock, setHasLoadingDock] = useState(eventDetails?.logistics?.hasLoadingDock || false)

    // Pickup Details State
    const [pickupDate, setPickupDate] = useState<Date | undefined>()
    const [pickupTime, setPickupTime] = useState("")
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
                // Shuffle and take 3
                const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 3)
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
                        removeItem(item.productId)
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
                    quantity: item.quantity,
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
        setCurrentStep(prev => prev + 1)
        window.scrollTo(0, 0)
    }

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1)
        window.scrollTo(0, 0)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const cartItems: CartItem[] = items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }))

            // Final sync of form data before submission
            const finalFormData = {
                ...formData,
                deliveryDate: date ? format(date, 'yyyy-MM-dd') : formData.deliveryDate,
                eventDate: date ? format(date, 'yyyy-MM-dd') : formData.eventDate,
                // Ensure delivery time is set, default to start time if empty
                deliveryTime: formData.deliveryTime || startTime,
                // Include pickup data
                pickupDate: sameDayPickup ? (date ? format(date, 'yyyy-MM-dd') : formData.eventDate) : (pickupDate ? format(pickupDate, 'yyyy-MM-dd') : ''),
                pickupTime,
                pickupNotes,
                sameDayPickup,
            }

            const result = await createOrder(finalFormData, cartItems)

            if (result.success) {
                setIsSuccess(true)
                clearCart()
                localStorage.removeItem('checkout_form_data')
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

    if (items.length === 0 && isLoaded) return null

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Card className="max-w-md w-full">
                        <CardContent className="pt-6 text-center space-y-4">
                            <motion.div
                                className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Check className="h-8 w-8" />
                            </motion.div>
                            <motion.h2
                                className="text-2xl font-serif"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Order Placed Successfully!
                            </motion.h2>
                            <motion.p
                                className="text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Thank you for your order. You'll receive a confirmation email shortly.
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-[28px] w-full h-0.5 bg-border rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-primary/60"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%"
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="flex items-start justify-between relative">
                            {[
                                { num: 1, label: "Add-ons", desc: "Complete your look" },
                                { num: 2, label: "Details", desc: "Event information" },
                                { num: 3, label: "Payment", desc: "Review & confirm" }
                            ].map((step) => (
                                <motion.div
                                    key={step.num}
                                    className={cn(
                                        "flex flex-col items-center gap-2 relative z-10",
                                        step.num <= currentStep ? "text-primary" : "text-muted-foreground"
                                    )}
                                    initial={false}
                                    animate={{
                                        scale: step.num === currentStep ? 1.05 : 1,
                                    }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                                >
                                    {/* Step Circle */}
                                    <motion.div
                                        className={cn(
                                            "relative h-12 w-12 rounded-full flex items-center justify-center font-semibold text-base shadow-sm",
                                            step.num < currentStep
                                                ? "bg-primary text-primary-foreground"
                                                : step.num === currentStep
                                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                    : "bg-muted text-muted-foreground"
                                        )}
                                        initial={false}
                                        whileHover={{ scale: 1.08 }}
                                    >
                                        {step.num < currentStep ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                <Check className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <span>{step.num}</span>
                                        )}

                                        {/* Subtle pulse animation for current step */}
                                        {step.num === currentStep && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-primary"
                                                initial={{ scale: 1, opacity: 0.3 }}
                                                animate={{ scale: 1.4, opacity: 0 }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeOut"
                                                }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <div className="text-center">
                                        <p className={cn(
                                            "font-semibold text-sm whitespace-nowrap",
                                            step.num === currentStep && "text-primary"
                                        )}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground hidden sm:block">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-3xl font-serif mb-8 text-center"
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 1 && "Complete Your Look"}
                    {currentStep === 2 && "Event & Delivery Details"}
                    {currentStep === 3 && "Review & Payment"}
                </motion.h1>

                {/* Step 1: Supplemental Items */}
                {currentStep === 1 && (
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {isLoadingSupplemental ? (
                                Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="h-48 bg-muted rounded-t-lg" />
                                        <CardContent className="p-4 space-y-2">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                supplementalProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.1,
                                            ease: "easeOut"
                                        }}
                                    >
                                        <Card className="overflow-hidden flex flex-col h-full">
                                            <div className="aspect-square relative bg-muted">
                                                <img
                                                    src={product.image_url || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-lg font-serif line-clamp-1">{product.name}</CardTitle>
                                                <CardDescription>{formatCurrency(product.price)}</CardDescription>
                                            </CardHeader>
                                            <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-3">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-sm text-muted-foreground">Quantity:</span>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center font-medium">
                                                            {supplementalQuantities[product.id] || 1}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => handleAddSupplementalItem(product)}
                                                >
                                                    <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleNextStep} size="lg">
                                Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Event & Delivery Details */}
                {currentStep === 2 && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error && (
                            <motion.div
                                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <div className="grid gap-6">
                            {/* Customer Info */}
                            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="customerName">Full Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">Email *</Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">Phone *</Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Event Details */}
                            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Event Date *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-2">
                                                <Label>Start Time *</Label>
                                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>End Time *</Label>
                                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Venue Address *</Label>
                                        <Input
                                            placeholder="123 Event St, City, State"
                                            value={formData.venueAddress}
                                            onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value, deliveryAddress: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">We'll use this as the delivery address unless specified otherwise.</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Venue Type</Label>
                                            <Select value={venueType} onValueChange={setVenueType}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
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
                                            <Label>Event Type</Label>
                                            <Input
                                                placeholder="Wedding, Gala, etc."
                                                value={formData.eventType}
                                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logistics */}
                            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <CardTitle>Logistics & Access</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="elevator" checked={hasElevator} onCheckedChange={(c) => setHasElevator(c as boolean)} />
                                            <Label htmlFor="elevator">Elevator Access</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="stairs" checked={hasStairs} onCheckedChange={(c) => setHasStairs(c as boolean)} />
                                            <Label htmlFor="stairs">Stairs Required</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="loading_dock" checked={hasLoadingDock} onCheckedChange={(c) => setHasLoadingDock(c as boolean)} />
                                            <Label htmlFor="loading_dock">Loading Dock</Label>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Additional Notes / Instructions</Label>
                                        <Textarea
                                            placeholder="Gate codes, parking instructions, specific room names..."
                                            value={formData.deliveryNotes}
                                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pickup Information */}
                            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Pickup Information</CardTitle>
                                            <CardDescription>When should we collect the items?</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    {/* Same Day Pickup Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <div>
                                                <Label htmlFor="sameDayPickup" className="text-base font-medium cursor-pointer">
                                                    Same-Day Pickup
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Pick up items the same day as your event</p>
                                                <p className="text-xs text-amber-600 mt-1">Additional fee applies (calculated at checkout)</p>
                                            </div>
                                        </div>
                                        <Checkbox
                                            id="sameDayPickup"
                                            checked={sameDayPickup}
                                            onCheckedChange={(c) => setSameDayPickup(c as boolean)}
                                            className="h-5 w-5"
                                        />
                                    </div>

                                    {/* Pickup Date */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-primary" />
                                            Pickup Date {!sameDayPickup && "*"}
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !pickupDate && !sameDayPickup && "text-muted-foreground"
                                                    )}
                                                    disabled={sameDayPickup}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {sameDayPickup
                                                        ? (date ? format(date, "PPP") + " (Same as event)" : "Same as event date")
                                                        : (pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>)
                                                    }
                                                </Button>
                                            </PopoverTrigger>
                                            {!sameDayPickup && (
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={pickupDate}
                                                        onSelect={setPickupDate}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            )}
                                        </Popover>
                                        {sameDayPickup && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Check className="h-3 w-3 text-primary" />
                                                Items will be picked up on the event date
                                            </p>
                                        )}
                                    </div>

                                    {/* Pickup Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pickupTime" className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Preferred Pickup Time
                                        </Label>
                                        <Input
                                            id="pickupTime"
                                            type="time"
                                            value={pickupTime}
                                            onChange={(e) => setPickupTime(e.target.value)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">We'll do our best to accommodate your preferred time</p>
                                    </div>

                                    {/* Pickup Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pickupNotes" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            Pickup Instructions
                                        </Label>
                                        <Textarea
                                            id="pickupNotes"
                                            placeholder="Any special instructions for pickup? (e.g., loading dock access, contact person, etc.)"
                                            value={pickupNotes}
                                            onChange={(e) => setPickupNotes(e.target.value)}
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={handlePrevStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={handleNextStep} size="lg">
                                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        className="grid lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-primary/20">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShoppingBag className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Review Order</CardTitle>
                                            <CardDescription>Adjust quantities if needed</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">{" "}
                                    <div className="space-y-3">
                                        {items.map((item, index) => {
                                            const product = cartProducts.find((p) => p.id === item.productId)
                                            if (!product) return null
                                            return (
                                                <motion.div
                                                    key={item.productId}
                                                    className="flex gap-4 py-2 border-b last:border-0"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                >
                                                    <div className="h-16 w-16 rounded border bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.image_url || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium font-serif">{product.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => {
                                                                    updateQuantity(item.productId, item.quantity - 1)
                                                                    toast.info('Quantity updated')
                                                                }}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="text-sm font-medium w-8 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => {
                                                                    updateQuantity(item.productId, item.quantity + 1)
                                                                    toast.info('Quantity updated')
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium">{formatCurrency(product.price * item.quantity)}</p>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="border-primary/20">
                                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Payment Method</CardTitle>
                                            <CardDescription>Secure payment processing powered by Stripe</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
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

                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {totals ? (
                                        <div className="space-y-2">
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
                                    ) : (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-destructive">{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full h-12 text-base"
                                        onClick={handleSubmit}
                                        disabled={isLoading || isCalculating || !totals}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>

                                    <Button variant="ghost" className="w-full" onClick={handlePrevStep}>
                                        Back to Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
