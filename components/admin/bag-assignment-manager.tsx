'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Plus, Package, X, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface BagAssignmentManagerProps {
    orderId: string
    orderItems: any[]
}

export function BagAssignmentManager({ orderId, orderItems }: BagAssignmentManagerProps) {
    const [bags, setBags] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [bagsRes, assignmentsRes] = await Promise.all([
                supabase.from('warehouse_bags').select('*').order('color').order('number'),
                supabase.from('bag_assignments').select('*').eq('order_id', orderId)
            ])

            if (bagsRes.data) setBags(bagsRes.data)
            if (assignmentsRes.data) setAssignments(assignmentsRes.data)
            setLoading(false)
        }
        fetchData()
    }, [orderId])

    const assignToBag = async (itemId: string, bagId: string) => {
        setIsSaving(true)
        try {
            const { data, error } = await supabase
                .from('bag_assignments')
                .insert({
                    order_id: orderId,
                    item_id: itemId,
                    bag_id: bagId,
                    quantity: 1 // Default to 1 for now
                })
                .select()
                .single()

            if (error) throw error
            setAssignments([...assignments, data])
            toast.success('Item assigned to bag')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const removeAssignment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('bag_assignments')
                .delete()
                .eq('id', id)

            if (error) throw error
            setAssignments(assignments.filter(a => a.id !== id))
            toast.success('Assignment removed')
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Bag Assignments</h3>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider">
                            <Plus className="h-3 w-3 mr-1" />
                            Assign Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">Pack into Bags</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            {orderItems.map((item) => {
                                const itemAssignments = assignments.filter(a => a.item_id === item.id)
                                return (
                                    <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm tracking-tight">{item.products?.name || item.name}</p>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {itemAssignments.map(a => {
                                                const bag = bags.find(b => b.id === a.bag_id)
                                                return (
                                                    <div key={a.id} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 text-[10px] font-bold">
                                                        <span className="text-blue-600">{bag?.color} {bag?.number}</span>
                                                        <button onClick={() => removeAssignment(a.id)} className="text-gray-400 hover:text-red-500">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="pt-2 border-t border-gray-200/50">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Available Bags</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {bags.filter(b => b.status === 'empty' || b.last_order_id === orderId).slice(0, 12).map(bag => (
                                                    <button
                                                        key={bag.id}
                                                        disabled={isSaving}
                                                        onClick={() => assignToBag(item.id, bag.id)}
                                                        className="h-10 rounded-lg border border-gray-200 flex items-center justify-center text-[10px] font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50"
                                                        style={{ color: bag.color.toLowerCase() === 'white' ? 'black' : bag.color.toLowerCase() }}
                                                    >
                                                        {bag.number}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {assignments.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                    <Package className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No items assigned to bags yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignments.reduce((acc, curr) => {
                        const bag = bags.find(b => b.id === curr.bag_id)
                        if (!bag) return acc
                        const key = `${bag.color} ${bag.number}`
                        if (!acc[key]) acc[key] = { bag, items: [] }
                        const item = orderItems.find(i => i.id === curr.item_id)
                        acc[key].items.push(item?.products?.name || 'Unknown')
                        return acc
                    }, {} as any) && Object.entries(assignments.reduce((acc: any, curr: any) => {
                        const bag = bags.find(b => b.id === curr.bag_id)
                        if (!bag) return acc
                        const key = `${bag.color} ${bag.number}`
                        if (!acc[key]) acc[key] = { bag, items: [] }
                        const item = orderItems.find(i => i.id === curr.item_id)
                        acc[key].items.push(item?.products?.name || 'Unknown')
                        return acc
                    }, {})).map(([key, data]: any) => (
                        <div key={key} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ color: data.bag.color.toLowerCase() === 'white' ? 'black' : data.bag.color.toLowerCase() }}>
                                {data.bag.number}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{data.bag.color} Bag</p>
                                <p className="text-xs font-medium truncate mt-1">
                                    {data.items.join(', ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
