'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White']

interface BagFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bag?: any
    onSuccess: () => void
}

export function BagFormDialog({ open, onOpenChange, bag, onSuccess }: BagFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [color, setColor] = useState('Red')
    const [number, setNumber] = useState('')
    const supabase = createClient()

    useEffect(() => {
        if (bag) {
            setColor(bag.color)
            setNumber(bag.number.toString())
        } else {
            setColor('Red')
            setNumber('')
        }
    }, [bag, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!number) return toast.error('Bag number is required')

        setLoading(true)
        try {
            if (bag) {
                const { error } = await supabase
                    .from('warehouse_bags')
                    .update({ color, number })
                    .eq('id', bag.id)
                if (error) throw error
                toast.success('Bag updated successfully')
            } else {
                const { error } = await supabase
                    .from('warehouse_bags')
                    .insert({ color, number })
                if (error) throw error
                toast.success('Bag created successfully')
            }
            onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {bag ? 'Edit Bag' : 'Add New Bag'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="color">Bag Color</Label>
                        <Select value={color} onValueChange={setColor}>
                            <SelectTrigger id="color" className="rounded-xl h-12">
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {COLORS.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.toLowerCase() === 'white' ? '#eee' : c.toLowerCase() }}
                                            />
                                            {c}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Bag Number / ID</Label>
                        <Input
                            id="number"
                            placeholder="e.g. 1, A-101, RED-1"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="rounded-xl h-12"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-12 px-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl h-12 px-8 bg-black text-white hover:bg-gold hover:text-black"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {bag ? 'Save Changes' : 'Create Bag'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
