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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { StatusFilter } from '@/components/admin/status-filter'
import {
    Calendar,
    DollarSign,
    Eye,
    Users,
    ArrowRight,
    ListFilter,
    LayoutGrid,
    Mail,
    Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGES = [
    {
        value: 'new_request',
        title: 'New Requests',
        subtitle: 'Awaiting triage',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500/20',
        bgColor: 'bg-blue-500/5',
    },
    {
        value: 'pending_response',
        title: 'Pending Response',
        subtitle: 'Waiting on client',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/5',
    },
    {
        value: 'appointment_confirmed',
        title: 'Confirmed',
        subtitle: 'Appointment booked',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-500/20',
        bgColor: 'bg-emerald-500/5',
    },
    {
        value: 'completed',
        title: 'Completed',
        subtitle: 'Lead processed',
        color: 'bg-slate-500',
        borderColor: 'border-slate-500/20',
        bgColor: 'bg-slate-500/5',
    },
] as const

const BUDGET_LABELS: Record<string, string> = {
    'under-1000': '< $1k',
    '1000-5000': '$1k-5k',
    '5000-10000': '$5k-10k',
    '10000-20000': '$10k-20k',
    '20000+': '$20k+',
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
    pending_response: 'Pending Response',
    appointment_confirmed: 'Confirmed',
    completed: 'Completed',
}

const STATUS_BADGES: Record<ConsultationStatus, string> = {
    new_request: 'bg-blue-100 text-blue-700 border-blue-200',
    pending_response: 'bg-amber-100 text-amber-700 border-amber-200',
    appointment_confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
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
    if (!date) return 'TBD'
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

const formatBudgetRange = (budget?: string | null) => {
    if (!budget) return null
    return BUDGET_LABELS[budget] || budget
}

const getDisplayName = (consultation: Consultation) => {
    if (consultation.first_name || consultation.last_name) {
        return [consultation.first_name, consultation.last_name].filter(Boolean).join(' ')
    }
    return consultation.customer_name || 'Guest User'
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
        // Using created_at desc to show newest first
        .order('created_at', { ascending: false })

    const consultations = (data ?? []) as Consultation[]
    const normalizedSearch = search?.toLowerCase().trim()

    // Filter logic
    const filteredConsultations = consultations.filter((consultation) => {
        if (status && consultation.status !== status) return false
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

    // Grouping for Kanban
    const groupedByStatus = STAGES.reduce<Record<ConsultationStatus, Consultation[]>>((acc, stage) => {
        acc[stage.value] = []
        return acc
    }, {} as Record<ConsultationStatus, Consultation[]>)

    filteredConsultations.forEach((consultation) => {
        const key = groupedByStatus[consultation.status] ? consultation.status : 'new_request'
        groupedByStatus[key].push(consultation)
    })

    // Pagination for Table View
    const currentPage = Math.max(parseInt(page) || 1, 1)
    const pageSize = 12 // slightly higher limit for better overview
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
        <div className="flex flex-col gap-6 p-6 md:p-10 min-h-screen bg-[var(--dashboard-background)]">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--dashboard-border)]">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20 shadow-sm">
                            Pipeline
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-[var(--dashboard-text)] tracking-tight">
                        Lead Management
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-lg">
                        Streamline your inquiry process. Track potential clients from initial contact to confirmed bookings.
                    </p>
                </div>
            </header>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[var(--dashboard-background)]/90 backdrop-blur-md -mx-4 px-4 md:-mx-10 md:px-10 transition-all">
                <div className="flex w-full md:w-auto items-center gap-2">
                    <SearchInput placeholder="Search name or email..." className="w-full md:w-[300px]" />
                    <StatusFilter statuses={statusFilterOptions} />
                </div>
            </div>

            {/* Main Content Areas */}
            <Tabs defaultValue="board" className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="grid w-[200px] grid-cols-2 bg-muted/50 p-1">
                        <TabsTrigger value="board" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            Board
                        </TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <ListFilter className="w-4 h-4 mr-2" />
                            List
                        </TabsTrigger>
                    </TabsList>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Total Leads: {totalCount}
                    </div>
                </div>

                {/* BOARD VIEW */}
                <TabsContent value="board" className="mt-0">
                    {totalCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-xl bg-[var(--dashboard-card-bg)]">
                            <div className="p-4 rounded-full bg-muted/30 mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No leads found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs text-center mt-1">
                                Try adjusting your filters or wait for new inquiries to arrive.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 h-full items-start">
                            {STAGES.map((stage) => (
                                <ConsultationColumn
                                    key={stage.value}
                                    title={stage.title}
                                    subtitle={stage.subtitle}
                                    count={groupedByStatus[stage.value].length}
                                    accentClass={`border-t-4 ${stage.borderColor.replace('/20', '')}`}
                                >
                                    {groupedByStatus[stage.value].map((consultation) => {
                                        const nextStage = NEXT_STATUS[consultation.status]
                                        const budgetLabel = formatBudgetRange(consultation.budget_range)

                                        return (
                                            <Card key={consultation.id} className="group hover:shadow-md transition-all duration-300 border-l-2 border-l-transparent hover:border-l-[var(--dashboard-accent-gold)] overflow-hidden bg-[var(--dashboard-card-bg)]">
                                                <CardContent className="p-4 space-y-4">
                                                    {/* Card Header */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="font-semibold text-[15px] text-[var(--dashboard-text)]">
                                                                {getDisplayName(consultation)}
                                                            </h4>
                                                            {consultation.event_date && (
                                                                <span className="text-[10px] font-medium px-2 py-1 rounded bg-secondary/50 text-secondary-foreground whitespace-nowrap">
                                                                    {formatEventDate(consultation.event_date)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <a href={`mailto:${consultation.customer_email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 truncate">
                                                            <Mail className="w-3 h-3" />
                                                            {consultation.customer_email}
                                                        </a>
                                                        {consultation.customer_phone && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                                                <Phone className="w-3 h-3" />
                                                                {consultation.customer_phone}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Details Badges */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {consultation.number_of_guests && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border">
                                                                <Users className="w-3 h-3 mr-1" />
                                                                {consultation.number_of_guests}
                                                            </span>
                                                        )}
                                                        {budgetLabel && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border">
                                                                <DollarSign className="w-3 h-3 mr-1" />
                                                                {budgetLabel}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Message Preview */}
                                                    {consultation.message && (
                                                        <div className="bg-muted/30 p-2.5 rounded text-xs text-muted-foreground italic line-clamp-3">
                                                            "{consultation.message}"
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="pt-3 border-t flex items-center justify-between gap-2 mt-2">
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                                <Link href={`/admin/consultations/${consultation.id}`}>
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </Link>
                                                            </Button>
                                                            <div className="scale-90 origin-left">
                                                                <ConsultationCardActions
                                                                    consultationId={consultation.id}
                                                                    customerName={getDisplayName(consultation)}
                                                                    customerEmail={consultation.customer_email}
                                                                    customerPhone={consultation.customer_phone}
                                                                />
                                                            </div>
                                                        </div>

                                                        {nextStage && (
                                                            <form action={updateStatus}>
                                                                <input type="hidden" name="id" value={consultation.id} />
                                                                <input type="hidden" name="status" value={nextStage} />
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-xs px-2 hover:bg-[var(--dashboard-accent-gold)] hover:text-white hover:border-[var(--dashboard-accent-gold)] transition-colors"
                                                                >
                                                                    Move
                                                                    <ArrowRight className="ml-1 h-3 w-3" />
                                                                </Button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                    {groupedByStatus[stage.value].length === 0 && (
                                        <div className={`rounded-lg border border-dashed p-4 text-center ${stage.bgColor} ${stage.borderColor}`}>
                                            <p className="text-xs text-muted-foreground font-medium">Empty Stage</p>
                                        </div>
                                    )}
                                </ConsultationColumn>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* LIST VIEW */}
                <TabsContent value="list" className="mt-0">
                    <Card className="border shadow-sm overflow-hidden bg-[var(--dashboard-card-bg)]">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Lead ID</TableHead>
                                        <TableHead>Customer Details</TableHead>
                                        <TableHead>Event Info</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedConsultations.map((consultation) => (
                                        <TableRow key={consultation.id} className="hover:bg-muted/20">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {consultation.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{getDisplayName(consultation)}</span>
                                                    <a href={`mailto:${consultation.customer_email}`} className="text-xs text-muted-foreground hover:underline">
                                                        {consultation.customer_email || 'No email'}
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center text-xs">
                                                        <Calendar className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                                        {formatEventDate(consultation.event_date)}
                                                    </div>
                                                    {consultation.number_of_guests && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Users className="mr-1.5 h-3 w-3" />
                                                            {consultation.number_of_guests} guests
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border', STATUS_BADGES[consultation.status])}>
                                                    {STATUS_LABELS[consultation.status]}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(consultation.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <Link href={`/admin/consultations/${consultation.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedConsultations.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No leads found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {totalCount > 0 && (
                        <div className="mt-4">
                            <PaginationControls
                                hasNextPage={start + pageSize < totalCount}
                                hasPrevPage={start > 0}
                                totalCount={totalCount}
                                currentPage={currentPage}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
