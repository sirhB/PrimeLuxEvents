'use client'

import { useState, useTransition } from 'react'
import { PressButton } from '@/components/admin/carts/parts'
import { saveBranding } from '@/lib/invoices/actions'

/** Planner branding on their Stripe account: shows on Stripe invoices, emails, and the pay page. */
export function BrandingForm({ businessName, disabled, demo = false }: { businessName: string; disabled: boolean; demo?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <details className="group border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm">
        <span>Invoice branding <span className="text-[var(--dashboard-text-muted)]">· {businessName || 'not set'}</span></span>
        <span aria-hidden className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-open:rotate-45">+</span>
      </summary>
      <form className="grid gap-3 px-4 pb-4" action={(fd) => {
        if (demo) { setMsg('Preview: branding would be saved to Stripe'); return }
        start(async () => { const r = await saveBranding(fd); setMsg(r.ok ? 'Saved to your Stripe account' : r.error) })
      }}>
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Business name
          <input name="businessName" className="plan-field" defaultValue={businessName} disabled={disabled} />
        </label>
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Logo (PNG or JPG, under 512 KB)
          <input name="logo" type="file" accept="image/png,image/jpeg" className="plan-field" disabled={disabled} />
        </label>
        <p className="text-[11px] text-[var(--dashboard-text-muted)]">Invoices carry your name and logo, with “Powered by Prime Lux Events” in the footer.</p>
        <PressButton type="submit" disabled={disabled || pending}>Save branding</PressButton>
        {msg && <p role="status" className="text-xs">{msg}</p>}
      </form>
    </details>
  )
}
