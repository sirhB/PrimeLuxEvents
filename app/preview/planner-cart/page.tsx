import { PlannerCart } from '@/components/admin/carts/planner-cart'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { sampleCart, samplePlannerContext } from '@/lib/carts/sample'

export const dynamic = 'force-dynamic'

export default async function PlannerCartPreview({ searchParams }: { searchParams: Promise<{ state?: string; connect?: string }> }) {
  const sp = await searchParams
  const ctx = samplePlannerContext()
  if (sp.connect === '0') ctx.connect = { ready: false, started: false, payoutsEnabled: false }
  return (
    <PreviewFrame title="Client cart" lede="Build from the catalog, share the quote, collect payment.">
      <PlannerCart cart={sampleCart(sp.state === 'approved' ? 'approved' : 'draft')} ctx={ctx} demo />
    </PreviewFrame>
  )
}
