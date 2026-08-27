'use client'

import dynamic from 'next/dynamic'
import { StatusFilter } from '@/components/admin/status-filter'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { CreateAppointmentButton } from '@/components/admin/appointments/create-button'
import { AdminPageHeader } from '@/components/admin/page-shell'

const AppointmentsWorkspace = dynamic(() => import('@/components/admin/appointments/appointments-workspace').then(m => m.AppointmentsWorkspace), {
    loading: () => <div className="h-[600px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})

interface Appointment {
    id: string
    client_name: string
    client_email: string | null
    client_phone: string | null
    appointment_date: string
    appointment_time: string
    location: string | null
    notes: string | null
    status: 'scheduled' | 'completed' | 'cancelled'
    consultation_id: string | null
    created_at: string
}

interface AppointmentsContentProps {
    appointments: Appointment[] | null
    count: number | null
    start: number
    end: number
    currentPage: number
    pageSize: number
}

export function AppointmentsContent({
    appointments,
    count,
    start,
    end,
    currentPage,
    pageSize,
}: AppointmentsContentProps) {
    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                eyebrow="Scheduling"
                title="Appointments"
                description="Manage all scheduled appointments and in-person meetings."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2 rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-1.5">
                            <div className="w-full max-w-xs">
                                <SearchInput placeholder="Search appointments..." />
                            </div>
                            <StatusFilter statuses={statusOptions} />
                        </div>
                        <CreateAppointmentButton />
                    </div>
                }
            />

            <AppointmentsWorkspace initialAppointments={appointments || []} />

            {count && count > 0 && (
                <div className="mt-8 flex justify-center pb-12">
                    <PaginationControls
                        hasNextPage={end < count - 1}
                        hasPrevPage={start > 0}
                        totalCount={count}
                        currentPage={currentPage}
                        pageSize={pageSize}
                    />
                </div>
            )}
        </div>
    )
}
