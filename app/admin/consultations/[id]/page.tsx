import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, Utensils, User, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { formatCents } from '@/lib/format-money'
import { ConsultationQuickActions } from '@/components/admin/consultations/consultation-quick-actions'
import { CommunicationLog, type Communication } from '@/components/admin/consultations/communication-log'
import { DeleteConsultationDialog } from '@/components/admin/consultations/delete-consultation-dialog'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new_request':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'pending_response':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'appointment_confirmed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new_request':
                return 'New Request'
            case 'pending_response':
                return 'Pending Client Response'
            case 'appointment_confirmed':
                return 'Appointment Confirmed'
            case 'completed':
                return 'Completed'
            default:
                return status
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/consultations">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Consultation Details</h1>
                    <p className="text-muted-foreground mt-1">
                        ID: {consultation.id.slice(0, 8)}...
                    </p>
                </div>
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border ${getStatusColor(consultation.status)}`}
                >
                    {getStatusLabel(consultation.status)}
                </span>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Contact client or manage this consultation</CardDescription>
                </CardHeader>
                <CardContent>
                    <ConsultationQuickActions
                        consultationId={consultation.id}
                        customerName={getDisplayName()}
                        customerEmail={consultation.customer_email}
                        customerPhone={consultation.customer_phone}
                    />
                    <div className="mt-4 pt-4 border-t">
                        <DeleteConsultationDialog
                            consultationId={consultation.id}
                            customerName={getDisplayName()}
                            trigger={
                                <Button variant="destructive" size="sm" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Consultation
                                </Button>
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-lg">
                                {consultation.first_name && consultation.last_name
                                    ? `${consultation.first_name} ${consultation.last_name}`
                                    : consultation.customer_name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{consultation.customer_email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p>{consultation.customer_phone || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Event Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                            <p className="text-lg">
                                {consultation.event_date
                                    ? new Date(consultation.event_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Number of Guests
                            </p>
                            <p>{consultation.number_of_guests || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Budget Range
                            </p>
                            <p className="capitalize">{consultation.budget_range?.replace('-', ' - $') || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Venue & Vendors */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Venue & Vendors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Venue</p>
                            <p className="font-medium">
                                {consultation.has_venue ? '✓ Yes' : '✗ No'}
                            </p>
                            {consultation.has_venue && consultation.venue_name && (
                                <p className="text-sm text-muted-foreground mt-1">{consultation.venue_name}</p>
                            )}
                            {consultation.venue_address && (
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                                    {consultation.venue_address}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Utensils className="h-4 w-4" />
                                Caterer
                            </p>
                            <p className="font-medium">
                                {consultation.has_caterer ? '✓ Yes' : '✗ No'}
                            </p>
                            {consultation.has_caterer && consultation.caterer_name && (
                                <p className="text-sm text-muted-foreground mt-1">{consultation.caterer_name}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Event Planner</p>
                            <p className="font-medium">
                                {consultation.has_planner ? '✓ Yes' : '✗ No'}
                            </p>
                            {consultation.has_planner && consultation.planner_name && (
                                <p className="text-sm text-muted-foreground mt-1">{consultation.planner_name}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Message */}
            {consultation.message && (
                <Card>
                    <CardHeader>
                        <CardTitle>Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line">{consultation.message}</p>
                    </CardContent>
                </Card>
            )}

            {/* Pricing (if available) */}
            {consultation.total_amount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Quote details for this consultation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {consultation.subtotal && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCents(consultation.subtotal)}</span>
                            </div>
                        )}
                        {consultation.delivery_fee > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>{formatCents(consultation.delivery_fee)}</span>
                            </div>
                        )}
                        {consultation.setup_fee > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Setup Fee</span>
                                <span>{formatCents(consultation.setup_fee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-2 font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCents(consultation.total_amount)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Communication Log */}
            <CommunicationLog communications={(communications || []) as Communication[]} />

            {/* Linked Appointment */}
            {appointment && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5" />
                            Linked Appointment
                        </CardTitle>
                        <CardDescription>Scheduled in-person meeting for this consultation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                                <p className="text-lg">
                                    {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')} at{' '}
                                    {appointment.appointment_time}
                                </p>
                            </div>
                            {appointment.location && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    <p>{appointment.location}</p>
                                </div>
                            )}
                            {appointment.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="whitespace-pre-wrap">{appointment.notes}</p>
                                </div>
                            )}
                            <div>
                                <Link href={`/admin/appointments/${appointment.id}`}>
                                    <Button variant="outline" size="sm">
                                        View Appointment Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Status Management</CardTitle>
                    <CardDescription>Update the consultation workflow status</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateStatus} className="flex gap-4 items-center">
                        <input type="hidden" name="id" value={consultation.id} />
                        <select
                            name="status"
                            defaultValue={consultation.status}
                            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="new_request">New Request</option>
                            <option value="pending_response">Pending Client Response</option>
                            <option value="appointment_confirmed">Appointment Confirmed</option>
                            <option value="completed">Completed</option>
                        </select>
                        <Button type="submit">Update Status</Button>
                    </form>
                    <div className="mt-4 space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(consultation.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Last Updated: {new Date(consultation.updated_at).toLocaleString()}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
