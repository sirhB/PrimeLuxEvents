import { CommissionLedger } from '@/components/admin/commissions/commission-ledger'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { sampleLedger } from '@/lib/commissions/sample'

export const dynamic = 'force-dynamic'

export default function CommissionLedgerPreview() {
  return (
    <PreviewFrame title="Commissions" lede="Earned, pending, held, and paid, by planner and by event.">
      <CommissionLedger data={sampleLedger()} demo />
    </PreviewFrame>
  )
}
