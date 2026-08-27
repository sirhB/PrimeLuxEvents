import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, Utensils, User, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { formatCents, formatCentsWithCommas } from '@/lib/format-money'
import { ConsultationQuickActions } from '@/components/admin/consultations/consultation-quick-actions'
import { CommunicationLog, type Communication } from '@/components/admin/consultations/communication-log'
import { format } from 'date-fns'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: consultation } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single()

    if (!consultation) {
        notFound()
    }

    // Fetch communications
    const { data: communications } = await supabase
        .from('consultation_communications')
        .select('*')
        .eq('consultation_id', id)
        .order('created_at', { ascending: false })

    // Fetch linked appointment
    const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('consultation_id', id)
        .single()

    async function updateStatus(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const status = formData.get('status') as string
        const supabase = await createClient()
        await supabase.from('consultations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
        revalidatePath(`/admin/consultations/${id}`)
    }

    const getDisplayName = () => {
        if (consultation.first_name && consultation.last_name) {
            return `${consultation.first_name} ${consultation.last_name}`
        }
        return consultation.customer_name || 'Unknown Customer'
    }

    const getStatusToken = (status: string) => {
        switch (status) {
            case 'new_request':
                return { label: 'New Request', color: 'bg-blue-100 text-blue-700 border-blue-200' }
            case 'pending_response':
                return { label: 'Pending Response', color: 'bg-amber-100 text-amber-700 border-amber-200' }
            case 'appointment_confirmed':
                return { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
            case 'completed':
                return { label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200' }
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800 border-border' }
        }
    }

    const token = getStatusToken(consultation.status)

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Leads', href: '/admin/consultations' }, { label: getDisplayName() }]}
                title={getDisplayName()}
                description={`ID: ${consultation.id.slice(0, 8)} · ${new Date(consultation.created_at).toLocaleDateString()}`}
                eyebrow={token.label}
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-md" asChild>
                            <Link href="/admin/consultations">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <ConsultationQuickActions
                            consultationId={consultation.id}
                            customerName={getDisplayName()}
                            customerEmail={consultation.customer_email}
                            customerPhone={consultation.customer_phone}
                        />
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN - MAIN INFO */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Information */}
                    <Card className="bg-[var(--dashboard-card-bg)] border shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid sm:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                                <p className="text-base font-medium">{getDisplayName()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                                <a href={`mailto:${consultation.customer_email}`} className="text-base hover:text-primary transition-colors">
                                    {consultation.customer_email || '—'}
                                </a>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                                <p className="text-base">{consultation.customer_phone || '—'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Details */}
                    <Card className="bg-[var(--dashboard-card-bg)] border shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Event Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                            <div className="grid sm:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
                                    <p className="text-base font-medium">
                                        {consultation.event_date
                                            ? new Date(consultation.event_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                            : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Guests</h4>
                                    <p className="text-base">{consultation.number_of_guests || '—'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget</h4>
                                    <p className="text-base capitalize">{consultation.budget_range?.replace('-', ' - $') || '—'}</p>
                                </div>
                            </div>

                            {/* Message */}
                            {consultation.message && (
                                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Message</h4>
                                    <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--dashboard-text)]">
                                        {consultation.message}
                                    </p>
                                </div>
                            )}

                            <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Venue</span>
                                    <div className="flex items-center gap-2">
                                        {consultation.has_venue ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/30"></span>}
                                        <span className="text-sm">{consultation.has_venue ? 'Secured' : 'Needed'}</span>
                                    </div>
                                    {consultation.venue_name && <p className="text-xs text-muted-foreground mt-1 ml-6">{consultation.venue_name}</p>}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Caterer</span>
                                    <div className="flex items-center gap-2">
                                        {consultation.has_caterer ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/30"></span>}
                                        <span className="text-sm">{consultation.has_caterer ? 'Secured' : 'Needed'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Planner</span>
                                    <div className="flex items-center gap-2">
                                        {consultation.has_planner ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/30"></span>}
                                        <span className="text-sm">{consultation.has_planner ? 'Secured' : 'Needed'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Communication Log */}
                    <CommunicationLog communications={(communications || []) as Communication[]} />
                </div>

                {/* RIGHT COLUMN - SIDEBAR */}
                <div className="space-y-6">

                    {/* Pricing Card */}
                    <Card className="bg-[var(--dashboard-card-bg)] border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {consultation.total_amount ? (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCentsWithCommas(consultation.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Fees</span>
                                        <span>{formatCentsWithCommas((consultation.delivery_fee || 0) + (consultation.setup_fee || 0))}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                        <span>Total</span>
                                        <span>{formatCentsWithCommas(consultation.total_amount)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm italic">
                                    No quote generated yet.
                                </div>
                            )}
                            <Button className="w-full" variant="outline">Generate Quote</Button>
                        </CardContent>
                    </Card>

                    {/* Status Management */}
                    <Card className="bg-[var(--dashboard-card-bg)] border shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form action={updateStatus} className="space-y-3">
                                <input type="hidden" name="id" value={consultation.id} />
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Current Status</label>
                                    <select
                                        name="status"
                                        defaultValue={consultation.status}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="new_request">New Request</option>
                                        <option value="pending_response">Pending Response</option>
                                        <option value="appointment_confirmed">Appointment Confirmed</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full">Update Status</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Linked Appointment */}
                    {appointment && (
                        <Card className="bg-blue-50/50 border-blue-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-blue-900 text-sm font-semibold uppercase tracking-wider">
                                    <CalendarCheck className="h-4 w-4" />
                                    Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-medium">
                                    {format(new Date(appointment.appointment_date), 'MMM d, yyyy')} • {appointment.appointment_time}
                                </p>
                                {appointment.location && (
                                    <p className="text-xs text-muted-foreground truncate">{appointment.location}</p>
                                )}
                                <Link href={`/admin/appointments/${appointment.id}`} className="block mt-2">
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-card text-blue-700 hover:text-blue-800 border-blue-200">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </AdminPage>
    )
}
