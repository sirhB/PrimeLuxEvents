import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminQRCode } from '@/components/admin/qr-code'
import { ShoppingBag, Package, Loader2, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { BagFormDialog } from '@/components/admin/bag-form-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White']

export default function BagsPage() {
    const [bags, setBags] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [isBagDialogOpen, setIsBagDialogOpen] = useState(false)
    const [selectedBag, setSelectedBag] = useState<any>(null)
    const supabase = createClient()

    const fetchBags = useCallback(async () => {
        setLoading(true)
        let query = supabase.from('warehouse_bags').select('*').order('color').order('number')

        if (selectedColor) {
            query = query.eq('color', selectedColor)
        }

        const { data } = await query
        if (data) setBags(data)
        setLoading(false)
    }, [selectedColor, supabase])

    useEffect(() => {
        fetchBags()
    }, [fetchBags])

    const handleDeleteBag = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bag? All assignments and catalog items will be removed.')) return

        try {
            const { error } = await supabase.from('warehouse_bags').delete().eq('id', id)
            if (error) throw error
            toast.success('Bag deleted successfully')
            fetchBags()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const openEditDialog = (bag: any) => {
        setSelectedBag(bag)
        setIsBagDialogOpen(true)
    }

    const openCreateDialog = () => {
        setSelectedBag(null)
        setIsBagDialogOpen(true)
    }

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
                    <Button
                        className="rounded-xl bg-black text-white hover:bg-gold hover:text-black"
                        onClick={openCreateDialog}
                    >
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
                        <div className={cn("w-2 h-2 rounded-full mr-2")}
                            style={{ backgroundColor: color.toLowerCase() === 'white' ? '#eee' : color.toLowerCase() }} />
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
                        <Card key={bag.id} className="rounded-[2rem] border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl w-40">
                                        <DropdownMenuItem onClick={() => openEditDialog(bag)} className="gap-2 cursor-pointer font-bold text-xs uppercase tracking-widest">
                                            <Edit2 className="h-3 w-3" />
                                            Edit Bag
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteBag(bag.id)} className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-bold text-xs uppercase tracking-widest">
                                            <Trash2 className="h-3 w-3" />
                                            Delete Bag
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Link href={`/admin/bags/${bag.id}`} className="block h-full">
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
                                        <div className="text-[10px] text-blue-600 font-bold">
                                            Linked to Order
                                        </div>
                                    )}
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            <BagFormDialog
                open={isBagDialogOpen}
                onOpenChange={setIsBagDialogOpen}
                bag={selectedBag}
                onSuccess={fetchBags}
            />
        </div>
    )
}
