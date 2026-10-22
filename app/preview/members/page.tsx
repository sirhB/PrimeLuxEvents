import { MembersDesk } from '@/components/admin/members/members-desk'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { sampleMembersDesk } from '@/lib/membership/admin-sample'

export const dynamic = 'force-dynamic'

export default function Preview() {
  return (
    <PreviewFrame title="Planner members" lede="Memberships, earnings owed, and member pricing.">
      <MembersDesk data={sampleMembersDesk()} demo initialTab="members" />
    </PreviewFrame>
  )
}
