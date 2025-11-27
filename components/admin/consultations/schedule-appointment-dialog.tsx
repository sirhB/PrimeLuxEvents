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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { scheduleAppointment } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'

interface ScheduleAppointmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    consultationId: string
    clientName: string
    clientEmail?: string | null
    clientPhone?: string | null
}

export function ScheduleAppointmentDialog({
    open,
    onOpenChange,
    consultationId,
    clientName,
    clientEmail,
    clientPhone,
}: ScheduleAppointmentDialogProps) {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState('')
    const [location, setLocation] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

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
            const appointmentDate = format(date, 'yyyy-MM-dd')
            await scheduleAppointment(consultationId, appointmentDate, time.trim(), location.trim(), notes.trim() || undefined)
            toast.success('Appointment scheduled successfully')
            setDate(undefined)
            setTime('')
            setLocation('')
            setNotes('')
            onOpenChange(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to schedule appointment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Schedule Appointment</DialogTitle>
                        <DialogDescription>
                            Schedule an in-person meeting with {clientName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
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
                            <Label htmlFor="time">Time</Label>
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
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

