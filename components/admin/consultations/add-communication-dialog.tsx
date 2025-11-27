'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Phone, Mail, MessageSquare, FileText } from 'lucide-react'
import { addCommunication } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'

export type CommunicationType = 'call' | 'email' | 'text' | 'note'

interface AddCommunicationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    consultationId: string
}

export function AddCommunicationDialog({
    open,
    onOpenChange,
    consultationId,
}: AddCommunicationDialogProps) {
    const [type, setType] = useState<CommunicationType>('note')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const typeOptions: { value: CommunicationType; label: string; icon: typeof Phone }[] = [
        { value: 'call', label: 'Call', icon: Phone },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'text', label: 'Text', icon: MessageSquare },
        { value: 'note', label: 'Note', icon: FileText },
    ]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        
        if (!content.trim()) {
            toast.error('Please enter communication content')
            return
        }

        setIsSubmitting(true)
        try {
            await addCommunication(consultationId, type, content.trim())
            toast.success('Communication added successfully')
            setContent('')
            setType('note')
            onOpenChange(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add communication')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Communication</DialogTitle>
                        <DialogDescription>
                            Log a call, email, text message, or internal note for this consultation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={type} onValueChange={(value) => setType(value as CommunicationType)}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Enter notes, summary, or details about this communication..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Communication'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

