import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function PartnersMarketingPage() {
  return (
    <div className="bg-[var(--linen,#F7F4EF)]">
      <section className="relative min-h-[78vh] overflow-hidden bg-gradient-to-br from-[#1c1917] via-[#2a2420] to-[#3d342c] px-6 py-24 text-[var(--linen,#F7F4EF)] md:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 20%, rgba(184,149,107,0.45), transparent 50%), url(/open-planner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />
        <div className="relative mx-auto flex max-w-3xl flex-col justify-end gap-6 pt-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--champagne,#B8956B)]">
            Preferred vendor program
          </p>
          <h1 className="font-serif text-5xl font-light tracking-tight md:text-6xl">
            PrimeLux
          </h1>
          <p className="max-w-md text-base font-light leading-relaxed text-white/75">
            Trade rates and client share carts for planners and decorators who list us as their
            preferred rental house.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="rounded-full bg-[var(--champagne,#B8956B)] text-black hover:bg-white">
              <Link href="/signup?next=/account/partner/apply" className="gap-2">
                Apply to partner <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/login?next=/account/partner/apply">Partner login</Link>
            </Button>
          </div>
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
