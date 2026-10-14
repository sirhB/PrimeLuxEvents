import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PartnersMarketingPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 py-28 md:px-8 md:py-36">
        <p className="lux-label">Preferred vendors</p>
        <h1 className="mt-4 font-serif text-5xl font-medium leading-none md:text-7xl">Partners</h1>
        <p className="mt-5 max-w-md font-light leading-relaxed text-[var(--theme-muted)]">
          Trade rates and client share carts for planners and decorators who list Prime Lux as their rental house.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup?next=/account/partner/apply" className="lux-cta">
            Apply <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login?next=/account/partner/apply" className="lux-cta-ghost">
            Partner login
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 py-20 md:px-12">
        <h2 className="font-serif text-3xl font-light">How it works</h2>
        <ol className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1. Apply &amp; get approved</span>
            <br />
            Tell us about your studio. Once active, your portal unlocks trade pricing.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Build &amp; share a cart</span>
            <br />
            Curate rentals, then send your client a review-only link with retail totals — no
            client checkout on PrimeLux.
          </li>
          <li>
            <span className="font-medium text-foreground">3. Collect, then settle</span>
            <br />
            Invoice your client yourself. Pay PrimeLux your trade portion from the partner
            portal when you are ready to book.
          </li>
        </ol>
      </section>
    </div>
  )
}
