'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Discount {
    id: string
    name: string
    min_cart_total: number
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    is_active: boolean
}

export function EditDiscountDialog({ discount }: { discount: Discount }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(discount.name)
    const [threshold, setThreshold] = useState((discount.min_cart_total / 100).toString())
    const [type, setType] = useState(discount.discount_type)
    const [value, setValue] = useState(
        discount.discount_type === 'fixed'
            ? (discount.discount_value / 100).toString()
            : discount.discount_value.toString()
    )
    const router = useRouter()

    const handleUpdate = async () => {
        if (!name || !threshold || !value) return

        setIsLoading(true)
        const supabase = createClient()

        // Convert logic
        const minCartTotal = parseFloat(threshold) * 100 // to cents
        let discountValue = parseFloat(value)
        if (type === 'fixed') {
            discountValue = discountValue * 100 // to cents for fixed
        }

        try {
            const { error } = await supabase
                .from('tiered_discounts')
                .update({
                    name,
                    min_cart_total: minCartTotal,
                    discount_type: type,
                    discount_value: discountValue,
                })
                .eq('id', discount.id)

            if (error) throw error

            toast.success('Discount tier updated')
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Failed to update discount')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1A1A1A] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Edit Discount Tier</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Modify spending threshold and reward.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Campaign Name</Label>
                        <Input
                            placeholder="e.g. Bronze Tier, $1000+ Spend"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Min. Cart Total ($)</Label>
                        <Input
                            type="number"
                            placeholder="1000"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</Label>
                            <Select value={type} onValueChange={(val) => setType(val as 'percentage' | 'fixed')}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                    <SelectItem value="percentage">Percent (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Value</Label>
                            <Input
                                type="number"
                                placeholder={type === 'percentage' ? "5" : "50"}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400">Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isLoading} className="bg-[var(--dashboard-accent-gold)] text-black">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
