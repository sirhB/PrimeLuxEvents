'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlanOnboarding } from '@/components/plan/plan-onboarding'
import { useCart } from '@/components/providers/cart-provider'
import type { VenueListing } from '@/lib/venues/directory'

export function PlanPage({ venues }: { venues: VenueListing[] }) {
  const { lead, hasLead, setLeadDone, isLoaded } = useCart()
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="lux-label">Saved</p>
        <h1 className="mt-4 font-serif text-5xl font-medium">Now, the pieces.</h1>
        <p className="mt-6 font-light leading-relaxed text-[var(--theme-muted)]">
          Your details are with the house. Add rentals as you like; a planner can see your cart and help shape it.
        </p>
        <Link href="/catalog" className="lux-cta mt-10">Browse rentals</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-10 md:pt-24">
      <p className="lux-label">Plan your event</p>
      {isLoaded && (
        <div className="mt-6">
          <PlanOnboarding
            key={lead?.leadId ?? 'new'}
            venues={venues}
            editing={hasLead}
            initial={hasLead ? lead?.details : null}
            prefill={lead?.prefill}
            onDone={(id) => { setLeadDone(id); setDone(true) }}
          />
        </div>
      )}
    </div>
  )
}
