import { notFound } from 'next/navigation'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { InvoiceEditor } from '@/components/invoices/invoice-editor'
import { requireAuth } from '@/lib/auth/authorization'
import { loadInvoice, loadInvoiceContext } from '@/lib/invoices/load'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params
  const invoice = await loadInvoice(id) // RLS: own invoice or admin
  if (!invoice) notFound()
  const db = await createClient()
  const { data: row } = await db.from('planner_invoices').select('planner_user_id').eq('id', id).single()
  const ctx = await loadInvoiceContext(row?.planner_user_id ?? '')
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Invoices" title={invoice.title} />
      <InvoiceEditor invoice={invoice} ctx={ctx} />
    </AdminPage>
  )
}
