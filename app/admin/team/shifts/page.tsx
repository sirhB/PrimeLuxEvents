import dynamic from 'next/dynamic'

const StaffShiftsContent = dynamic(
    () => import('@/components/admin/team/staff-shifts-content').then((mod) => mod.StaffShiftsContent)
)

export default function StaffShiftsPage() {
    return (
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <StaffShiftsContent />
        </div>
    )
}
