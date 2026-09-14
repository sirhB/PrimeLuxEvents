import { Suspense } from 'react'
import { VipCheckInDesk } from '@/components/innovate/vip-check-in'

export default function InnovateVipCheckInPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--ink)]/50">Loading check-in…</div>}>
      <VipCheckInDesk />
    </Suspense>
  )
}
