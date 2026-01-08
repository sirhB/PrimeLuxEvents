'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminQRCode } from '@/components/admin/qr-code'
import { ShoppingBag, ChevronRight, Package, Loader2, Filter, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White']

export default function BagsPage() {
    const [bags, setBags] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchBags() {
            setLoading(true)
            let query = supabase.from('warehouse_bags').select('*').order('color').order('number')

            if (selectedColor) {
                query = query.eq('color', selectedColor)
            }

            const { data } = await query
            if (data) setBags(data)
            setLoading(false)
        }
        fetchBags()
    }, [selectedColor])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'empty': return 'bg-gray-100 text-gray-500 border-gray-200'
            case 'packed': return 'bg-blue-50 text-blue-600 border-blue-200'
            case 'shipped': return 'bg-amber-50 text-amber-600 border-amber-200'
            case 'returned': return 'bg-green-50 text-green-600 border-green-200'
            default: return 'bg-gray-100 text-gray-500'
        }
    }

    const getBagColorClass = (color: string) => {
        switch (color.toLowerCase()) {
            case 'red': return 'border-red-500 bg-red-50 text-red-700'
            case 'blue': return 'border-blue-500 bg-blue-50 text-blue-700'
            case 'green': return 'border-green-500 bg-green-50 text-green-700'
            case 'yellow': return 'border-yellow-500 bg-yellow-50 text-yellow-700'
            case 'black': return 'border-gray-900 bg-gray-900 text-white'
            case 'white': return 'border-gray-200 bg-white text-gray-900'
            default: return 'border-gray-200 text-gray-500'
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-light tracking-tight">Warehouse Bags</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest font-bold text-xs">Inventory & Logistics Tags</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
                        <Package className="h-4 w-4 mr-2" />
                        Bulk Print QR
                    </Button>
                    <Button className="rounded-xl bg-black text-white hover:bg-gold hover:text-black">
                        Add New Bag
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                    variant={selectedColor === null ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedColor(null)}
                    className="rounded-full px-6"
                >
                    All
                </Button>
                {COLORS.map(color => (
                    <Button
                        key={color}
                        variant={selectedColor === color ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                        className="rounded-full px-6"
                    >
                        <div className={cn("w-2 h-2 rounded-full mr-2", `bg-${color.toLowerCase()}-500`)}
                            style={{ backgroundColor: color.toLowerCase() }} />
                        {color}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Loading bags...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {bags.map((bag) => (
                        <Card key={bag.id} className="rounded-[2rem] border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                            <div className={cn("p-4 border-b text-center font-bold tracking-tighter text-xl", getBagColorClass(bag.color))}>
                                {bag.color} {bag.number}
                            </div>
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                <AdminQRCode
                                    url={`/admin/bags/${bag.id}`}
                                    label={`BAG-${bag.color}-${bag.number}`}
                                />
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                    getStatusColor(bag.status)
                                )}>
                                    {bag.status}
                                </div>
                                {bag.last_order_id && (
                                    <Link href={`/admin/orders/${bag.last_order_id}`} className="text-[10px] text-blue-600 font-bold hover:underline">
                                        View Order
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
import Link from 'next/link'
