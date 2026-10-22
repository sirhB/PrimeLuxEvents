import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { InvoicesDashboard } from '@/components/invoices/invoices-dashboard'
import { BrandingForm } from '@/components/invoices/branding-form'
import { sampleClients, sampleInvoiceList } from '@/lib/invoices/sample'

export const dynamic = 'force-dynamic'

export default function InvoicesPreview() {
  return (
    <PreviewFrame title="Invoices" lede="Bill clients for Prime Lux rentals and your own services.">
      <div className="flex flex-col gap-5">
        <BrandingForm businessName="Laurent Events" disabled={false} demo />
        <InvoicesDashboard invoices={sampleInvoiceList()} clients={sampleClients()} canInvoice demo />
      </div>
    </PreviewFrame>
  )
}
