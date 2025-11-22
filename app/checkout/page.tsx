'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Check, AlertCircle, CalendarIcon, Clock, MapPin, Truck, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react'
import { createOrder, calculateOrderTotal, type CheckoutFormData, type CartItem } from '@/app/actions/checkout'
import { formatCurrency } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/client'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

export default function CheckoutPage() {
    const router = useRouter()
    const { items, eventDetails, clearCart, isLoaded, addItem, setEventDetails } = useCart()
    const [currentStep, setCurrentStep] = useState(1)

    // Step 1: Supplemental Items State
    const [supplementalProducts, setSupplementalProducts] = useState<any[]>([])
    const [isLoadingSupplemental, setIsLoadingSupplemental] = useState(true)

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
    })

    // Additional Event Details State (not directly in CheckoutFormData but needed for UI/Logic)
    const [date, setDate] = useState<Date | undefined>(eventDetails?.date)
    const [startTime, setStartTime] = useState(eventDetails?.startTime || "")
    const [endTime, setEndTime] = useState(eventDetails?.endTime || "")
    const [venueType, setVenueType] = useState(eventDetails?.venueType || "")
    const [hasElevator, setHasElevator] = useState(eventDetails?.logistics?.hasElevator || false)
    const [hasStairs, setHasStairs] = useState(eventDetails?.logistics?.hasStairs || false)
    const [hasLoadingDock, setHasLoadingDock] = useState(eventDetails?.logistics?.hasLoadingDock || false)

    // Redirect if cart is empty (only if loaded)
    useEffect(() => {
        if (isLoaded && items.length === 0) {
            router.push('/catalog')
        }
    }, [items, isLoaded, router])

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
            }
            setIsLoadingSupplemental(false)
        }

        if (currentStep === 1) {
            fetchSupplemental()
        }
    }, [currentStep, items])

    // Fetch Cart Products
    useEffect(() => {
        async function fetchCartProducts() {
            if (items.length === 0) return
            const supabase = createClient()
            const productIds = items.map((item) => item.productId)
            const { data } = await supabase.from('products').select('*').in('id', productIds)
            if (data) setCartProducts(data)
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
            deliveryTime: startTime, // Default delivery time to start time if not set?
            // We might want separate delivery time, but for now let's sync them or keep them separate in UI
        }))
    }, [date, startTime])

    const handleNextStep = () => {
        if (currentStep === 2) {
            // Validate Step 2
            if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !date || !startTime || !endTime || !formData.venueAddress) {
                setError("Please fill in all required fields.")
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
                    notes: formData.deliveryNotes
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
                deliveryTime: formData.deliveryTime || startTime
            }

            const result = await createOrder(finalFormData, cartItems)

            if (result.success) {
                setIsSuccess(true)
                clearCart()
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
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto">
                            <Check className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-serif">Order Placed Successfully!</h2>
                        <p className="text-muted-foreground">
                            Thank you for your order. You'll receive a confirmation email shortly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-border -z-10"></div>
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={cn(
                                "flex flex-col items-center gap-2 bg-background px-2",
                                step <= currentStep ? "text-primary" : "text-muted-foreground"
                            )}>
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center border-2 font-medium text-sm",
                                    step <= currentStep ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground bg-background"
                                )}>
                                    {step}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">
                                    {step === 1 ? "Add-ons" : step === 2 ? "Details" : "Payment"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <h1 className="text-3xl font-serif mb-8 text-center">
                    {currentStep === 1 && "Complete Your Look"}
                    {currentStep === 2 && "Event & Delivery Details"}
                    {currentStep === 3 && "Review & Payment"}
                </h1>

                {/* Step 1: Supplemental Items */}
                {currentStep === 1 && (
                    <div className="space-y-8">
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
                                supplementalProducts.map((product) => (
                                    <Card key={product.id} className="overflow-hidden flex flex-col">
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
                                        <CardFooter className="p-4 pt-0 mt-auto">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => addItem(product.id)}
                                            >
                                                <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleNextStep} size="lg">
                                Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Event & Delivery Details */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="grid gap-6">
                            {/* Customer Info */}
                            <Card>
                                <CardHeader>
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
                            <Card>
                                <CardHeader>
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
                            <Card>
                                <CardHeader>
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
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={handlePrevStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={handleNextStep} size="lg">
                                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review Order</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {items.map((item) => {
                                            const product = cartProducts.find((p) => p.id === item.productId)
                                            if (!product) return null
                                            return (
                                                <div key={item.productId} className="flex gap-4 py-2 border-b last:border-0">
                                                    <div className="h-16 w-16 rounded border bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.image_url || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium font-serif">{product.name}</h4>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">{formatCurrency(product.price * item.quantity)}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                    <CardDescription>Secure payment processing powered by Stripe</CardDescription>
                                </CardHeader>
                                <CardContent>
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
                    </div>
                )}
            </div>
        </div>
    )
}
