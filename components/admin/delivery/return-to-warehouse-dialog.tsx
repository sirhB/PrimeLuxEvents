'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeftCircle, Warehouse } from 'lucide-react'

interface ReturnToWarehouseDialogProps {
    onSuccess?: () => void
}

const reasons = [
    { value: 'end_of_day', label: 'End of Day' },
    { value: 'reload', label: 'Reload Items' },
    { value: 'client_meeting', label: 'Client Meeting' },
    { value: 'vehicle_issue', label: 'Vehicle Issue' },
    { value: 'other', label: 'Other' }
]

export function ReturnToWarehouseDialog({ onSuccess }: ReturnToWarehouseDialogProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [notes, setNotes] = useState('')
    const [reloadItems, setReloadItems] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient()

        try {
            const description = reason === 'reload'
                ? `Reason: Reload Items\nItems needed: ${reloadItems}\nNotes: ${notes}`
                : `Reason: ${reasons.find(r => r.value === reason)?.label}\nNotes: ${notes}`

            const { error } = await supabase
                .from('tasks')
                .insert({
                    title: 'Return to Warehouse',
                    description: description,
                    status: 'pending',
                    priority: 'high',
                    task_type: 'return_trip',
                    assigned_to_text: 'Driver', // Should be current user
                    due_date: new Date().toISOString().split('T')[0],
                    created_by_text: 'driver' // Should be current user
                })

            if (error) throw error

            toast.success('Return trip added to route')
            setOpen(false)
            setReason('')
            setNotes('')
            setReloadItems('')
            onSuccess?.()
        } catch (error) {
            console.error('Error creating return task:', error)
            toast.error('Failed to add return trip')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Warehouse className="h-4 w-4 mr-2" />
                    Return to Warehouse
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Return to Warehouse</DialogTitle>
                    <DialogDescription>
                        Why are you returning to the warehouse?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select value={reason} onValueChange={setReason} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {reason === 'reload' && (
                        <div className="space-y-2">
                            <Label htmlFor="reloadItems">Which items do you need?</Label>
                            <Textarea
                                id="reloadItems"
                                value={reloadItems}
                                onChange={(e) => setReloadItems(e.target.value)}
                                placeholder="List items to reload..."
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any other details..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !reason}>
                            {loading ? 'Adding...' : 'Add to Route'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
