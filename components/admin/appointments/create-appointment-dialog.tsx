'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createAppointment, type CreateAppointmentData } from '@/app/admin/appointments/actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface CreateAppointmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialConsultationId?: string | null
}

export function CreateAppointmentDialog({
    open,
    onOpenChange,
    initialConsultationId,
}: CreateAppointmentDialogProps) {
    const [consultationId, setConsultationId] = useState<string | null>(initialConsultationId || null)
    const [consultations, setConsultations] = useState<Array<{ id: string; customer_name: string | null }>>([])
    const [clientName, setClientName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState('')
    const [location, setLocation] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingConsultations, setLoadingConsultations] = useState(false)

    useEffect(() => {
        if (open) {
            loadConsultations()
        }
    }, [open])

    useEffect(() => {
        if (consultationId && consultations.length > 0) {
            loadConsultationData(consultationId)
        } else {
            // Reset client info when no consultation selected
            if (!consultationId) {
                setClientName('')
                setClientEmail('')
                setClientPhone('')
            }
        }
    }, [consultationId, consultations])

    async function loadConsultations() {
        setLoadingConsultations(true)
        try {
            const supabase = createClient()
            const { data } = await supabase
                .from('consultations')
                .select('id, customer_name')
                .order('created_at', { ascending: false })
                .limit(100)
            setConsultations(data || [])
        } catch (error) {
            console.error('Failed to load consultations:', error)
        } finally {
            setLoadingConsultations(false)
        }
    }

    async function loadConsultationData(id: string) {
        try {
            const supabase = createClient()
            const { data } = await supabase
                .from('consultations')
                .select('customer_name, customer_email, customer_phone')
                .eq('id', id)
                .single()

            if (data) {
                setClientName(data.customer_name || '')
                setClientEmail(data.customer_email || '')
                setClientPhone(data.customer_phone || '')
            }
        } catch (error) {
            console.error('Failed to load consultation data:', error)
        }
    }

    function handleReset() {
        setConsultationId(initialConsultationId || null)
        setClientName('')
        setClientEmail('')
        setClientPhone('')
        setDate(undefined)
        setTime('')
        setLocation('')
        setNotes('')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!clientName.trim()) {
            toast.error('Client name is required')
            return
        }

        if (!date) {
            toast.error('Please select a date')
            return
        }

        if (!time.trim()) {
            toast.error('Please enter a time')
            return
        }

        setIsSubmitting(true)
        try {
            const appointmentData: CreateAppointmentData = {
                consultationId: consultationId || null,
                clientName: clientName.trim(),
                clientEmail: clientEmail.trim() || null,
                clientPhone: clientPhone.trim() || null,
                appointmentDate: format(date, 'yyyy-MM-dd'),
                appointmentTime: time.trim(),
                location: location.trim() || null,
                notes: notes.trim() || null,
            }

            await createAppointment(appointmentData)
            toast.success('Appointment created successfully')
            handleReset()
            onOpenChange(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create appointment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Appointment</DialogTitle>
                        <DialogDescription>
                            Schedule a new appointment. You can link it to a consultation or create it standalone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="consultation">Link to Consultation (Optional)</Label>
                            <Select
                                value={consultationId || 'none'}
                                onValueChange={(value) => setConsultationId(value === 'none' ? null : value)}
                                disabled={loadingConsultations}
                            >
                                <SelectTrigger id="consultation">
                                    <SelectValue placeholder="Select a consultation or leave empty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Standalone Appointment)</SelectItem>
                                    {consultations.map((consultation) => (
                                        <SelectItem key={consultation.id} value={consultation.id}>
                                            {consultation.customer_name || 'Unnamed Consultation'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name *</Label>
                            <Input
                                id="clientName"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                required
                                disabled={!!consultationId}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                disabled={!!consultationId}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientPhone">Client Phone</Label>
                            <Input
                                id="clientPhone"
                                type="tel"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                disabled={!!consultationId}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time *</Label>
                            <Input
                                id="time"
                                placeholder="e.g., 2:00 PM"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Office, Client Venue"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Preparation notes or special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                handleReset()
                                onOpenChange(false)
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Appointment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

