import { CrmDesk } from '@/components/admin/venue/crm-desk'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function VenueDeskPreview() {
  return (
    <PreviewFrame title="Venue desk" lede="Pipeline, contacts, calendar, and reports.">
      <CrmDesk initial={buildSampleDesk()} leadBase="/preview/lead" />
    </PreviewFrame>
  )
}
