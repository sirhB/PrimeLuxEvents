'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SearchDialog } from '@/components/ui/search-dialog'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash, Search, ShoppingCart, Calendar as CalendarIcon, Package, User, CreditCard, Minus, Copy, Check, ExternalLink, Camera, Upload, Loader2, X as CloseIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import { createOrder } from '@/app/admin/orders/actions'
import { formatCurrency } from '@/lib/stripe'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image_url?: string
}

export function OrderForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const leadId = searchParams.get('leadId')
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [openSearch, setOpenSearch] = useState(false)

    // Form State
    const [customerName, setCustomerName] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date())
    const [deliveryTime, setDeliveryTime] = useState('10:00')
    const [rentalStartDate, setRentalStartDate] = useState<Date | undefined>(new Date())
    const [rentalEndDate, setRentalEndDate] = useState<Date | undefined>(new Date())
    const [venueType, setVenueType] = useState('private_residence')

    // Fetch Lead Data if leadId is present
    useEffect(() => {
        if (leadId) {
            const fetchLead = async () => {
                const { data: lead, error } = await supabase
                    .from('consultations')
                    .select('*')
                    .eq('id', leadId)
                    .single()

                if (!error && lead) {
                    setCustomerName([lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.customer_name || '')
                    setCustomerEmail(lead.customer_email || '')
                    setCustomerPhone(lead.customer_phone || '')
                    setDeliveryAddress(lead.venue_address || '')
                    if (lead.event_date) {
                        const date = new Date(lead.event_date)
                        setDeliveryDate(date)
                        setRentalStartDate(date)
                        setRentalEndDate(date)
                    }
                }
            }
            fetchLead()
        }
    }, [leadId, supabase])
    const [hasElevator, setHasElevator] = useState(false)
    const [hasStairs, setHasStairs] = useState(false)
    const [hasLoadingDock, setHasLoadingDock] = useState(false)
    const [logisticsNotes, setLogisticsNotes] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'link' | 'cash' | 'check'>('link')
    const [paidAmount, setPaidAmount] = useState<string>('')
    const [checkImage, setCheckImage] = useState<File | null>(null)
    const [checkPreview, setCheckPreview] = useState<string | null>(null)
    const [status, setStatus] = useState('pending')

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([])

    // Success State
    const [successOrder, setSuccessOrder] = useState<any>(null)
    const [isSuccessOpen, setIsSuccessOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const totals = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
        // For simplicity in the admin form, we'll keep it to subtotal for now, 
        // or we could add tax/delivery fields if needed.
        return {
            subtotal,
            total: subtotal
        }
    }, [cart])

    const searchProducts = async (query: string) => {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price_cents, image_url')
            .ilike('name', `%${query}%`)
            .limit(10)

        if (error) throw error
        return (data || []).map((p: any) => ({
            ...p,
            price: resolvePriceCents(p),
        }))
    }

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: resolvePriceCents(product),
                quantity: 1,
                image_url: product.image_url
            }]
        })
        toast.success(`Added ${product.name} to cart`)
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const handleCheckImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCheckImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setCheckPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cart.length === 0) {
            toast.error('Please add at least one item to the order')
            return
        }

        setLoading(true)
        try {
            let checkUrl = ''
            if (paymentMethod === 'check' && checkImage) {
                const fileExt = checkImage.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const filePath = `deposits/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('check-deposits')
                    .upload(filePath, checkImage)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('check-deposits')
                    .getPublicUrl(filePath)

                checkUrl = publicUrl
            }

            const result = await createOrder({
                customerName,
                customerEmail,
                customerPhone,
                deliveryAddress,
                deliveryDate: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : '',
                deliveryTime,
                rentalStartDate: rentalStartDate ? format(rentalStartDate, 'yyyy-MM-dd') : '',
                rentalEndDate: rentalEndDate ? format(rentalEndDate, 'yyyy-MM-dd') : '',
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
                status: paymentMethod === 'link' ? 'pending' : 'confirmed',
                totalAmount: totals.total,
                paymentMethod,
                paidAmount: paidAmount ? Math.round(parseFloat(paidAmount) * 100) : undefined,
                checkUrl
            })

            if (result.success) {
                toast.success('Order created successfully')
                setSuccessOrder(result.data)
                setIsSuccessOpen(true)
                // We'll let the user close the dialog or use the links before navigating
                // Or we can just navigate after they close it.
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to create order')
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client & Logistics */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none glass-card overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-black/20">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                <CardTitle className="text-xl">Customer Information</CardTitle>
                            </div>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">Client details for this order</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Full Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        required
                                        placeholder="John Doe"
                                        className="bg-black/20 border-[var(--dashboard-border)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email Address</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        value={customerEmail}
                                        onChange={e => setCustomerEmail(e.target.value)}
                                        required
                                        placeholder="john@example.com"
                                        className="bg-black/20 border-[var(--dashboard-border)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone Number</Label>
                                    <Input
                                        id="customerPhone"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        placeholder="(555) 000-0000"
                                        className="bg-black/20 border-[var(--dashboard-border)]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                                    <Input
                                        id="deliveryAddress"
                                        value={deliveryAddress}
                                        onChange={e => setDeliveryAddress(e.target.value)}
                                        required
                                        placeholder="123 Luxury Lane, NY"
                                        className="bg-black/20 border-[var(--dashboard-border)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[var(--dashboard-border)]">
                                <Label className="text-lg font-serif">Logistics & Access</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="hasElevator"
                                            checked={hasElevator}
                                            onChange={e => setHasElevator(e.target.checked)}
                                            className="h-4 w-4 rounded border-[var(--dashboard-border)] bg-black/20"
                                        />
                                        <Label htmlFor="hasElevator">Freight Elevator</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="hasStairs"
                                            checked={hasStairs}
                                            onChange={e => setHasStairs(e.target.checked)}
                                            className="h-4 w-4 rounded border-[var(--dashboard-border)] bg-black/20"
                                        />
                                        <Label htmlFor="hasStairs">Stairs Involved</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="hasLoadingDock"
                                            checked={hasLoadingDock}
                                            onChange={e => setHasLoadingDock(e.target.checked)}
                                            className="h-4 w-4 rounded border-[var(--dashboard-border)] bg-black/20"
                                        />
                                        <Label htmlFor="hasLoadingDock">Loading Dock</Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logisticsNotes">Logistics Notes</Label>
                                    <Textarea
                                        id="logisticsNotes"
                                        value={logisticsNotes}
                                        onChange={e => setLogisticsNotes(e.target.value)}
                                        placeholder="e.g. Gate code 1234, deliver to 4th floor..."
                                        className="bg-black/20 border-[var(--dashboard-border)] min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-black/20">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                <CardTitle className="text-xl">Event & Rental Timing</CardTitle>
                            </div>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">When and where the items are needed</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 flex flex-col">
                                    <Label>Delivery Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-black/20 border-[var(--dashboard-border)]",
                                                    !deliveryDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={deliveryDate}
                                                onSelect={setDeliveryDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deliveryTime">Delivery Time</Label>
                                    <Input
                                        id="deliveryTime"
                                        type="time"
                                        value={deliveryTime}
                                        onChange={e => setDeliveryTime(e.target.value)}
                                        className="bg-black/20 border-[var(--dashboard-border)]"
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <Label>Rental Period Start</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-black/20 border-[var(--dashboard-border)]",
                                                    !rentalStartDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {rentalStartDate ? format(rentalStartDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={rentalStartDate}
                                                onSelect={setRentalStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-black/20 flex flex-row items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                    <CardTitle className="text-xl">Order Items</CardTitle>
                                </div>
                                <CardDescription className="text-[var(--dashboard-text-muted)]">Products to include in this order</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[var(--dashboard-accent-gold)] text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/10"
                                onClick={() => setOpenSearch(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cart.length === 0 ? (
                                <div className="p-12 text-center">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-[var(--dashboard-border)] mb-4 opacity-20" />
                                    <p className="text-[var(--dashboard-text-muted)] font-serif italic text-lg">No items added to the order yet.</p>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="mt-2 text-[var(--dashboard-accent-gold)]"
                                        onClick={() => setOpenSearch(true)}
                                    >
                                        Search for products to add
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--dashboard-border)]">
                                    {cart.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center gap-4 group hover:bg-black/10 transition-colors">
                                            <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0 border border-[var(--dashboard-border)]">
                                                {item.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-[var(--dashboard-text)] truncate">{item.name}</h4>
                                                <p className="text-xs text-[var(--dashboard-text-muted)] font-mono">{formatCurrency(item.price)} each</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-black/40 rounded-full border border-[var(--dashboard-border)] p-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-white"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-bold font-mono">{item.quantity}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-white"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="w-24 text-right font-bold text-[var(--dashboard-accent-gold)] font-mono">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary & Payment */}
                <div className="space-y-6">
                    <Card className="border-none glass-card overflow-hidden sticky top-8">
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-black/20">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                <CardTitle className="text-xl">Payment & Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select
                                    value={paymentMethod}
                                    onValueChange={(val: any) => setPaymentMethod(val)}
                                >
                                    <SelectTrigger className="bg-black/20 border-[var(--dashboard-border)]">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-[var(--dashboard-border)] bg-black/95">
                                        <SelectItem value="link">Payment Link (Stripe)</SelectItem>
                                        <SelectItem value="cash">Cash Payment</SelectItem>
                                        <SelectItem value="check">Check Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-[var(--dashboard-text-muted)] px-1">
                                    {paymentMethod === 'link'
                                        ? "Sends a payment link to the client email."
                                        : "Order will be marked as paid/confirmed if received."}
                                </p>
                            </div>

                            {(paymentMethod === 'cash' || paymentMethod === 'check') && (
                                <div className="space-y-4 pt-4 border-t border-[var(--dashboard-border)] animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="paidAmount" className="text-xs uppercase tracking-widest text-[var(--dashboard-text-muted)]">Amount Received ($)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)] font-mono">$</span>
                                            <Input
                                                id="paidAmount"
                                                type="number"
                                                step="0.01"
                                                value={paidAmount}
                                                onChange={e => setPaidAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-black/40 border-[var(--dashboard-border)] pl-8 font-mono"
                                            />
                                        </div>
                                    </div>

                                    {paymentMethod === 'check' && (
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest text-[var(--dashboard-text-muted)]">Check Photo</Label>
                                            <div className="relative group">
                                                {checkPreview ? (
                                                    <div className="relative aspect-[3/1] rounded-lg overflow-hidden border border-[var(--dashboard-border)] bg-black/40">
                                                        <img src={checkPreview} alt="Check preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setCheckImage(null); setCheckPreview(null); }}
                                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                                                        >
                                                            <CloseIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center aspect-[3/1] border-2 border-dashed border-[var(--dashboard-border)] rounded-lg cursor-pointer hover:border-[var(--dashboard-accent-gold)]/50 hover:bg-[var(--dashboard-accent-gold)]/5 transition-all">
                                                        <div className="flex flex-col items-center justify-center py-4">
                                                            <Camera className="h-6 w-6 text-[var(--dashboard-text-muted)] mb-2" />
                                                            <p className="text-xs text-[var(--dashboard-text-muted)]">Take picture or upload check</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="environment"
                                                            onChange={handleCheckImageChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-[var(--dashboard-border)]">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--dashboard-text-muted)] font-serif italic">Subtotal</span>
                                    <span className="font-mono font-bold">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--dashboard-text-muted)] font-serif italic">Delivery Fee</span>
                                    <span className="font-mono text-xs opacity-50">Calculated on save</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--dashboard-text-muted)] font-serif italic">Tax</span>
                                    <span className="font-mono text-xs opacity-50">Calculated on save</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[var(--dashboard-border)]">
                                    <span className="text-lg font-bold font-serif">Estimated Total</span>
                                    <span className="text-xl font-bold font-mono text-[var(--dashboard-accent-gold)]">
                                        {formatCurrency(totals.total)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold h-12 rounded-lg"
                                disabled={loading || cart.length === 0}
                            >
                                {loading ? 'Creating Order...' : 'Create Order'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SearchDialog
                open={openSearch}
                onOpenChange={setOpenSearch}
                onSearch={searchProducts}
                onSelect={addToCart}
                placeholder="Search products by name..."
                renderItem={(item: any, isSelected) => (
                    <div className={cn(
                        "flex items-center gap-4 p-3",
                        isSelected && "bg-white/5"
                    )}>
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0 border border-[var(--dashboard-border)]">
                            {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground uppercase text-center p-1">No Image</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-[var(--dashboard-accent-gold)] font-mono">{formatCurrency(item.price)}</p>
                        </div>
                    </div>
                )}
            />

            {/* Success Dialog */}
            <Dialog open={isSuccessOpen} onOpenChange={(open) => {
                setIsSuccessOpen(open)
                if (!open) router.push('/admin/orders')
            }}>
                <DialogContent className="glass-card border-[var(--dashboard-border)] bg-black/95 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif">Order Created Successfully</DialogTitle>
                        <DialogDescription className="text-[var(--dashboard-text-muted)]">
                            The order has been saved and items have been reserved.
                        </DialogDescription>
                    </DialogHeader>

                    {successOrder && (
                        <div className="space-y-6 py-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Order Summary</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--dashboard-text)] font-serif">Order ID</span>
                                    <span className="font-mono text-[var(--dashboard-accent-gold)]">{successOrder.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--dashboard-text)] font-serif">Customer</span>
                                    <span className="text-[var(--dashboard-text-muted)]">{successOrder.customer_name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[var(--dashboard-text)] font-serif">Total Value</span>
                                    <span className="font-mono font-bold text-[var(--dashboard-accent-gold)]">{formatCurrency(successOrder.total_amount)}</span>
                                </div>
                            </div>

                            {paymentMethod === 'link' && (
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Client Payment Link</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono truncate text-[var(--dashboard-text-muted)]">
                                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout?order_id=${successOrder.id}`}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="shrink-0 border-[var(--dashboard-accent-gold)] text-[var(--dashboard-accent-gold)]"
                                            onClick={() => {
                                                const link = `${window.location.origin}/checkout?order_id=${successOrder.id}`
                                                navigator.clipboard.writeText(link)
                                                setCopied(true)
                                                toast.success('Link copied to clipboard')
                                                setTimeout(() => setCopied(false), 2000)
                                            }}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-[var(--dashboard-text-muted)] italic">
                                        Share this link with {successOrder.customer_name} to complete payment.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex flex-row gap-2 sm:justify-start">
                        <Button
                            variant="outline"
                            className="flex-1 border-[var(--dashboard-border)]"
                            onClick={() => {
                                setIsSuccessOpen(false)
                                router.push('/admin/orders')
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            asChild
                            className="flex-1 bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90"
                        >
                            <Link href={`/admin/orders/${successOrder?.id}`}>
                                View Details
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form >
    )
}
