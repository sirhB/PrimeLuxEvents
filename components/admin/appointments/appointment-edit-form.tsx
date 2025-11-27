'use client'

import { useState } from 'react'
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
import { updateAppointment } from '@/app/admin/appointments/actions'
import { toast } from 'sonner'

interface Appointment {
    id: string
    client_name: string | null
    client_email: string | null
    client_phone: string | null
    appointment_date: string
    appointment_time: string
    location: string | null
    notes: string | null
    status: string
}

interface AppointmentEditFormProps {
    appointment: Appointment
}

export function AppointmentEditForm({ appointment }: AppointmentEditFormProps) {
    const [clientName, setClientName] = useState(appointment.client_name || '')
    const [clientEmail, setClientEmail] = useState(appointment.client_email || '')
    const [clientPhone, setClientPhone] = useState(appointment.client_phone || '')
    const [date, setDate] = useState<Date | undefined>(
        appointment.appointment_date ? new Date(appointment.appointment_date) : undefined
    )
    const [time, setTime] = useState(appointment.appointment_time || '')
    const [location, setLocation] = useState(appointment.location || '')
    const [notes, setNotes] = useState(appointment.notes || '')
    const [status, setStatus] = useState(appointment.status)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            await updateAppointment(appointment.id, {
                clientName: clientName.trim(),
                clientEmail: clientEmail.trim() || null,
                clientPhone: clientPhone.trim() || null,
                appointmentDate: format(date, 'yyyy-MM-dd'),
                appointmentTime: time.trim(),
                location: location.trim() || null,
                notes: notes.trim() || null,
                status: status as 'scheduled' | 'completed' | 'cancelled',
            })
            toast.success('Appointment updated successfully')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update appointment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Appointment'}
            </Button>
        </form>
    )
}

