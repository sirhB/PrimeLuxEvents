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
                modifiers: item.modifiers
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
        <div className="min-h-screen bg-background py-16 md:py-24">
            <div className="container max-w-5xl mx-auto px-4">
                {/* Progress Steps - Redesigned */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="relative max-w-3xl mx-auto">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-[15px] w-full h-[1px] bg-border/60">
                            <motion.div
                                className="h-full bg-gold"
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
                                <div key={step.num} className="flex flex-col items-center gap-3 relative z-10 group cursor-default">
                                    {/* Step Circle */}
                                    <motion.div
                                        className={cn(
                                            "relative h-8 w-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors duration-300 border",
                                            step.num < currentStep
                                                ? "bg-gold border-gold text-black"
                                                : step.num === currentStep
                                                    ? "bg-background border-gold text-gold ring-4 ring-gold/10"
                                                    : "bg-background border-border text-muted-foreground"
                                        )}
                                        initial={false}
                                        animate={{
                                            scale: step.num === currentStep ? 1.1 : 1,
                                        }}
                                    >
                                        {step.num < currentStep ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span>{step.num}</span>
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <div className="text-center space-y-0.5">
                                        <p className={cn(
                                            "font-serif text-base transition-colors duration-300",
                                            step.num === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 hidden sm:block font-light tracking-wide uppercase">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-4xl md:text-5xl font-serif mb-12 text-center text-foreground"
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
                        className="space-y-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {isLoadingSupplemental ? (
                                Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="animate-pulse border-border/40">
                                        <div className="h-64 bg-muted rounded-t-lg" />
                                        <CardContent className="p-6 space-y-3">
                                            <div className="h-5 bg-muted rounded w-3/4" />
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
                                        <Card className="overflow-hidden flex flex-col h-full border-border/40 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 group">
                                            <div className="aspect-[4/5] relative bg-secondary/20 overflow-hidden">
                                                <img
                                                    src={product.image_url || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                            <CardHeader className="p-6 pb-2">
                                                <CardTitle className="text-xl font-serif line-clamp-1">{product.name}</CardTitle>
                                                <CardDescription className="text-gold font-medium text-base">{formatCurrency(product.price)}</CardDescription>
                                            </CardHeader>
                                            <CardFooter className="p-6 pt-2 mt-auto flex flex-col gap-4">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-sm text-muted-foreground uppercase tracking-wider font-light">Quantity</span>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-border/50 hover:border-gold/50 hover:text-gold"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-6 text-center font-medium">
                                                            {supplementalQuantities[product.id] || 1}
                                                        </span>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 rounded-full border-border/50 hover:border-gold/50 hover:text-gold"
                                                            onClick={() => updateSupplementalQuantity(product.id, (supplementalQuantities[product.id] || 1) + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-gold/30 hover:bg-gold hover:text-black hover:border-gold transition-all duration-300"
                                                    onClick={() => handleAddSupplementalItem(product)}
                                                >
                                                    <ShoppingBag className="mr-2 h-4 w-4" /> Add to Quote
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-end pt-8 border-t border-border/40">
                            <Button onClick={handleNextStep} size="lg" className="bg-black text-white hover:bg-black/80 rounded-full px-8 h-12 text-base">
                                Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Event & Delivery Details */}
                {currentStep === 2 && (
                    <motion.div
                        className="space-y-10 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error && (
                            <motion.div
                                className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <div className="grid gap-10">
                            {/* Customer Info */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px flex-1 bg-border/60"></div>
                                    <h2 className="text-2xl font-serif text-foreground">Contact Information</h2>
                                    <div className="h-px flex-1 bg-border/60"></div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="customerName">Full Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                            className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
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
                                            className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
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
                                            className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Event Details */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px flex-1 bg-border/60"></div>
                                    <h2 className="text-2xl font-serif text-foreground">Event Details</h2>
                                    <div className="h-px flex-1 bg-border/60"></div>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label>Event Date *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full justify-start text-left font-normal h-12 border-border/50 hover:border-gold/50 hover:bg-background", !date && "text-muted-foreground")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-gold/20 shadow-xl">
                                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Start Time *</Label>
                                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>End Time *</Label>
                                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20" />
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
                                            className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
                                        />
                                        <p className="text-xs text-muted-foreground">We'll use this as the delivery address unless specified otherwise.</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label>Venue Type</Label>
                                            <Select value={venueType} onValueChange={setVenueType}>
                                                <SelectTrigger className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20">
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
                                                className="h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Logistics */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px flex-1 bg-border/60"></div>
                                    <h2 className="text-2xl font-serif text-foreground">Logistics & Access</h2>
                                    <div className="h-px flex-1 bg-border/60"></div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-wrap gap-8 p-6 bg-secondary/10 rounded-lg border border-border/40">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="elevator" checked={hasElevator} onCheckedChange={(c) => setHasElevator(c as boolean)} className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black" />
                                            <Label htmlFor="elevator" className="cursor-pointer">Elevator Access</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="stairs" checked={hasStairs} onCheckedChange={(c) => setHasStairs(c as boolean)} className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black" />
                                            <Label htmlFor="stairs" className="cursor-pointer">Stairs Required</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="loading_dock" checked={hasLoadingDock} onCheckedChange={(c) => setHasLoadingDock(c as boolean)} className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black" />
                                            <Label htmlFor="loading_dock" className="cursor-pointer">Loading Dock</Label>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Additional Notes / Instructions</Label>
                                        <Textarea
                                            placeholder="Gate codes, parking instructions, specific room names..."
                                            value={formData.deliveryNotes}
                                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                            className="min-h-[100px] bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20 resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pickup Information */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px flex-1 bg-border/60"></div>
                                    <h2 className="text-2xl font-serif text-foreground">Pickup Information</h2>
                                    <div className="h-px flex-1 bg-border/60"></div>
                                </div>
                                <div className="space-y-6">
                                    {/* Same Day Pickup Toggle */}
                                    <div className="flex items-center justify-between p-6 rounded-lg border border-gold/20 bg-gold/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Label htmlFor="sameDayPickup" className="text-base font-medium cursor-pointer">
                                                    Same-Day Pickup
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-0.5">Pick up items the same day as your event</p>
                                                <p className="text-xs text-amber-600 mt-1 font-medium">Additional fee applies (calculated at checkout)</p>
                                            </div>
                                        </div>
                                        <Checkbox
                                            id="sameDayPickup"
                                            checked={sameDayPickup}
                                            onCheckedChange={(c) => setSameDayPickup(c as boolean)}
                                            className="h-6 w-6 border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {/* Pickup Date */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                Pickup Date {!sameDayPickup && "*"}
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal h-12 border-border/50 hover:border-gold/50 hover:bg-background",
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
                                                    <PopoverContent className="w-auto p-0 border-gold/20 shadow-xl">
                                                        <Calendar
                                                            mode="single"
                                                            selected={pickupDate}
                                                            onSelect={setPickupDate}
                                                            initialFocus
                                                            disabled={(date) => date < new Date()}
                                                            className="p-3 pointer-events-auto"
                                                        />
                                                    </PopoverContent>
                                                )}
                                            </Popover>
                                        </div>

                                        {/* Pickup Time */}
                                        <div className="space-y-2">
                                            <Label htmlFor="pickupTime" className="flex items-center gap-2">
                                                Preferred Pickup Time
                                            </Label>
                                            <Input
                                                id="pickupTime"
                                                type="time"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                className="w-full h-12 bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Pickup Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pickupNotes" className="flex items-center gap-2">
                                            Pickup Instructions
                                        </Label>
                                        <Textarea
                                            id="pickupNotes"
                                            placeholder="Any special instructions for pickup? (e.g., loading dock access, contact person, etc.)"
                                            value={pickupNotes}
                                            onChange={(e) => setPickupNotes(e.target.value)}
                                            rows={3}
                                            className="resize-none min-h-[100px] bg-background border-border/50 focus:border-gold/50 focus:ring-gold/20"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex justify-between pt-12 border-t border-border/40">
                            <Button variant="ghost" onClick={handlePrevStep} className="hover:bg-transparent hover:text-gold px-0">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Add-ons
                            </Button>
                            <Button onClick={handleNextStep} size="lg" className="bg-black text-white hover:bg-black/80 rounded-full px-8 h-12 text-base">
                                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        className="grid lg:grid-cols-3 gap-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="lg:col-span-2 space-y-8">
                            {/* Review Order */}
                            <Card className="border-border/40 overflow-hidden">
                                <CardHeader className="bg-secondary/10 border-b border-border/40 py-4">
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="h-5 w-5 text-gold" />
                                        <CardTitle className="font-serif text-xl">Review Order</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/40">
                                        {items.map((item, index) => {
                                            const product = cartProducts.find((p) => p.id === item.productId)
                                            if (!product) return null
                                            return (
                                                <motion.div
                                                    key={item.productId}
                                                    className="flex gap-6 p-6 hover:bg-secondary/5 transition-colors"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                >
                                                    <div className="h-24 w-24 rounded-lg border border-border/40 bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.image_url || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-serif text-lg font-medium text-foreground">{product.name}</h4>
                                                            <p className="text-gold font-medium mt-1">{formatCurrency(product.price * item.quantity)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <div className="flex items-center border border-border/50 rounded-full">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-l-full hover:text-gold"
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
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-r-full hover:text-gold"
                                                                    onClick={() => {
                                                                        updateQuantity(item.productId, item.quantity + 1)
                                                                        toast.info('Quantity updated')
                                                                    }}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="border-border/40 overflow-hidden">
                                <CardHeader className="bg-secondary/10 border-b border-border/40 py-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-gold" />
                                        <CardTitle className="font-serif text-xl">Payment Method</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="bg-gold/5 border border-gold/20 rounded-xl p-8 text-center space-y-3">
                                        <p className="text-foreground font-medium">
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
                            <Card className="sticky top-24 border-gold/20 shadow-xl shadow-gold/5 overflow-hidden">
                                <CardHeader className="bg-black text-white py-6">
                                    <CardTitle className="font-serif text-xl text-center">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {totals ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>{formatCurrency(totals.subtotal)}</span>
                                                </div>
                                                {totals.setupFee > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Setup Fee</span>
                                                        <span>{formatCurrency(totals.setupFee)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tax ({(totals.taxRate * 100).toFixed(2)}%)</span>
                                                    <span>{formatCurrency(totals.taxAmount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Delivery Fee</span>
                                                    <span>{isCalculating ? '...' : formatCurrency(totals.deliveryFee)}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border/40">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="font-serif text-lg">Total</span>
                                                    <span className="font-bold text-2xl text-gold">{formatCurrency(totals.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-destructive">{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full h-14 text-lg bg-gold text-black hover:bg-gold/90 rounded-full font-medium shadow-lg hover:shadow-gold/20 transition-all duration-300"
                                        onClick={handleSubmit}
                                        disabled={isLoading || isCalculating || !totals}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>

                                    <Button variant="ghost" className="w-full hover:bg-transparent hover:text-gold" onClick={handlePrevStep}>
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
