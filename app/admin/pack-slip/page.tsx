"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Printer,
    Calendar as CalendarIcon,
    Package,
    Wrench,
    MapPin,
    Clock,
    FileText,
    ChevronRight,
    Search,
    Truck
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AssemblyItem {
    name: string
    quantity: number
}

interface PackItem {
    id: string
    name: string
    quantity: number
    assemblyItems: (string | AssemblyItem)[]
}

interface AssemblyPartDetail {
    quantity: number
    products: Record<string, number>
}

interface OrderPack {
    id: string
    customerName: string
    deliveryAddress: string | null
    deliveryTime: string | null
    deliveryDate: string | null
    deliveryNotes: string | null
    items: PackItem[]
    assemblySummary: Record<string, AssemblyPartDetail>
}

interface UpcomingDate {
    date: string
    orderCount: number
}

export default function PackSlipPage() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<PackItem[]>([])
    const [assemblySummary, setAssemblySummary] = useState<Record<string, AssemblyPartDetail>>({})
    const [orders, setOrders] = useState<OrderPack[]>([])
    const [orderCount, setOrderCount] = useState(0)
    const [hasSearched, setHasSearched] = useState(false)
    const [viewMode, setViewMode] = useState<"aggregate" | "by-order">("aggregate")
    const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([])
    const [activeTab, setActiveTab] = useState("upcoming")

    const supabase = createClient()

    useEffect(() => {
        fetchUpcomingDates()
    }, [])

    async function fetchUpcomingDates() {
        try {
            const today = new Date().toISOString().split('T')[0]
            const { data, error } = await supabase
                .from('orders')
                .select('delivery_date')
                .gte('delivery_date', today)
                .order('delivery_date', { ascending: true })

            if (error) throw error

            const dateMap = new Map<string, number>()
            data?.forEach((order: any) => {
                if (order.delivery_date) {
                    dateMap.set(order.delivery_date, (dateMap.get(order.delivery_date) || 0) + 1)
                }
            })

            const dates = Array.from(dateMap.entries())
                .map(([date, count]) => ({ date, orderCount: count }))
                .slice(0, 10)

            setUpcomingDates(dates)
        } catch (error) {
            console.error('Error fetching upcoming dates:', error)
        }
    }

    async function generatePackSlip(selectedDate?: string) {
        const targetDate = selectedDate || date
        if (selectedDate) setDate(selectedDate)

        setLoading(true)
        setHasSearched(true)
        setActiveTab("generate")

        try {
            const { data: ordersData, error: orderError } = await supabase
                .from('orders')
                .select(`
                    id,
                    customer_name,
                    delivery_address,
                    delivery_time,
                    delivery_date,
                    delivery_notes,
                    order_items (
                        quantity,
                        products (
                            id,
                            name,
                            assembly_items
                        )
                    )
                `)
                .eq('delivery_date', targetDate)

            if (orderError) throw orderError

            if (!ordersData || ordersData.length === 0) {
                setItems([])
                setAssemblySummary({})
                setOrders([])
                setOrderCount(0)
                setLoading(false)
                return
            }

            const itemMap = new Map<string, PackItem>()
            const assemblyMap: Record<string, AssemblyPartDetail> = {}
            const orderMap = new Map<string, OrderPack>()

            ordersData.forEach((order: any) => {
                const orderItems = order.order_items

                const orderPack: OrderPack = {
                    id: order.id,
                    customerName: order.customer_name,
                    deliveryAddress: order.delivery_address,
                    deliveryTime: order.delivery_time,
                    deliveryDate: order.delivery_date,
                    deliveryNotes: order.delivery_notes,
                    items: [],
                    assemblySummary: {}
                }

                orderItems.forEach((item: any) => {
                    const product = item.products
                    const quantity = item.quantity

                    if (!product) return

                    const current = itemMap.get(product.id) || {
                        id: product.id,
                        name: product.name,
                        quantity: 0,
                        assemblyItems: product.assembly_items || []
                    }
                    current.quantity += quantity
                    itemMap.set(product.id, current)

                    if (product.assembly_items && Array.isArray(product.assembly_items)) {
                        product.assembly_items.forEach((part: string | AssemblyItem) => {
                            let partName = ''
                            let partQty = 0

                            if (typeof part === 'string') {
                                partName = part
                                partQty = quantity
                            } else {
                                partName = part.name
                                partQty = part.quantity * quantity
                            }

                            if (!assemblyMap[partName]) {
                                assemblyMap[partName] = { quantity: 0, products: {} }
                            }
                            assemblyMap[partName].quantity += partQty
                            assemblyMap[partName].products[product.name] = (assemblyMap[partName].products[product.name] || 0) + partQty
                        })
                    }

                    orderPack.items.push({
                        id: product.id,
                        name: product.name,
                        quantity: quantity,
                        assemblyItems: product.assembly_items || []
                    })

                    if (product.assembly_items && Array.isArray(product.assembly_items)) {
                        product.assembly_items.forEach((part: string | AssemblyItem) => {
                            let partName = ''
                            let partQty = 0

                            if (typeof part === 'string') {
                                partName = part
                                partQty = quantity
                            } else {
                                partName = part.name
                                partQty = part.quantity * quantity
                            }

                            if (!orderPack.assemblySummary[partName]) {
                                orderPack.assemblySummary[partName] = { quantity: 0, products: {} }
                            }
                            orderPack.assemblySummary[partName].quantity += partQty
                            orderPack.assemblySummary[partName].products[product.name] = (orderPack.assemblySummary[partName].products[product.name] || 0) + partQty
                        })
                    }
                })

                orderMap.set(order.id, orderPack)
            })

            setItems(Array.from(itemMap.values()))
            setAssemblySummary(assemblyMap)
            setOrders(Array.from(orderMap.values()))
            setOrderCount(orderMap.size)

            toast.success(`Pack slip generated for ${orderMap.size} orders`)

        } catch (error) {
            console.error('Error generating pack slip:', error)
            setItems([])
            setOrders([])
            toast.error("Failed to generate pack slip")
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen text-[var(--dashboard-text)]">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif font-light tracking-tight">Pack Slip Generator</h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light">
                        Plan and prepare your upcoming events deliveries
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {hasSearched && (
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="glass-card border-none hover:bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)]"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Manifest
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit">
                    <TabsTrigger
                        value="upcoming"
                        className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black"
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Upcoming Deliveries
                    </TabsTrigger>
                    <TabsTrigger
                        value="generate"
                        className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Custom Date
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingDates.length > 0 ? (
                            upcomingDates.map((item, idx) => (
                                <Card
                                    key={item.date}
                                    className={cn(
                                        "glass-card border-none cursor-pointer hover:bg-[var(--dashboard-card-hover)] transition-all group",
                                        `delay-${(idx % 5) * 100}`
                                    )}
                                    onClick={() => generatePackSlip(item.date)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3">
                                                <div className="p-2 w-fit rounded-lg bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]">
                                                    <CalendarIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-xl border-none">
                                                        {format(new Date(item.date), 'EEEE')}
                                                    </h3>
                                                    <p className="text-[var(--dashboard-text-muted)] text-sm">
                                                        {format(new Date(item.date), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-black/30 rounded-full px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent-gold)]">
                                                    {item.orderCount} {item.orderCount === 1 ? 'Order' : 'Orders'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center text-sm font-medium text-[var(--dashboard-accent-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Manifest <ChevronRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="glass-card border-none col-span-full">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="p-4 rounded-full bg-black/20 mb-4">
                                        <Package className="h-8 w-8 text-[var(--dashboard-text-muted)] opacity-50" />
                                    </div>
                                    <h3 className="text-xl font-serif">No Upcoming Deliveries</h3>
                                    <p className="text-[var(--dashboard-text-muted)] max-w-xs mt-2">
                                        There are no scheduled deliveries in the database starting from today.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="generate" className="animate-fade-in-up">
                    <Card className="glass-card border-none max-w-xl mx-auto">
                        <CardHeader>
                            <CardTitle className="font-serif">Manual Date Selection</CardTitle>
                            <CardDescription>Select a specific date to generate a warehouse packing list.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="date">Delivery Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                                    <Input
                                        id="date"
                                        type="date"
                                        className="pl-9 bg-black/20 border-none rounded-xl"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => generatePackSlip()}
                                disabled={loading}
                                className="w-full bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90 font-bold"
                            >
                                {loading ? "Analyzing orders..." : "Generate Slip"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {hasSearched && (
                <div className="space-y-8 mt-4 animate-fade-in">
                    {/* Manifest Title Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--dashboard-border)] pb-8 mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--dashboard-accent-gold)] text-sm font-bold uppercase tracking-widest mb-2">
                                <Truck className="h-4 w-4" />
                                Warehouse Manifest
                            </div>
                            <h2 className="text-3xl font-serif">
                                {format(new Date(date), 'MMMM d, yyyy')}
                            </h2>
                            <p className="text-[var(--dashboard-text-muted)]">
                                {orderCount} total orders scheduled for this date
                            </p>
                        </div>

                        <Tabs
                            value={viewMode}
                            onValueChange={(v: string) => setViewMode(v as "aggregate" | "by-order")}
                            className="print:hidden w-fit"
                        >
                            <TabsList className="glass-card border-none bg-black/20">
                                <TabsTrigger value="aggregate">Full Warehouse List</TabsTrigger>
                                <TabsTrigger value="by-order">Individual Orders</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-24 glass-card border-none rounded-2xl">
                            <Package className="h-12 w-12 text-[var(--dashboard-text-muted)] mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-serif">No items found</h3>
                            <p className="text-[var(--dashboard-text-muted)]">No orders matches the selected criteria.</p>
                        </div>
                    ) : (
                        <>
                            {/* Warehouse Aggregate View */}
                            <div className={viewMode === 'aggregate' ? 'block animate-fade-in' : 'hidden print:hidden'}>
                                <div className="grid gap-8 lg:grid-cols-5">
                                    <div className="lg:col-span-3 space-y-6">
                                        <div className="flex items-center gap-2 text-xl font-serif mb-4">
                                            <Package className="h-6 w-6 text-[var(--dashboard-accent-gold)]" />
                                            <h3>Total Products to Pack</h3>
                                        </div>
                                        <Card className="glass-card border-none overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-[var(--dashboard-border)] hover:bg-transparent">
                                                        <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Product Name</TableHead>
                                                        <TableHead className="text-right text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-24">QTY</TableHead>
                                                        <TableHead className="text-center text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-20">Check</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.map((item) => (
                                                        <TableRow key={item.id} className="border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]">
                                                            <TableCell className="py-4">
                                                                <div className="font-medium">{item.name}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono text-lg text-[var(--dashboard-accent-gold)]">{item.quantity}</TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="h-6 w-6 border border-[var(--dashboard-border)] rounded mx-auto bg-black/20" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    </div>

                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center gap-2 text-xl font-serif mb-4">
                                            <Wrench className="h-6 w-6 text-[var(--dashboard-accent-gold)]" />
                                            <h3>Total Assembly Parts</h3>
                                        </div>
                                        <Card className="glass-card border-none overflow-hidden">
                                            {Object.keys(assemblySummary).length === 0 ? (
                                                <div className="p-12 text-center text-[var(--dashboard-text-muted)] italic">
                                                    No additional assembly parts needed.
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-[var(--dashboard-border)] hover:bg-transparent">
                                                            <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider">Part Name</TableHead>
                                                            <TableHead className="text-right text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-24">QTY</TableHead>
                                                            <TableHead className="text-center text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-20">Check</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Object.entries(assemblySummary).map(([part, details]) => (
                                                            <TableRow key={part} className="border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]">
                                                                <TableCell className="py-4">
                                                                    <div className="font-medium">{part}</div>
                                                                    <div className="text-[10px] text-[var(--dashboard-text-muted)] mt-1 flex flex-wrap gap-x-2">
                                                                        {Object.entries(details.products).map(([productName, productQty]) => (
                                                                            <span key={productName} className="flex items-center gap-1">
                                                                                <span className="h-1 w-1 rounded-full bg-[var(--dashboard-accent-gold)]/50" />
                                                                                {productName} (x{productQty})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </TableCell>
                                                                <td className="px-4 py-4 text-right font-mono text-lg text-[var(--dashboard-accent-gold)]">{details.quantity}</td>
                                                                <td className="px-4 py-4">
                                                                    <div className="w-6 h-6 border border-[var(--dashboard-border)] rounded mx-auto bg-black/20" />
                                                                </td>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Orders View */}
                            <div className={viewMode === 'by-order' ? 'block animate-fade-in' : 'hidden print:block'}>
                                <div className="space-y-12 print:space-y-12">
                                    {orders.map((order) => (
                                        <Card key={order.id} className="glass-card border-none overflow-hidden print:shadow-none print:border print:border-black/20 print:bg-white print:text-black">
                                            <div className="p-6 md:p-8 bg-black/20 print:bg-gray-100/50">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[var(--dashboard-accent-gold)] text-xs font-bold uppercase tracking-widest print:text-black">Client Name</p>
                                                            <h3 className="text-3xl font-serif print:text-black">{order.customerName}</h3>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <MapPin className="h-4 w-4 mt-0.5 text-[var(--dashboard-accent-gold)] print:text-black" />
                                                                <span className="opacity-90">{order.deliveryAddress || 'Pick-up from Warehouse'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-[var(--dashboard-accent-gold)] print:text-black" />
                                                                <span className="opacity-90">
                                                                    {order.deliveryTime || 'TBD'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {order.deliveryNotes && (
                                                        <div className="md:max-w-xs w-full">
                                                            <div className="p-4 rounded-xl bg-[var(--dashboard-accent-gold)]/5 border border-[var(--dashboard-accent-gold)]/10 text-sm print:bg-gray-50 print:border-gray-200">
                                                                <p className="flex items-center gap-2 font-bold mb-2 uppercase text-[10px] tracking-wider text-[var(--dashboard-accent-gold)] print:text-black">
                                                                    <FileText className="h-3 w-3" />
                                                                    Delivery Notes
                                                                </p>
                                                                <p className="italic opacity-80 leading-relaxed text-[var(--dashboard-text)] print:text-black">
                                                                    "{order.deliveryNotes}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-[var(--dashboard-border)] hover:bg-transparent print:border-black/10">
                                                            <TableHead className="text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider pl-8 print:text-gray-500">Products & Assembly</TableHead>
                                                            <TableHead className="text-right text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-24 print:text-gray-500">QTY</TableHead>
                                                            <TableHead className="text-center text-[var(--dashboard-text-muted)] font-bold uppercase text-xs tracking-wider w-24 pr-8 print:text-gray-500">Check</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {order.items.map((item) => (
                                                            <TableRow key={item.id} className="border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)] print:border-black/10 print:text-black">
                                                                <TableCell className="py-6 pl-8">
                                                                    <div className="font-serif text-lg">{item.name}</div>
                                                                    {item.assemblyItems && item.assemblyItems.length > 0 && (
                                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                                            {item.assemblyItems.map((part, idx) => {
                                                                                let name = ''
                                                                                let qtyPerItem = 0
                                                                                if (typeof part === 'string') {
                                                                                    name = part
                                                                                    qtyPerItem = 1
                                                                                } else {
                                                                                    name = part.name
                                                                                    qtyPerItem = part.quantity
                                                                                }
                                                                                const totalQty = qtyPerItem * item.quantity

                                                                                return (
                                                                                    <div key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] flex items-center gap-2 print:bg-gray-100 print:border-gray-200 print:text-black">
                                                                                        <Wrench className="h-3 w-3 text-[var(--dashboard-accent-gold)] print:text-black" />
                                                                                        <span className="font-bold">{name}</span>
                                                                                        <span className="opacity-50 font-mono">x{totalQty}</span>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right font-mono text-xl text-[var(--dashboard-accent-gold)] print:text-black">{item.quantity}</TableCell>
                                                                <TableCell className="text-center pr-8">
                                                                    <div className="h-7 w-7 border border-[var(--dashboard-border)] rounded-md mx-auto bg-black/20 print:border-black/30 print:bg-transparent" />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer Info (mostly for print) */}
                    <div className="hidden print:flex flex-col items-center gap-2 border-t border-black/10 mt-12 pt-8 text-xs text-black/40">
                        <div className="flex items-center gap-4">
                            <p>Generated on {new Date().toLocaleString()}</p>
                            <span>|</span>
                            <p>PrimeLux Events Inventory Manifest</p>
                        </div>
                        <p className="font-bold print:text-black/60 uppercase tracking-widest">PRIME LUXURY EVENT RENTALS</p>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1cm;
                        size: portrait;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .glass-card {
                        background: white !important;
                        border: 1px solid #e5e7eb !important;
                        backdrop-filter: none !important;
                        box-shadow: none !important;
                        color: black !important;
                    }
                    h1, h2, h3, h4, p, span, div, td, th {
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    )
}
