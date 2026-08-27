'use client'

import { useState, useTransition } from 'react'
import { bookShowroomAppointment, cancelOwnAppointment } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

type Appointment = {
  id: string
  appointment_date: string
  appointment_time: string
  location: string | null
  notes: string | null
  status: string
}

export function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await bookShowroomAppointment({
        appointmentDate: date,
        appointmentTime: time,
        notes,
      })
      if (!result.success) {
        toast.error(result.error || 'Could not book appointment')
        return
      }
      toast.success('Showroom appointment requested')
      setNotes('')
      router.refresh()
    })
  }

  const cancel = (id: string) => {
    startTransition(async () => {
      const result = await cancelOwnAppointment(id)
      if (!result.success) {
        toast.error(result.error || 'Could not cancel')
        return
      }
      toast.success('Appointment cancelled')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <Card className="border-border/60 bg-white/80">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-light">Book a showroom visit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Preferred time</Label>
              <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Event date, style direction, or pieces you want to see"
              />
            </div>
            <Button type="submit" disabled={pending} className="rounded-full">
              {pending ? 'Submitting...' : 'Request appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-serif text-xl font-light">Your appointments</h2>
        {!appointments.length ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              No appointments yet.
            </CardContent>
          </Card>
        ) : (
          appointments.map((appt) => (
            <Card key={appt.id} className="border-border/60 bg-white/80">
              <CardContent className="flex items-start justify-between gap-4 py-5">
                <div className="space-y-1">
                  <p className="font-medium">
                    {format(new Date(appt.appointment_date), 'PPP')} · {appt.appointment_time}
                  </p>
                  <p className="text-sm text-muted-foreground">{appt.location || 'Showroom'}</p>
                  {appt.notes && <p className="text-sm text-muted-foreground">{appt.notes}</p>}
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{appt.status}</p>
                </div>
                {appt.status === 'scheduled' && (
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => cancel(appt.id)}>
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
