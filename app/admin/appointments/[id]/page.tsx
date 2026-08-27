import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, MapPin, Clock, User, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updateAppointmentStatus, deleteAppointment } from '@/app/admin/appointments/actions'
import { DeleteAppointmentDialog } from '@/components/admin/appointments/delete-appointment-dialog'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { AppointmentEditForm } from '@/components/admin/appointments/appointment-edit-form'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single()

    if (!appointment) {
        notFound()
    }

    // Get linked consultation if exists
    let consultation = null
    if (appointment.consultation_id) {
        const { data } = await supabase
            .from('consultations')
            .select('id, customer_name')
            .eq('id', appointment.consultation_id)
            .single()
        consultation = data
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-border'
            default:
                return 'bg-gray-100 text-gray-800 border-border'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'EEEE, MMMM d, yyyy')
        } catch {
            return dateString
        }
    }

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Appointments', href: '/admin/appointments' }, { label: appointment.client_name || 'Details' }]}
                title="Appointment Details"
                description={`ID: ${appointment.id.slice(0, 8)}…`}
                actions={
                    <div className="flex gap-2 items-center">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold border',
                                getStatusColor(appointment.status)
                            )}
                        >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <DeleteAppointmentDialog
                            appointmentId={appointment.id}
                            clientName={appointment.client_name || 'Unknown'}
                        />
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Appointment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Appointment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Date</p>
                            <p className="text-lg">{formatDate(appointment.appointment_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Time
                            </p>
                            <p>{appointment.appointment_time}</p>
                        </div>
                        {appointment.location && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </p>
                                <p>{appointment.location}</p>
                            </div>
                        )}
                        {appointment.notes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="whitespace-pre-wrap">{appointment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Client Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Client Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-lg">{appointment.client_name || 'N/A'}</p>
                        </div>
                        {appointment.client_email && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </p>
                                <a
                                    href={`mailto:${appointment.client_email}`}
                                    className="text-primary hover:underline"
                                >
                                    {appointment.client_email}
                                </a>
                            </div>
                        )}
                        {appointment.client_phone && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    Phone
                                </p>
                                <a
                                    href={`tel:${appointment.client_phone}`}
                                    className="text-primary hover:underline"
                                >
                                    {appointment.client_phone}
                                </a>
                            </div>
                        )}
                        {consultation && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Linked Consultation</p>
                                <Link
                                    href={`/admin/consultations/${consultation.id}`}
                                    className="text-primary hover:underline"
                                >
                                    View Consultation
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Appointment Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Appointment</CardTitle>
                    <CardDescription>Update appointment details or status</CardDescription>
                </CardHeader>
                <CardContent>
                    <AppointmentEditForm appointment={appointment} />
                </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created by:</span>
                        <span>{appointment.created_by || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created at:</span>
                        <span>{new Date(appointment.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last updated:</span>
                        <span>{new Date(appointment.updated_at).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
        </AdminPage>
    )
}

