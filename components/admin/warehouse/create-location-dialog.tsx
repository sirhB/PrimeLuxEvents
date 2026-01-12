'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CreateLocationDialogProps {
    onSuccess?: () => void
}

export function CreateLocationDialog({ onSuccess }: CreateLocationDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState('shelf')
    const router = useRouter()

    const handleCreate = async () => {
        if (!name.trim()) return

        setIsLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('warehouse_locations')
                .insert({
                    name: name.trim(),
                    type,
                })

            if (error) throw error

            toast.success('Location created successfully')
            setOpen(false)
            setName('')
            setType('shelf')
            router.refresh()
            onSuccess?.()
        } catch (error) {
            console.error('Error creating location:', error)
            toast.error('Failed to create location')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                    <Plus className="mr-2 h-4 w-4" />
                    New Location
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1A1A1A] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add Location</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Create a new storage location in the warehouse.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-400">Location Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Shelf A-1, Bin 42"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="shelf">Shelf</SelectItem>
                                <SelectItem value="bin">Bin</SelectItem>
                                <SelectItem value="aisle">Aisle</SelectItem>
                                <SelectItem value="zone">Zone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading || !name.trim()}
                        className="bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Location
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
