"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Printer, Calendar as CalendarIcon, Package, Wrench, MapPin, Clock, FileText, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

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

interface UpcomingDate {
    date: string
    orderCount: number
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
    const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([])

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

            // Group by date and count
            const dateMap = new Map<string, number>()
            data?.forEach((order: any) => {
                if (order.delivery_date) {
                    dateMap.set(order.delivery_date, (dateMap.get(order.delivery_date) || 0) + 1)
                }
            })

            const dates = Array.from(dateMap.entries())
                .map(([date, count]) => ({ date, orderCount: count }))
                .slice(0, 10) // Show next 10 dates

            setUpcomingDates(dates)
        } catch (error) {
            console.error('Error fetching upcoming dates:', error)
        }
    }

    async function generatePackSlip() {
        setLoading(true)
        setHasSearched(true)

        try {
            // 1. Get orders for this delivery date
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
                .eq('delivery_date', date)

            if (orderError) throw orderError

            if (!ordersData || ordersData.length === 0) {
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

            ordersData.forEach((order: any) => {
                const orderItems = order.order_items

                // Initialize Order Pack
                const orderPack = {
                    id: order.id,
                    customerName: order.customer_name,
                    deliveryAddress: order.delivery_address,
                    deliveryTime: order.delivery_time,
                    deliveryDate: order.delivery_date,
                    deliveryNotes: order.delivery_notes,
                    items: [] as PackItem[],
                    assemblySummary: {} as Record<string, number>
                }

                orderItems.forEach((item: any) => {
                    const product = item.products
                    const quantity = item.quantity

                    if (!product) return

                    // --- Aggregate Logic ---
                    const current = itemMap.get(product.id) || {
                        id: product.id,
                        name: product.name,
                        quantity: 0,
                        assemblyItems: product.assembly_items || []
                    }
                    current.quantity += quantity
                    itemMap.set(product.id, current)

                    // Aggregate Assembly
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

                            assemblyMap[partName] = (assemblyMap[partName] || 0) + partQty
                        })
                    }

                    // --- By Order Logic ---
                    // Add item to order pack
                    orderPack.items.push({
                        id: product.id,
                        name: product.name,
                        quantity: quantity,
                        assemblyItems: product.assembly_items || []
                    })

                    // Add assembly to order pack
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

                            orderPack.assemblySummary[partName] = (orderPack.assemblySummary[partName] || 0) + partQty
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
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pack Slip Generator</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        Generate daily packing lists for deliveries.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full print:hidden">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="upcoming">Upcoming Dates</TabsTrigger>
                    <TabsTrigger value="generate">Generate Slip</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Delivery Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Delivery Date</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingDates.length > 0 ? (
                                        upcomingDates.map((item) => (
                                            <TableRow key={item.date}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDate(item.date)
                                                            generatePackSlip()
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Slip
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-muted-foreground">No upcoming deliveries found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="generate" className="space-y-6 mt-6">
                    <Card>
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
                </TabsContent>
            </Tabs>

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
                                    No orders found for this date.
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
