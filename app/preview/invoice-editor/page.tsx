import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { InvoiceEditor } from '@/components/invoices/invoice-editor'
import { sampleInvoice, sampleInvoiceContext } from '@/lib/invoices/sample'

export const dynamic = 'force-dynamic'

export default async function InvoiceEditorPreview({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const { member } = await searchParams
  const ctx = sampleInvoiceContext()
  if (member === '0') Object.assign(ctx, { canInvoice: false, memberActive: false, memberStatus: 'canceled' })
  return (
    <PreviewFrame title="Harper & Cole wedding" lede="Invoice editor">
      <InvoiceEditor invoice={sampleInvoice()} ctx={ctx} demo />
    </PreviewFrame>
  )
}
