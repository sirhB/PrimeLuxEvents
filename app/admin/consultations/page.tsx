import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ConsultationColumn } from '@/components/admin/consultations/consultation-column'
import { ConsultationCardActions } from '@/components/admin/consultations/consultation-card-actions'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'
import { Calendar, DollarSign, Eye, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGES = [
    {
        value: 'new_request',
        title: 'New Requests',
        subtitle: 'Awaiting triage',
        accentClass: 'border-t-4 border-blue-200',
    },
    {
        value: 'pending_response',
        title: 'Pending Client Response',
        subtitle: 'Waiting on a reply',
        accentClass: 'border-t-4 border-yellow-200',
    },
    {
        value: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        subtitle: 'Booked on the calendar',
        accentClass: 'border-t-4 border-green-200',
    },
    {
        value: 'completed',
        title: 'Completed',
        subtitle: 'Wrap up and follow-up',
        accentClass: 'border-t-4 border-slate-200',
    },
] as const

const BUDGET_LABELS: Record<string, string> = {
    'under-1000': 'Under $1,000',
    '1000-5000': '$1,000 - $5,000',
    '5000-10000': '$5,000 - $10,000',
    '10000-20000': '$10,000 - $20,000',
    '20000+': '$20,000+',
}

type ConsultationStatus = (typeof STAGES)[number]['value']

type Consultation = {
    id: string
    status: ConsultationStatus
    first_name: string | null
    last_name: string | null
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    number_of_guests: number | null
    event_date: string | null
    budget_range: string | null
    message: string | null
    created_at: string
    updated_at: string
}

const STATUS_LABELS: Record<ConsultationStatus, string> = {
    new_request: 'New Request',
    pending_response: 'Pending Client Response',
    appointment_confirmed: 'Appointment Confirmed',
    completed: 'Completed',
}

const STATUS_COLORS: Record<ConsultationStatus, string> = {
    new_request: 'bg-blue-100 text-blue-800 border-blue-200',
    pending_response: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    appointment_confirmed: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
}

const NEXT_STATUS: Record<ConsultationStatus, ConsultationStatus | null> = {
    new_request: 'pending_response',
    pending_response: 'appointment_confirmed',
    appointment_confirmed: 'completed',
    completed: null,
}

const statusFilterOptions = STAGES.map((stage) => ({
    value: stage.value,
    label: STATUS_LABELS[stage.value],
}))

const formatEventDate = (date: string | null) => {
    if (!date) return 'Date TBD'
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const formatBudgetRange = (budget?: string | null) => {
    if (!budget) return null
    return BUDGET_LABELS[budget] || budget
}

const getDisplayName = (consultation: Consultation) => {
    if (consultation.first_name && consultation.last_name) {
        return `${consultation.first_name} ${consultation.last_name}`
    }
    return consultation.customer_name || 'Unknown Customer'
}

export default async function ConsultationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const { data } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: true })

    const consultations = (data ?? []) as Consultation[]
    const normalizedSearch = search?.toLowerCase().trim()
    const statusFilter = STAGES.some((stage) => stage.value === status)
        ? (status as ConsultationStatus)
        : undefined

    const filteredConsultations = consultations.filter((consultation) => {
        if (statusFilter && consultation.status !== statusFilter) return false
        if (!normalizedSearch) return true

        const haystack = [
            consultation.id,
            consultation.customer_name,
            consultation.customer_email,
            consultation.first_name,
            consultation.last_name,
            consultation.message,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        return haystack.includes(normalizedSearch)
    })

    const groupedByStatus = STAGES.reduce<Record<ConsultationStatus, Consultation[]>>((acc, stage) => {
        acc[stage.value] = []
        return acc
    }, {} as Record<ConsultationStatus, Consultation[]>)

    filteredConsultations.forEach((consultation) => {
        const key = groupedByStatus[consultation.status]?.length !== undefined
            ? consultation.status
            : 'new_request'
        groupedByStatus[key as ConsultationStatus].push(consultation)
    })

    const currentPage = Math.max(parseInt(page) || 1, 1)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const paginatedConsultations = filteredConsultations.slice(start, start + pageSize)
    const totalCount = filteredConsultations.length

    async function updateStatus(formData: FormData) {
        'use server'
        const id = formData.get('id') as string | null
        const nextStatus = formData.get('status') as ConsultationStatus | null

        if (!id || !nextStatus) return

        const supabase = await createClient()
        await supabase
            .from('consultations')
            .update({ status: nextStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        revalidatePath('/admin/consultations')
    }

    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
                <p className="text-gray-600 mt-1 text-sm">
                    Track every consultation request through a clear, kanban-style workflow.
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <SearchInput placeholder="Search consultations..." />
                <StatusFilter statuses={statusFilterOptions} />
            </div>

            {filteredConsultations.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center space-y-3">
                        <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No consultations match the current filters.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {STAGES.map((stage) => (
                        <ConsultationColumn
                            key={stage.value}
                            title={stage.title}
                            subtitle={stage.subtitle}
                            count={groupedByStatus[stage.value].length}
                            accentClass={stage.accentClass}
                        >
                            {groupedByStatus[stage.value].map((consultation) => {
                                const nextStage = NEXT_STATUS[consultation.status]
                                const budgetLabel = formatBudgetRange(consultation.budget_range)

                                return (
                                    <Card key={consultation.id} className="border shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {getDisplayName(consultation)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {consultation.customer_email || 'No email provided'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatEventDate(consultation.event_date)}
                                                </span>
                                                {consultation.number_of_guests && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5">
                                                        <Users className="h-3 w-3" />
                                                        {consultation.number_of_guests} guests
                                                    </span>
                                                )}
                                                {budgetLabel && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5">
                                                        <DollarSign className="h-3 w-3" />
                                                        {budgetLabel}
                                                    </span>
                                                )}
                                            </div>
                                            {consultation.message && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {consultation.message}
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/consultations/${consultation.id}`}>
                                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                                            Details
                                                        </Link>
                                                    </Button>
                                                    {nextStage ? (
                                                        <form action={updateStatus}>
                                                            <input type="hidden" name="id" value={consultation.id} />
                                                            <input type="hidden" name="status" value={nextStage} />
                                                            <Button size="sm" variant="secondary">
                                                                Move to {STATUS_LABELS[nextStage]}
                                                            </Button>
                                                        </form>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Awaiting wrap-up</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-2 pt-1 border-t">
                                                    <ConsultationCardActions
                                                        consultationId={consultation.id}
                                                        customerName={getDisplayName(consultation)}
                                                        customerEmail={consultation.customer_email}
                                                        customerPhone={consultation.customer_phone}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                            {groupedByStatus[stage.value].length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                    No consultations in this stage.
                                </p>
                            )}
                        </ConsultationColumn>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <h2 className="text-xl font-semibold">Table View</h2>
                    <p className="text-sm text-muted-foreground">
                        Prefer spreadsheets? Use the table for bulk review, sorting, and exports.
                    </p>
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
                                {paginatedConsultations.map((consultation) => (
                                    <TableRow key={consultation.id}>
                                        <TableCell className="font-medium font-mono text-xs">
                                            {consultation.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{getDisplayName(consultation)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {consultation.customer_email || 'No email'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatEventDate(consultation.event_date)}</TableCell>
                                        <TableCell>{consultation.number_of_guests || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                                                    STATUS_COLORS[consultation.status]
                                                )}
                                            >
                                                {STATUS_LABELS[consultation.status]}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(consultation.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/consultations/${consultation.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedConsultations.length === 0 && (
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

                {totalCount > 0 && (
                    <PaginationControls
                        hasNextPage={start + pageSize < totalCount}
                        hasPrevPage={start > 0}
                        totalCount={totalCount}
                        currentPage={currentPage}
                        pageSize={pageSize}
                    />
                )}
            </div>
        </div>
    )
}
