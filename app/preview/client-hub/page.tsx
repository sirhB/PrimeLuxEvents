import { EventHub } from '@/components/account/event-hub'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk, toClientHub } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function ClientHubPreview() {
  const hub = toClientHub(buildSampleDesk(), 'lead-avery')
  if (!hub) return null
  return (
    <PreviewFrame title="Your event" lede="The client view of one booking.">
      <EventHub initial={hub} />
    </PreviewFrame>
  )
}
