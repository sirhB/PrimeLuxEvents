'use client'

import { useState, useTransition } from 'react'
import { adminUpdatePartnerStatus } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
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

export function PartnersAdminContent({ partners: initial }: { partners: Partner[] }) {
  const [partners, setPartners] = useState(initial)
  const [pending, startTransition] = useTransition()

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
          p.id === partnerId
            ? { ...p, status, tier: tier || p.tier }
            : p,
        ),
      )
      toast.success('Partner updated')
    })
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Preferred partners"
        description="Approve planners and decorators for trade rates and client share carts."
        eyebrow="CRM"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Partners' },
        ]}
      />

      <div className="overflow-x-auto rounded-xl border border-[var(--dashboard-border)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] text-[11px] uppercase tracking-wider text-[var(--dashboard-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--dashboard-text-muted)]">
                  No partner applications yet.
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id} className="border-b border-[var(--dashboard-border)]/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--dashboard-text)]">{p.company_name}</div>
                    <div className="text-xs text-[var(--dashboard-text-muted)]">{p.phone}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-[var(--dashboard-text-muted)]">
                    {p.business_type}
                  </td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={p.tier}
                      disabled={pending}
                      onValueChange={(tier) => update(p.id, p.status, tier)}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {p.status !== 'active' && (
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() => update(p.id, 'active', p.tier)}
                        >
                          Approve
                        </Button>
                      )}
                      {p.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => update(p.id, 'suspended', p.tier)}
                        >
                          Suspend
                        </Button>
                      )}
                      {p.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() => update(p.id, 'revoked', p.tier)}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  )
}
