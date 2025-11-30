import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, User, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatCents } from '@/lib/format-money'
import { EventOverview } from '@/components/admin/events/event-overview'
import { CreateEventTaskDialog } from '@/components/admin/events/create-event-task-dialog'
import { StatusBadge } from '@/components/ui/status-badge'

interface Event {
    id: string
    event_id: string
    name: string
    event_date: string
    location: string | null
    status: string
    guest_count: number | null
    budget: number | null
    manager_name: string | null
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    notes: string | null
    event_type: string | null
    venue_name: string | null
    created_by: string
    created_at: string
    updated_at: string
}

function getStatusVariant(status: string): 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default' {
    const statusMap: Record<string, 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default'> = {
        'confirmed': 'success',
        'completed': 'default',
        'planning': 'pending',
        'pending': 'on-hold',
        'cancelled': 'cancelled',
    }
    return statusMap[status.toLowerCase()] || 'default'
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (!event || error) {
        notFound()
    }

    // Fetch related data using foreign key relationships
    const { data: relatedOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('event_id', id)
        .limit(5)

    const { data: relatedConsultations } = await supabase
        .from('consultations')
        .select('*')
        .eq('event_id', id)
        .limit(5)

    const { data: relatedAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('event_id', id)
        .limit(5)

    const { data: eventTasks } = await supabase
        .from('event_tasks')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

    const daysLeft = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/events">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Event ID: {event.event_id} • Created {new Date(event.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge
                        status={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        variant={getStatusVariant(event.status)}
                    />
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <EventOverview event={event} />

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders ({relatedOrders?.length || 0})</TabsTrigger>
                    <TabsTrigger value="consultations">Consultations ({relatedConsultations?.length || 0})</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments ({relatedAppointments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({eventTasks?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                                    <p className="text-lg">
                                        {new Date(event.event_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {daysLeft >= 0 && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {daysLeft} days until event
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                                    <p className="text-lg capitalize">{event.event_type || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Venue</p>
                                    <p className="text-lg">{event.venue_name || event.location || 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Guest Count</p>
                                    <p className="text-lg">{event.guest_count || 'TBD'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-lg">{event.customer_name || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-lg">{event.customer_email || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    <p className="text-lg">{event.customer_phone || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Event Manager</p>
                                    <p className="text-lg">{event.manager_name || 'Unassigned'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes */}
                    {event.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{event.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage this event and related items</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Order
                                </Button>
                                <Button variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule Appointment
                                </Button>
                                <Button variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Task
                                </Button>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Event
                                </Button>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Event
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Orders</CardTitle>
                            <CardDescription>Orders associated with this event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {relatedOrders && relatedOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedOrders.map((order: any) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCents(order.total_amount)} • {order.status}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/orders/${order.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No orders found for this event.</p>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Order
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="consultations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Consultations</CardTitle>
                            <CardDescription>Consultation requests for this event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {relatedConsultations && relatedConsultations.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedConsultations.map((consultation: any) => (
                                        <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Consultation #{consultation.id.slice(0, 8)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {consultation.status} • {consultation.created_at ? new Date(consultation.created_at).toLocaleDateString() : 'Unknown date'}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/consultations/${consultation.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No consultations found for this event.</p>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Consultation
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appointments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Appointments</CardTitle>
                            <CardDescription>Scheduled meetings for this event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {relatedAppointments && relatedAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedAppointments.map((appointment: any) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.location} • {appointment.status}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/appointments/${appointment.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No appointments scheduled for this event.</p>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Schedule Appointment
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Tasks</CardTitle>
                            <CardDescription>Tasks and checklist items for this event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {eventTasks && eventTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {eventTasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{task.title}</h4>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                                                    {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="pt-4">
                                        <CreateEventTaskDialog
                                            eventId={id}
                                            onSuccess={() => window.location.reload()}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No tasks created for this event yet.</p>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Task
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
