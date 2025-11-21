"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Calendar as CalendarIcon, Package, Truck, Wrench, MapPin, Clock, FileText } from "lucide-react"
import { format } from "date-fns"

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

interface OrderPack {
    id: string
    customerName: string
    deliveryAddress: string | null
    deliveryTime: string | null
    deliveryDate: string | null
    deliveryNotes: string | null
    items: PackItem[]
    assemblySummary: Record<string, number>
}

export default function PackSlipPage() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<PackItem[]>([])
    const [assemblySummary, setAssemblySummary] = useState<Record<string, number>>({})
    const [orders, setOrders] = useState<OrderPack[]>([])
    const [orderCount, setOrderCount] = useState(0)
    const [hasSearched, setHasSearched] = useState(false)
    const [viewMode, setViewMode] = useState<"aggregate" | "by-order">("aggregate")

    const supabase = createClient()

    async function generatePackSlip() {
        setLoading(true)
        setHasSearched(true)

        try {
            // 1. Get reservations for this date
            const { data: reservations, error: resError } = await supabase
                .from('rental_reservations')
                .select(`
                    quantity,
                    order_id,
                    order:orders (
                        id,
                        customer_name,
                        delivery_address,
                        delivery_time,
                        delivery_date,
                        delivery_notes
                    ),
                    product:products (
                        id,
                        name,
                        assembly_items
                    )
                `)
                .eq('start_date', date)

            if (resError) throw resError

            if (!reservations || reservations.length === 0) {
                setItems([])
                setAssemblySummary({})
                setOrders([])
                setOrderCount(0)
                setLoading(false)
                return
            }

            // --- Aggregate View Logic ---
            const itemMap = new Map<string, PackItem>()
            const assemblyMap: Record<string, number> = {}

            // --- By Order View Logic ---
            const orderMap = new Map<string, OrderPack>()

            reservations.forEach((res: any) => {
                const product = res.product
                const order = res.order
                if (!product) return

                // Aggregate Items
                const current = itemMap.get(product.id) || {
                    id: product.id,
                    name: product.name,
                    quantity: 0,
                    assemblyItems: product.assembly_items || []
                }
                current.quantity += res.quantity
                itemMap.set(product.id, current)

                // Aggregate Assembly
                if (product.assembly_items && Array.isArray(product.assembly_items)) {
                    product.assembly_items.forEach((part: string | AssemblyItem) => {
                        let partName = ''
                        let partQty = 0

                        if (typeof part === 'string') {
                            partName = part
                            partQty = res.quantity
                        } else {
                            partName = part.name
                            partQty = part.quantity * res.quantity
                        }

                        assemblyMap[partName] = (assemblyMap[partName] || 0) + partQty
                    })
                }

                // By Order Logic
                if (order) {
                    const orderPack = orderMap.get(order.id) || {
                        id: order.id,
                        customerName: order.customer_name,
                        deliveryAddress: order.delivery_address,
                        deliveryTime: order.delivery_time,
                        deliveryDate: order.delivery_date,
                        deliveryNotes: order.delivery_notes,
                        items: [] as PackItem[],
                        assemblySummary: {} as Record<string, number>
                    }

                    // Add item to order pack
                    const existingItemIndex = orderPack.items.findIndex((i) => i.id === product.id)
                    if (existingItemIndex >= 0) {
                        orderPack.items[existingItemIndex].quantity += res.quantity
                    } else {
                        orderPack.items.push({
                            id: product.id,
                            name: product.name,
                            quantity: res.quantity,
                            assemblyItems: product.assembly_items || []
                        })
                    }

                    // Add assembly to order pack
                    if (product.assembly_items && Array.isArray(product.assembly_items)) {
                        product.assembly_items.forEach((part: string | AssemblyItem) => {
                            let partName = ''
                            let partQty = 0

                            if (typeof part === 'string') {
                                partName = part
                                partQty = res.quantity
                            } else {
                                partName = part.name
                                partQty = part.quantity * res.quantity
                            }

                            orderPack.assemblySummary[partName] = (orderPack.assemblySummary[partName] || 0) + partQty
                        })
                    }

                    orderMap.set(order.id, orderPack)
                }
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
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-serif">Pack Slip Generator</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate daily packing lists for deliveries.
                    </p>
                </div>
            </div>

            <Card className="print:hidden">
                <CardContent className="pt-6">
                    <div className="flex items-end gap-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="date">Delivery Date</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    type="date"
                                    className="pl-9"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button onClick={generatePackSlip} disabled={loading}>
                            {loading ? "Generating..." : "Generate Slip"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {hasSearched && (
                <Card className="print:shadow-none">
                    <CardContent className="p-6">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b pb-4 print:pb-2">
                                <div>
                                    <h2 className="text-2xl font-bold">Delivery Manifest</h2>
                                    <p className="text-muted-foreground">
                                        Date: {format(new Date(date), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm text-muted-foreground">Total Orders</div>
                                        <div className="text-2xl font-bold">{orderCount}</div>
                                    </div>
                                    <Button variant="outline" size="icon" onClick={handlePrint} className="print:hidden">
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as "aggregate" | "by-order")} className="print:hidden">
                                <TabsList>
                                    <TabsTrigger value="aggregate">Aggregate List</TabsTrigger>
                                    <TabsTrigger value="by-order">By Order</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {items.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                    No reservations found for this date.
                                </div>
                            ) : (
                                <>
                                    {/* Aggregate View */}
                                    <div className={viewMode === 'aggregate' ? 'block' : 'hidden print:hidden'}>
                                        <div className="grid gap-8 md:grid-cols-2 print:grid-cols-2">
                                            <PackListSection title="Total Products to Pack" icon={<Package className="h-5 w-5" />} items={items} />
                                            <AssemblyListSection title="Total Assembly Parts" icon={<Wrench className="h-5 w-5" />} summary={assemblySummary} />
                                        </div>
                                    </div>

                                    {/* By Order View */}
                                    <div className={viewMode === 'by-order' ? 'block' : 'hidden print:block'}>
                                        <div className="space-y-12 print:space-y-8">
                                            {orders.map((order) => (
                                                <div key={order.id} className="break-inside-avoid border rounded-lg p-6 print:border-black print:p-0 print:border-0">
                                                    <div className="mb-6 border-b pb-4 print:border-black">
                                                        <h3 className="text-xl font-bold">{order.customerName}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm">
                                                            <div className="flex gap-2">
                                                                <MapPin className="h-4 w-4 text-muted-foreground print:text-black" />
                                                                <span>{order.deliveryAddress || 'No address provided'}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Clock className="h-4 w-4 text-muted-foreground print:text-black" />
                                                                <span>
                                                                    {order.deliveryDate && format(new Date(order.deliveryDate), 'MMM d')}
                                                                    {order.deliveryTime ? ` @ ${order.deliveryTime}` : ''}
                                                                </span>
                                                            </div>
                                                            {order.deliveryNotes && (
                                                                <div className="flex gap-2 col-span-full">
                                                                    <FileText className="h-4 w-4 text-muted-foreground print:text-black" />
                                                                    <span className="italic">{order.deliveryNotes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-8 md:grid-cols-1 print:grid-cols-1">
                                                        <PackListSection title="Products & Assembly" items={order.items} compact />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="hidden print:block mt-12 pt-8 border-t text-sm text-muted-foreground text-center">
                                <p>Generated on {new Date().toLocaleString()}</p>
                                <p>PrimeLux Events - Internal Use Only</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function PackListSection({ title, icon, items, compact }: { title: string, icon?: React.ReactNode, items: PackItem[], compact?: boolean }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary print:text-black">
                {icon}
                <h3>{title}</h3>
            </div>
            <Card className="print:border-black print:shadow-none">
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-muted print:bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                                <th className="px-4 py-3 text-right font-medium w-24">Qty</th>
                                <th className="px-4 py-3 text-center font-medium w-12">Check</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y print:divide-black">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{item.name}</div>
                                        {item.assemblyItems && item.assemblyItems.length > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground print:text-black">
                                                <span className="font-semibold">Assembly Parts:</span>
                                                <ul className="mt-1 space-y-1 pl-2">
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
                                                            <li key={idx} className="flex justify-between max-w-[200px]">
                                                                <span><b>{name}:</b></span>
                                                                <span className="font-mono">
                                                                    &nbsp; {qtyPerItem > 1 && <span className="text-muted-foreground mr-1">{qtyPerItem} each</span>}
                                                                    ({totalQty} total)
                                                                </span>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono align-top">{item.quantity}</td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <div className="h-4 w-4 border rounded mx-auto print:border-black" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}

function AssemblyListSection({ title, icon, summary, compact }: { title: string, icon?: React.ReactNode, summary: Record<string, number>, compact?: boolean }) {
    if (Object.keys(summary).length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary print:text-black">
                    {icon}
                    <h3>{title}</h3>
                </div>
                <div className="p-4 border rounded-md bg-muted/20 text-muted-foreground text-sm italic print:border-black print:text-black">
                    No assembly parts required.
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary print:text-black">
                {icon}
                <h3>{title}</h3>
            </div>
            <div className="border rounded-md overflow-hidden print:border-black">
                <table className="w-full text-sm">
                    <thead className="bg-muted print:bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Part Name</th>
                            <th className="px-4 py-3 text-right font-medium w-24">Qty</th>
                            <th className="px-4 py-3 text-center font-medium w-12">Check</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y print:divide-black">
                        {Object.entries(summary).map(([part, qty]) => (
                            <tr key={part}>
                                <td className="px-4 py-3">{part}</td>
                                <td className="px-4 py-3 text-right font-mono">{qty}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="w-4 h-4 border rounded mx-auto print:border-black" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
