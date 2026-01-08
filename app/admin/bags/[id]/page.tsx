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
                    <Card className="rounded-[2rem] border-[var(--dashboard-border)] shadow-xl overflow-hidden bg-[var(--dashboard-card)] text-[var(--dashboard-text)]">
                        <div className={cn(
                            "h-48 flex flex-col items-center justify-center gap-2 relative overflow-hidden",
                            bag.color.toLowerCase() === 'black' ? 'bg-black' :
                                bag.color.toLowerCase() === 'white' ? 'bg-white text-black' : `bg-${bag.color.toLowerCase()}-500`
                        )} style={{
                            backgroundColor: bag.color.toLowerCase() === 'black' ? '#111' : (bag.color.toLowerCase() === 'white' ? '#fff' : bag.color.toLowerCase()),
                            color: bag.color.toLowerCase() === 'white' ? '#000' : '#fff'
                        }}>
                            {/* Glossy overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-50" />
                            <span className="text-6xl font-black tracking-tighter relative z-10">{bag.number}</span>
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-70 relative z-10">{bag.color} Warehouse Bag</span>
                        </div>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] mb-3">Inventory Status</p>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-3 w-3 rounded-full animate-pulse", totalItems > 0 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-gray-600")} />
                                        <span className="text-sm font-bold tracking-tight">{totalItems > 0 ? `${totalItems} Items Packed` : 'Empty'}</span>
                                    </div>
                                </div>
                                {orderAssignments.length > 0 && (
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                                            <Info className="h-3.5 w-3.5" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Order Assignment</p>
                                        </div>
                                        <Link href={`/admin/orders/${orderAssignments[0].order_id}`} className="text-xs font-bold hover:underline block truncate text-blue-300">
                                            Order #{orderAssignments[0].order_id.slice(0, 8)}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full rounded-2xl h-14 border-[var(--dashboard-border)] bg-[var(--dashboard-card)] font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold hover:text-black transition-all shadow-lg">
                        Print Bag Label
                    </Button>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-2xl overflow-hidden min-h-[500px]">
                        <CardHeader className="bg-white/5 border-b border-[var(--dashboard-border)] p-8">
                            <CardTitle className="text-2xl font-serif text-[var(--dashboard-text)]">Manifest Contents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {totalItems === 0 ? (
                                <div className="p-32 text-center text-[var(--dashboard-text-muted)]">
                                    <Package className="h-20 w-20 mx-auto mb-6 opacity-20" />
                                    <p className="text-lg font-light">This bag is currently empty.</p>
                                    <p className="text-[10px] mt-2 uppercase tracking-[0.2em] font-bold opacity-50">Add items from the catalog or assign it to an order.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--dashboard-border)]">
                                    {/* Order-specific items */}
                                    {orderAssignments.map((assignment) => (
                                        <div key={assignment.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                                    <ClipboardList className="h-7 w-7 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg tracking-tight text-[var(--dashboard-text)] mb-1">
                                                        {assignment.order_items?.products?.name || 'Unknown Item'}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Order</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-widest">Quantity:</span>
                                                            <div className="flex items-center gap-1 bg-black/20 rounded-lg border border-[var(--dashboard-border)] px-1">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={assignment.quantity}
                                                                    onChange={(e) => updateOrderAssignmentQuantity(assignment.id, parseInt(e.target.value) || 1)}
                                                                    className="w-10 h-8 bg-transparent text-[11px] font-black text-center focus:outline-none text-[var(--dashboard-text)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOrderAssignment(assignment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-all text-[var(--dashboard-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-2xl h-12 w-12"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* General catalog items */}
                                    {catalogItems.map((item) => (
                                        <div key={item.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-[1.25rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                                                    <Package className="h-7 w-7 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg tracking-tight text-[var(--dashboard-text)] mb-1">
                                                        {item.products?.name || 'Unknown Item'}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Catalog</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-widest">Quantity:</span>
                                                            <div className="flex items-center gap-1 bg-black/20 rounded-lg border border-[var(--dashboard-border)] px-1">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateCatalogItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                    className="w-10 h-8 bg-transparent text-[11px] font-black text-center focus:outline-none text-[var(--dashboard-text)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeCatalogItem(item.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-all text-[var(--dashboard-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-2xl h-12 w-12"
                                            >
                                                <Trash2 className="h-5 w-5" />
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
