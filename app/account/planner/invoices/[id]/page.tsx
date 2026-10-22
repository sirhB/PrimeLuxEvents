import { notFound } from 'next/navigation'
import { InvoiceEditor } from '@/components/invoices/invoice-editor'
import { requireAuth } from '@/lib/auth/authorization'
import { loadInvoice, loadInvoiceContext } from '@/lib/invoices/load'
import { PlannerShell } from '../../shell'

export const dynamic = 'force-dynamic'

export default async function PlannerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAuth()
  const invoice = await loadInvoice(id) // RLS: own invoices only
  if (!invoice) notFound()
  const ctx = await loadInvoiceContext(user.id)
  return (
    <PlannerShell title={invoice.title}>
      <InvoiceEditor invoice={invoice} ctx={ctx} />
    </PlannerShell>
  )
}
