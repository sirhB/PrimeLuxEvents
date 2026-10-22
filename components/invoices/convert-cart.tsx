'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ReceiptText } from 'lucide-react'
import { convertCartToInvoice } from '@/lib/invoices/actions'
import { usePlannerBase } from './paths'

/** Turn a cart / client quote into a draft invoice, then add your own services to it. */
export function ConvertCartToInvoice({ cartId, demo = false }: { cartId: string; demo?: boolean }) {
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const base = usePlannerBase()
  return (
    <div className="flex flex-col gap-1">
      <button type="button" disabled={pending} className="hub-chip inline-flex min-h-12 w-full items-center justify-center gap-2"
        onClick={() => {
          if (demo) { router.push('/preview/invoice-editor'); return }
          start(async () => { const r = await convertCartToInvoice(cartId); if (r.ok) router.push(`${base.invoices.replace('/preview/invoice-editor', '/admin/invoices')}/${r.id}`); else setErr(r.error) })
        }}>
        <ReceiptText className="size-4" />Convert to invoice
      </button>
      <p className="text-[11px] text-[var(--dashboard-text-muted)]">Bill this quote with Stripe Invoicing and add your own services, like planning fees.</p>
      {err && <p role="alert" className="text-xs text-[var(--dashboard-accent-red)]">{err}</p>}
    </div>
  )
}
