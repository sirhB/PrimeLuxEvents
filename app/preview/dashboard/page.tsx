import { DashboardView } from '@/components/admin/dashboard/dashboard-content'

export const dynamic = 'force-dynamic'

/** Mock-data render of the admin dashboard for screenshots and design review. */
export default function DashboardPreview() {
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] px-4 py-6 text-[var(--dashboard-text)] md:p-10">
      <DashboardView
        firstName="Devyn"
        loading={false}
        weekendLabel="Fri Oct 23 – Sun Oct 25"
        weekendSummary={{ not_started: 2, in_progress: 3, ready: 4, loaded: 1, delivered: 2, total: 12 }}
        attention={[
          { id: 'orders', label: 'Orders awaiting confirmation', href: '/admin/orders?status=pending', count: 3, tone: 'warning' },
          { id: 'leads', label: 'New leads', href: '/admin/consultations', count: 5, tone: 'warning' },
          { id: 'warehouse', label: 'Overdue / due warehouse tasks', href: '/admin/warehouse/schedule', count: 2, tone: 'danger' },
        ]}
        todayTasks={[
          { id: 't1', title: 'Pick: Gold chiavari chairs ×120', category: 'pick', status: 'in_progress', customerName: 'Avery Cole', href: '#' },
          { id: 't2', title: 'Pack: Crystal chandelier set', category: 'pack', status: 'pending', customerName: 'Nina Voss', href: '#' },
          { id: 't3', title: 'Load: Conservatory van', category: 'vehicle_load', status: 'pending', customerName: null, href: '#' },
        ]}
      />
    </div>
  )
}
