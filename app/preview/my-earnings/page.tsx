import { MyEarnings } from '@/components/admin/commissions/my-earnings'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { sampleEarnings } from '@/lib/commissions/sample'

export const dynamic = 'force-dynamic'

export default function MyEarningsPreview() {
  return (
    <PreviewFrame title="My earnings" lede="Commission on your events and payouts to Whop.">
      <MyEarnings data={sampleEarnings()} demo />
    </PreviewFrame>
  )
}
