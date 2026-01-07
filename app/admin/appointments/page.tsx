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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
                return 'bg-gray-100 text-gray-800 border-border'
            default:
                return 'bg-gray-100 text-gray-800 border-border'
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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Scheduling
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Appointments
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Manage all scheduled appointments and in-person meetings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <CreateAppointmentButton />
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">All Appointments</TabsTrigger>
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-none">
                        <div className="w-full max-w-md">
                            <SearchInput placeholder="Search appointments..." />
                        </div>
                        <StatusFilter statuses={statusOptions} />
                    </div>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-black/20">
                                    <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4 pl-6">Date & Time</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Client</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Location</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Status</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Details</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments && appointments.length > 0 ? (
                                        appointments.map((appointment) => (
                                            <TableRow key={appointment.id} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-serif text-lg text-[var(--dashboard-text)]">
                                                            {formatDate(appointment.appointment_date)}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                                                            {appointment.appointment_time}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[var(--dashboard-text)]">{appointment.client_name || 'N/A'}</span>
                                                        {appointment.client_email && (
                                                            <span className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-tight">
                                                                {appointment.client_email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[var(--dashboard-text-muted)] font-light text-sm italic">{appointment.location || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border',
                                                            appointment.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                appointment.status === 'completed' ? 'bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] border-[var(--dashboard-accent-green)]/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' :
                                                                    'bg-[var(--dashboard-text-muted)]/10 text-[var(--dashboard-text-muted)] border-[var(--dashboard-border)]'
                                                        )}
                                                    >
                                                        {appointment.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {appointment.consultation_id ? (
                                                        <Link
                                                            href={`/admin/consultations/${appointment.consultation_id}`}
                                                            className="text-[var(--dashboard-accent-gold)] hover:underline text-[10px] font-bold uppercase tracking-widest"
                                                        >
                                                            View Consultation
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[var(--dashboard-text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-30">Standalone</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
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
                                            <TableCell colSpan={6} className="text-center h-40">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <CalendarIcon className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">No appointments found</p>
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
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 glass-card rounded-3xl border-none">
                        <p className="text-[var(--dashboard-text-muted)] font-light">Calendar view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

