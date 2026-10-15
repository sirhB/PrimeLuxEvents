'use client'

import { useState } from 'react'
import { updateEventPlanStatus } from '@/app/admin/venue/actions'

export type EventPlanRow = {
  id: string
  event_type: string
  event_date: string | null
  guest_count: number | null
  venue_name: string | null
  services: string[] | null
  rentals: string[] | null
  budget_range: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  status: string
  created_at: string
}

const STATUSES = ['new', 'reviewing', 'proposal', 'booked', 'closed']

export function EventPlansTable({ plans, live }: { plans: EventPlanRow[]; live: boolean }) {
  const [rows, setRows] = useState(plans)
  const [message, setMessage] = useState('')

  if (!rows.length) {
    return <p className="text-sm text-[var(--dashboard-text-muted)]">Plans from the public form will appear here.</p>
  }

  return (
    <div className="space-y-3">
      {!live && <p className="text-sm text-[var(--dashboard-text-muted)]">Sample plans until the migration is applied.</p>}
      {message && <p className="text-sm">{message}</p>}
      <div className="overflow-x-auto border border-[var(--dashboard-border)] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Guest</th>
              <th className="px-3 py-3 font-medium">Occasion</th>
              <th className="px-3 py-3 font-medium">When</th>
              <th className="px-3 py-3 font-medium">Venue</th>
              <th className="px-3 py-3 font-medium">Budget</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((plan) => (
              <tr key={plan.id} className="border-t border-[var(--dashboard-border)]">
                <td className="px-3 py-3">
                  <div>{plan.contact_name}</div>
                  <div className="text-xs text-[var(--dashboard-text-muted)]">{plan.contact_email}</div>
                </td>
                <td className="px-3 py-3">{plan.event_type}</td>
                <td className="px-3 py-3">{plan.event_date || '—'} · {plan.guest_count || '—'} guests</td>
                <td className="px-3 py-3">{plan.venue_name || '—'}</td>
                <td className="px-3 py-3">{plan.budget_range || '—'}</td>
                <td className="px-3 py-3">
                  <select
                    className="plan-field !mt-0"
                    value={plan.status}
                    onChange={(event) => {
                      const status = event.target.value
                      setRows((current) => current.map((row) => row.id === plan.id ? { ...row, status } : row))
                      if (!live) {
                        setMessage('Updated on this screen. Apply the migration to keep it.')
                        return
                      }
                      void updateEventPlanStatus(plan.id, status).then(
                        () => setMessage('Saved.'),
                        () => setMessage('The status did not save.'),
                      )
                    }}
                  >
                    {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
