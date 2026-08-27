import { createClient } from '@/lib/supabase/server'
import { AppointmentsClient } from '@/components/account/appointments-client'
import { sanitizePostgrestFilterValue } from '@/lib/supabase/filter-sanitize'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const email = sanitizePostgrestFilterValue(user.email || '', 200)
  const orParts = [`user_id.eq.${user.id}`]
  if (email) orParts.push(`client_email.ilike.${email}`)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, location, notes, status')
    .or(orParts.join(','))
    .order('appointment_date', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-light tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Book a showroom viewing and manage upcoming visits.</p>
      </div>
      <AppointmentsClient appointments={appointments || []} />
    </div>
  )
}
