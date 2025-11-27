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
import { Eye, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'

export default async function ConsultationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: consultations, count } = await query.range(start, end)

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
                return 'Pending Response'
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage consultation requests from your contact form
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search consultations..." />
                <StatusFilter
                    statuses={[
                        { value: 'new_request', label: 'New Requests' },
                        { value: 'pending_response', label: 'Pending Response' },
                        { value: 'appointment_confirmed', label: 'Appointment Confirmed' },
                        { value: 'completed', label: 'Completed' },
                    ]}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Event Date</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consultations?.map((consultation) => (
                                <TableRow key={consultation.id}>
                                    <TableCell className="font-medium font-mono text-xs">
                                        {consultation.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>
                                                {consultation.first_name && consultation.last_name
                                                    ? `${consultation.first_name} ${consultation.last_name}`
                                                    : consultation.customer_name || 'N/A'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {consultation.customer_email || 'No email'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {consultation.event_date
                                            ? new Date(consultation.event_date).toLocaleDateString()
                                            : 'Not set'}
                                    </TableCell>
                                    <TableCell>
                                        {consultation.number_of_guests || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                                                getStatusColor(consultation.status)
                                            )}
                                        >
                                            {getStatusLabel(consultation.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(consultation.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/consultations/${consultation.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {consultations?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No consultations found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {count !== null && count > 0 && (
                <PaginationControls
                    hasNextPage={end < count}
                    hasPrevPage={start > 0}
                    totalCount={count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}
