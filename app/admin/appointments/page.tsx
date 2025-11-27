import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Eye, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/search-input'
import { StatusFilter } from '@/components/admin/status-filter'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { CreateAppointmentButton } from '@/components/admin/appointments/create-button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const currentPage = Math.max(parseInt(page) || 1, 1)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    if (search) {
        query = query.or(
            `id.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%,location.ilike.%${search}%`
        )
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: appointments, count } = await query.range(start, end)

    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy')
        } catch {
            return dateString
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all scheduled appointments and in-person meetings
                    </p>
                </div>
                <CreateAppointmentButton />
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search appointments..." />
                <StatusFilter statuses={statusOptions} />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Linked Consultation</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments && appointments.length > 0 ? (
                                appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {formatDate(appointment.appointment_date)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment.appointment_time}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{appointment.client_name || 'N/A'}</span>
                                                {appointment.client_email && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {appointment.client_email}
                                                    </span>
                                                )}
                                                {appointment.client_phone && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {appointment.client_phone}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{appointment.location || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                                                    getStatusColor(appointment.status)
                                                )}
                                            >
                                                {appointment.status.charAt(0).toUpperCase() +
                                                    appointment.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {appointment.consultation_id ? (
                                                <Link
                                                    href={`/admin/consultations/${appointment.consultation_id}`}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    View Consultation
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/appointments/${appointment.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No appointments found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {count && count > 0 && (
                <PaginationControls
                    hasNextPage={end < count - 1}
                    hasPrevPage={start > 0}
                    totalCount={count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}

