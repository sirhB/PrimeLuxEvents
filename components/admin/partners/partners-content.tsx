'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { adminUpdatePartnerStatus } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPage, AdminPageHeader, AdminPanel, AdminPanelHeader } from '@/components/admin/page-shell'
import { StatusChip } from '@/components/shared/status-chip'
import { formatCentsWithCommas } from '@/lib/format-money'
import { toast } from 'sonner'

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

type AttributedOrder = {
  id: string
  customer_name: string | null
  status: string
  total_amount: number
  delivery_date: string | null
  partner_id: string | null
  billing_party: string | null
  created_at: string
}

export function PartnersAdminContent({
  partners: initial,
  attributedOrders = [],
}: {
  partners: Partner[]
  attributedOrders?: AttributedOrder[]
}) {
  const [partners, setPartners] = useState(initial)
  const [pending, startTransition] = useTransition()

  const pendingApps = partners.filter((p) => p.status === 'pending')
  const active = partners.filter((p) => p.status === 'active')
  const other = partners.filter((p) => !['pending', 'active'].includes(p.status))

  const update = (partnerId: string, status: Partner['status'], tier?: string) => {
    startTransition(async () => {
      const result = await adminUpdatePartnerStatus({
        partnerId,
        status: status as any,
        tier: tier as any,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partnerId ? { ...p, status, tier: tier || p.tier } : p,
        ),
      )
      toast.success(
        status === 'active' ? 'Partner approved — trade rates unlocked' : 'Partner updated',
      )
    })
  }

  const partnerName = (id: string | null) =>
    partners.find((p) => p.id === id)?.company_name || 'Partner'

  return (
    <AdminPage>
      <AdminPageHeader
        title="Preferred partners"
        description="Approve → set tier → track attributed trade orders."
        eyebrow="Pipeline"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Partners' },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminPanel>
          <AdminPanelHeader
            title="Approve queue"
            description={`${pendingApps.length} awaiting review`}
          />
          {pendingApps.length === 0 ? (
            <p className="text-sm text-[var(--dashboard-text-muted)]">No pending applications.</p>
          ) : (
            <ul className="space-y-3">
              {pendingApps.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-[var(--dashboard-border)] p-3 space-y-3"
                >
                  <div>
                    <p className="font-medium text-[var(--dashboard-text)]">{p.company_name}</p>
                    <p className="text-xs text-[var(--dashboard-text-muted)] capitalize">
                      {p.business_type}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={p.tier}
                      disabled={pending}
                      onValueChange={(tier) => update(p.id, p.status, tier)}
                    >
                      <SelectTrigger className="h-9 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" disabled={pending} onClick={() => update(p.id, 'active', p.tier)}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => update(p.id, 'revoked', p.tier)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Active tiers" description={`${active.length} partners`} />
          {active.length === 0 ? (
            <p className="text-sm text-[var(--dashboard-text-muted)]">No active partners yet.</p>
          ) : (
            <ul className="space-y-2">
              {active.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-[var(--dashboard-border)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.company_name}</p>
                    <Select
                      value={p.tier}
                      disabled={pending}
                      onValueChange={(tier) => update(p.id, 'active', tier)}
                    >
                      <SelectTrigger className="mt-1 h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => update(p.id, 'suspended', p.tier)}
                  >
                    Suspend
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {other.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-[var(--dashboard-border)] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                Other ({other.length})
              </p>
              {other.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.company_name}</span>
                  <StatusChip status={p.status} />
                </div>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Attributed orders"
            description="Orders booked under a partner trade account."
          />
          {attributedOrders.length === 0 ? (
            <p className="text-sm text-[var(--dashboard-text-muted)]">
              No partner-attributed orders yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {attributedOrders.slice(0, 12).map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-[var(--dashboard-border)] px-3 py-2.5 transition-colors hover:bg-[var(--dashboard-card-hover)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.customer_name || `#${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-[10px] text-[var(--dashboard-text-muted)]">
                        {partnerName(order.partner_id)}
                        {order.delivery_date
                          ? ` · ${new Date(order.delivery_date).toLocaleDateString()}`
                          : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusChip status={order.status} />
                      <p className="mt-1 text-xs tabular-nums text-[var(--dashboard-accent-gold)]">
                        {formatCentsWithCommas(order.total_amount)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
