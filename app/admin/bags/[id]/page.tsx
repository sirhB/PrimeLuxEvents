'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Trash2, ClipboardList, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AddCatalogItemToBag } from '@/components/admin/add-catalog-item-to-bag'
import { toast } from 'sonner'

export default function BagDetailPage() {
    const { id } = useParams()
    const [bag, setBag] = useState<any>(null)
    const [orderAssignments, setOrderAssignments] = useState<any[]>([])
    const [catalogItems, setCatalogItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchBagData = useCallback(async () => {
        setLoading(true)
        const [bagRes, orderRes, catalogRes] = await Promise.all([
            supabase.from('warehouse_bags').select('*').eq('id', id).single(),
            supabase.from('bag_assignments').select('*, order_items(*, products(name))').eq('bag_id', id),
            supabase.from('bag_catalog_items').select('*, products(name)').eq('bag_id', id)
        ])

        if (bagRes.data) setBag(bagRes.data)
        if (orderRes.data) setOrderAssignments(orderRes.data)
        if (catalogRes.data) setCatalogItems(catalogRes.data)
        setLoading(false)
    }, [id, supabase])

    useEffect(() => {
        fetchBagData()
    }, [fetchBagData])

    const updateCatalogItemQuantity = async (itemId: string, newQty: number) => {
        if (newQty < 1) return
        try {
            const { error } = await supabase.from('bag_catalog_items').update({ quantity: newQty }).eq('id', itemId)
            if (error) throw error
            fetchBagData()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const updateOrderAssignmentQuantity = async (assignmentId: string, newQty: number) => {
        if (newQty < 1) return
        try {
            const { error } = await supabase.from('bag_assignments').update({ quantity: newQty }).eq('id', assignmentId)
            if (error) throw error
            fetchBagData()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const removeCatalogItem = async (itemId: string) => {
        try {
            const { error } = await supabase.from('bag_catalog_items').delete().eq('id', itemId)
            if (error) throw error
            toast.success('Item removed from bag')
            fetchBagData()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const removeOrderAssignment = async (assignmentId: string) => {
        try {
            const { error } = await supabase.from('bag_assignments').delete().eq('id', assignmentId)
            if (error) throw error
            toast.success('Order assignment removed')
            fetchBagData()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Retrieving bag manifest...</p>
            </div>
        )
    }

    if (!bag) return <div>Bag not found.</div>

    const totalItems = orderAssignments.length + catalogItems.length

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
                        <Link href="/admin/bags">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-serif font-light tracking-tight">
                            {bag.color} Bag {bag.number}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Bag Manifest</p>
                    </div>
                </div>
                <AddCatalogItemToBag bagId={id as string} onSuccess={fetchBagData} />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-gray-200 shadow-sm overflow-hidden text-white">
                        <div className={cn(
                            "h-48 flex flex-col items-center justify-center gap-2",
                            bag.color.toLowerCase() === 'black' ? 'bg-black' : `bg-${bag.color.toLowerCase()}-500`
                        )} style={{ backgroundColor: bag.color.toLowerCase() === 'black' ? '#000' : (bag.color.toLowerCase() === 'white' ? '#f1f1f1' : bag.color.toLowerCase()), color: bag.color.toLowerCase() === 'white' ? '#000' : '#fff' }}>
                            <span className="text-5xl font-black tracking-tighter">{bag.number}</span>
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-70">{bag.color} Warehouse Bag</span>
                        </div>
                        <CardContent className="p-6 text-black">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Inventory Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", totalItems > 0 ? "bg-blue-500" : "bg-gray-300")} />
                                        <span className="text-sm font-bold capitalize">{totalItems > 0 ? `${totalItems} Items Packed` : 'Empty'}</span>
                                    </div>
                                </div>
                                {orderAssignments.length > 0 && (
                                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                                            <Info className="h-3 w-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Order Assignment</p>
                                        </div>
                                        <Link href={`/admin/orders/${orderAssignments[0].order_id}`} className="text-xs font-bold hover:underline block truncate">
                                            Order #{orderAssignments[0].order_id.slice(0, 8)}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-200 font-bold uppercase tracking-widest text-[10px]">
                        Print Bag Label
                    </Button>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-gray-200 shadow-xl overflow-hidden min-h-[400px]">
                        <CardHeader className="bg-gray-50/50 border-b p-8">
                            <CardTitle className="text-xl font-serif">Manifest Contents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {totalItems === 0 ? (
                                <div className="p-24 text-center text-gray-400">
                                    <Package className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                    <p className="font-medium">This bag is currently empty.</p>
                                    <p className="text-xs mt-1">Add items from the catalog or assign it to an order.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {/* Order-specific items */}
                                    {orderAssignments.map((assignment) => (
                                        <div key={assignment.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                                    <ClipboardList className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{assignment.order_items?.products?.name || 'Unknown Item'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">Order</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mr-1">Qty:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={assignment.quantity}
                                                                onChange={(e) => updateOrderAssignmentQuantity(assignment.id, parseInt(e.target.value) || 1)}
                                                                className="w-12 h-6 bg-transparent border-b border-gray-200 text-[10px] font-bold text-center focus:outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOrderAssignment(assignment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* General catalog items */}
                                    {catalogItems.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                                    <Package className="h-6 w-6 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{item.products?.name || 'Unknown Item'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">Catalog</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mr-1">Qty:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateCatalogItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                className="w-12 h-6 bg-transparent border-b border-gray-200 text-[10px] font-bold text-center focus:outline-none focus:border-amber-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeCatalogItem(item.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
