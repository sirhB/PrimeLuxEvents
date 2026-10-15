import { LeadFile } from '@/components/admin/venue/lead-file'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default async function LeadPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PreviewFrame title="Lead">
      <LeadFile initial={buildSampleDesk()} leadId={id} backHref="/preview/venue-desk" />
    </PreviewFrame>
  )
}
