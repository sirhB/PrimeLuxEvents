'use client'

import Link from 'next/link'
import { useCart } from '@/components/providers/cart-provider'

export function ReserveBand() {
  const { openPlan, hasLead } = useCart()
  return (
    <section className="reserve" aria-labelledby="reserve-title">
      <img src="/images/suites/venue-garden.jpg" alt="" className="reserve-img" loading="lazy" />
      <div className="reserve-scrim" />
      <div className="reserve-inner">
        <span className="reserve-hairline" aria-hidden="true" />
        <h2 id="reserve-title" className="reserve-title">Reserve your rentals.</h2>
        <p className="reserve-line">Tell us the date. We hold the pieces, deliver, style, and collect.</p>
        <div className="reserve-actions">
          <button type="button" className="lux-cta !bg-[var(--theme-accent)] !text-[var(--theme-on-accent)]" onClick={() => openPlan()}>
            {hasLead ? 'Your event details' : 'Plan your event'}
          </button>
          <Link href="/catalog" className="reserve-ghost">Browse rentals</Link>
        </div>
      </div>
    </section>
  )
}
