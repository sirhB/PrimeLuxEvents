'use client'

import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateCustomer } from '@/app/admin/customers/actions'

interface EditCustomerSheetProps {
    customer: {
        email: string
        name: string
        phone?: string
    } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditCustomerSheet({ customer, open, onOpenChange }: EditCustomerSheetProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(customer?.name || '')
    const [phone, setPhone] = useState(customer?.phone || '')

    // Reset state when customer changes
    if (customer && name !== customer.name && !isLoading) setName(customer.name)
    if (customer && phone !== customer.phone && !isLoading) setPhone(customer.phone || '')

    const handleSave = async () => {
        if (!customer) return
        setIsLoading(true)

        try {
            await updateCustomer(customer.email, { name, phone })
            toast.success('Customer updated (if profile exists)')
            onOpenChange(false)
        } catch (error) {
            toast.error('Failed to update customer')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] bg-[#1A1A1A] border-l border-white/10 text-white">
                <SheetHeader>
                    <SheetTitle className="font-serif text-2xl">Edit Customer</SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Make changes to customer profile.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-8">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</Label>
                        <Input value={customer?.email || ''} disabled className="bg-white/5 border-white/10 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400">Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-[var(--dashboard-accent-gold)] text-black font-bold">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
