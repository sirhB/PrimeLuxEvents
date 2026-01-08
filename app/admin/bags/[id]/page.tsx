'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, ShoppingBag, Truck, ClipboardList, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function BagDetailPage() {
    const { id } = useParams()
    const [bag, setBag] = useState<any>(null)
    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchBagData() {
            setLoading(true)
            const [bagRes, assignmentsRes] = await Promise.all([
                supabase.from('warehouse_bags').select('*').eq('id', id).single(),
                supabase.from('bag_assignments').select('*, order_items(*, products(name))').eq('bag_id', id)
            ])

            if (bagRes.data) setBag(bagRes.data)
            if (assignmentsRes.data) setAssignments(assignmentsRes.data)
            setLoading(false)
        }
        fetchBagData()
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Retrieving bag manifest...</p>
            </div>
        )
    }

    if (!bag) return <div>Bag not found.</div>

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
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

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-gray-200 shadow-sm overflow-hidden">
                        <div className={cn(
                            "h-32 flex items-center justify-center text-4xl font-bold tracking-tighter text-white",
                            bag.color.toLowerCase() === 'black' ? 'bg-black' : `bg-${bag.color.toLowerCase()}-500`
                        )} style={{ backgroundColor: bag.color.toLowerCase() === 'black' ? '#000' : bag.color.toLowerCase() }}>
                            {bag.number}
                        </div>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", assignments.length > 0 ? "bg-blue-500" : "bg-gray-300")} />
                                        <span className="text-sm font-bold capitalize">{assignments.length > 0 ? 'Packed' : 'Empty'}</span>
                                    </div>
                                </div>
                                {assignments.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Destination Order</p>
                                        <Link href={`/admin/orders/${assignments[0].order_id}`} className="text-sm font-bold text-blue-600 hover:underline">
                                            #{assignments[0].order_id.slice(0, 8)}...
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button className="w-full rounded-2xl h-12 bg-black text-white hover:bg-gold hover:text-black font-bold">
                        Print Label
                    </Button>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-gray-200 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b p-8">
                            <CardTitle className="text-xl font-serif">Contents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {assignments.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>This bag is currently empty.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {assignments.map((assignment) => (
                                        <div key={assignment.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <ClipboardList className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{assignment.order_items?.products?.name || 'Unknown Item'}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Quantity: {assignment.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {assignments.length > 0 && (
                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 border-gray-200">
                                <Truck className="h-4 w-4 mr-2" />
                                Mark as Shipped
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 border-gray-200 text-red-600 hover:border-red-200 hover:bg-red-50">
                                Empty Bag
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
