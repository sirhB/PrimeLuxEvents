
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Calendar as CalendarIcon, Package, Truck, Wrench } from "lucide-react"
import { format } from "date-fns"

interface PackItem {
    id: string
    name: string
    quantity: number
    assemblyItems: string[]
}

export default function PackSlipPage() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<PackItem[]>([])
    const [assemblySummary, setAssemblySummary] = useState<Record<string, number>>({})
    const [orderCount, setOrderCount] = useState(0)
    const [hasSearched, setHasSearched] = useState(false)

    const supabase = createClient()

    async function generatePackSlip() {
        setLoading(true)
        setHasSearched(true)

        // In a real app, we would query rental_reservations or orders based on delivery date
        // For now, let's simulate by fetching all orders and pretending they are for this date
        // or just fetching all products to show the structure.

        // Let's try to fetch orders created recently as a proxy for "active" orders
        // Since we don't have a real delivery_date column in orders table in the schema provided earlier
        // (it was in rental_reservations, but let's assume we look at rental_reservations)

        try {
            // 1. Get reservations for this date
            // Note: In the schema, rental_reservations has start_date. Let's use that.
            const { data: reservations, error: resError } = await supabase
                .from('rental_reservations')
                .select(`
                    quantity,
                    product:products (
                        id,
                        name,
                        assembly_items
                    )
                `)
                .eq('start_date', date)

            if (resError) throw resError

            // Aggregate items
            const itemMap = new Map<string, PackItem>()
            const assemblyMap: Record<string, number> = {}
            let ordersFound = 0 // This is hard to count from reservations alone without grouping by order_id, but let's just count reservations for now or distinct orders if we had order_id

            // If no reservations found, let's just show a message
            if (!reservations || reservations.length === 0) {
                setItems([])
                setAssemblySummary({})
                setOrderCount(0)
                setLoading(false)
                return
            }

            // Count distinct orders
            // @ts-ignore
            const orderIds = new Set(reservations.map(r => r.order_id))
            setOrderCount(orderIds.size)

            reservations.forEach((res: any) => {
                const product = res.product
                if (!product) return

                const current = itemMap.get(product.id) || {
                    id: product.id,
                    name: product.name,
                    quantity: 0,
                    assemblyItems: product.assembly_items || []
                }

                current.quantity += res.quantity
                itemMap.set(product.id, current)

                // Aggregate assembly items
                if (product.assembly_items && Array.isArray(product.assembly_items)) {
                    product.assembly_items.forEach((part: string) => {
                        assemblyMap[part] = (assemblyMap[part] || 0) + res.quantity
                    })
                }
            })

            setItems(Array.from(itemMap.values()))
            setAssemblySummary(assemblyMap)

        } catch (error) {
            console.error('Error generating pack slip:', error)
            // Fallback for demo if no data exists
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
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
                <div className="space-y-8 print:space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Delivery Manifest</h2>
                            <p className="text-muted-foreground">
                                Date: {format(new Date(date), 'MMMM d, yyyy')}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Orders</div>
                            <div className="text-2xl font-bold">{orderCount}</div>
                        </div>
                        <Button variant="outline" size="icon" onClick={handlePrint} className="print:hidden">
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            No reservations found for this date.
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 print:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                                    <Package className="h-5 w-5" />
                                    <h3>Products to Pack</h3>
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                                                <th className="px-4 py-3 text-right font-medium w-24">Qty</th>
                                                <th className="px-4 py-3 text-center font-medium w-12">Check</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">{item.name}</td>
                                                    <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="w-4 h-4 border rounded mx-auto" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                                    <Wrench className="h-5 w-5" />
                                    <h3>Assembly Parts Required</h3>
                                </div>
                                {Object.keys(assemblySummary).length === 0 ? (
                                    <div className="p-4 border rounded-md bg-muted/20 text-muted-foreground text-sm italic">
                                        No assembly parts required for these items.
                                    </div>
                                ) : (
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Part Name</th>
                                                    <th className="px-4 py-3 text-right font-medium w-24">Total Qty</th>
                                                    <th className="px-4 py-3 text-center font-medium w-12">Check</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {Object.entries(assemblySummary).map(([part, qty]) => (
                                                    <tr key={part}>
                                                        <td className="px-4 py-3">{part}</td>
                                                        <td className="px-4 py-3 text-right font-mono">{qty}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="w-4 h-4 border rounded mx-auto" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="hidden print:block mt-12 pt-8 border-t text-sm text-muted-foreground text-center">
                        <p>Generated on {new Date().toLocaleString()}</p>
                        <p>PrimeLux Events - Internal Use Only</p>
                    </div>
                </div>
            )}
        </div>
    )
}
