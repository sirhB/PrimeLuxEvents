import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Share2, Percent } from 'lucide-react'
import { getPartnerProfileForUser, getPartnerBaseDiscountPercent, getPartnerTierSettings } from '@/lib/auth/partners'
import { listPartnerSharedCarts } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { formatCentsWithCommas } from '@/lib/format-money'

export default async function PartnerHomePage() {
  const partner = await getPartnerProfileForUser()
  if (!partner) redirect('/account/partner/apply')
  if (partner.status !== 'active') redirect('/account/partner/apply')

  const basePercent = await getPartnerBaseDiscountPercent(partner)
  const tier = await getPartnerTierSettings(partner.tier)
  const { carts } = await listPartnerSharedCarts()
  const openCarts = (carts || []).filter((c: any) => ['shared', 'accepted'].includes(c.status))
  const nextCart = openCarts[0]

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--champagne,#B8956B)]/25 bg-gradient-to-br from-[#1c1917] via-[#2a2420] to-[#3d342c] px-8 py-14 text-[var(--linen,#F7F4EF)] md:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 20%, rgba(184,149,107,0.35), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(138,154,139,0.2), transparent 45%)',
          }}
        />
        <div className="relative max-w-xl space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--champagne,#B8956B)]">
            PrimeLux Preferred Partner
          </p>
          <h2 className="font-serif text-4xl font-light tracking-tight md:text-5xl">
            {partner.company_name}
          </h2>
          <p className="max-w-md text-sm font-light leading-relaxed text-white/70">
            {tier.label} trade rates at {basePercent}% off merchandise. Build a cart, share a
            review link with your client, collect from them, then settle your portion with us.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="rounded-full bg-[var(--champagne,#B8956B)] text-black hover:bg-white">
              <Link href="/catalog" className="gap-2">
                Build a cart <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/account/partner/carts">Shared carts</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
            <Percent className="h-4 w-4" />
            <h3 className="font-serif text-xl font-light">Your trade rate</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Base {basePercent}% off catalog merchandise, with volume tiers when you qualify.
            Delivery and setup are billed at standard rates.
          </p>
          <Button asChild variant="link" className="h-auto px-0 text-[var(--champagne,#B8956B)]">
            <Link href="/account/partner/rates">View rate card →</Link>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
            <Share2 className="h-4 w-4" />
            <h3 className="font-serif text-xl font-light">Client workflow</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {openCarts.length === 0
              ? 'No open client carts yet. Share from the bag icon when your selection is ready.'
              : nextCart
                ? `Next up: ${nextCart.client_name} — retail ${formatCentsWithCommas(nextCart.retail_total)}, you owe ${formatCentsWithCommas(nextCart.trade_total)}.`
                : null}
          </p>
          <Button asChild variant="link" className="h-auto px-0 text-[var(--champagne,#B8956B)]">
            <Link href="/account/partner/carts">Manage shared carts →</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
