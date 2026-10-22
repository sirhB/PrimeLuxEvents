import Link from 'next/link'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'

type Partner = {
  id: string
  company_name: string
  business_type: string
  phone: string | null
  status: string
  tier: string
  base_discount_percent: number | null
  website: string | null
  created_at: string
  user_id: string
}

/**
 * LEGACY Preferred Partner records, read-only. The program (Preferred/Elite/House trade tiers,
 * shared carts, off-platform client payments) is replaced by the planner membership; nothing
 * writes these tables anymore. Kept so historical data stays visible.
 */
export function PartnersAdminContent({ partners }: { partners: Partner[] }) {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Legacy partners"
        description="Read-only records from the retired Preferred Partner program."
        eyebrow="CRM"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Legacy partners' }]}
      />
      <p className="mb-4 border-l-2 border-[var(--dashboard-accent-gold)] pl-3 text-sm text-[var(--dashboard-text-muted)]">
        Trade tiers and partner approvals are retired. Planners now join the{' '}
        <Link className="underline" href="/admin/members">planner membership</Link> ($99/mo, 50% off eligible rentals).
      </p>
      <div className="overflow-x-auto rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--dashboard-border)] text-left text-xs uppercase tracking-[0.08em] text-[var(--dashboard-text-muted)]">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Old tier</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--dashboard-text-muted)]">No legacy partner records.</td></tr>
            ) : partners.map((p) => (
              <tr key={p.id} className="border-b border-[var(--dashboard-border)] last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium">{p.company_name}</span>
                  {p.website && <span className="block text-xs text-[var(--dashboard-text-muted)]">{p.website}</span>}
                </td>
                <td className="px-4 py-3 capitalize">{p.business_type}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
                <td className="px-4 py-3 capitalize">{p.tier}{p.base_discount_percent != null ? ` (${p.base_discount_percent}%)` : ''}</td>
                <td className="px-4 py-3 tabular-nums">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  )
}
