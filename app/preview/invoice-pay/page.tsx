import { InvoicePay } from '@/components/invoices/invoice-pay'
import { samplePublicInvoice } from '@/lib/invoices/sample'

export const dynamic = 'force-dynamic'

export default function InvoicePayPreview() {
  return <InvoicePay inv={samplePublicInvoice()} />
}
