import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InvoicePay } from '@/components/invoices/invoice-pay'
import { loadPublicInvoice } from '@/lib/invoices/load'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Invoice', robots: { index: false, follow: false } }

/** Public client pay page: invoice id + unguessable token. Stays payable even if the planner's membership ends. */
export default async function PayInvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ id }, { t }] = await Promise.all([params, searchParams])
  const inv = await loadPublicInvoice(id, t ?? '')
  if (!inv) notFound()
  return <InvoicePay inv={inv} />
}
