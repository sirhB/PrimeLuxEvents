import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CalendarDays, Gem, Share2, Percent, TrendingUp } from 'lucide-react'
import {
  getPartnerProfileForUser,
  getPartnerBaseDiscountPercent,
  getPartnerTierSettings,
} from '@/lib/auth/partners'
import { getPartnerReportingStats, listPartnerSharedCarts } from '@/app/actions/partners'
import { getPartnerPerks } from '@/lib/partners/perks'
import { Button } from '@/components/ui/button'
import { formatCentsWithCommas } from '@/lib/format-money'

export default async function PartnerHomePage() {
  const partner = await getPartnerProfileForUser()
  if (!partner) redirect('/account/partner/apply')
  if (partner.status !== 'active') redirect('/account/partner/apply')

  const basePercent = await getPartnerBaseDiscountPercent(partner)
  const tier = await getPartnerTierSettings(partner.tier)
  const { carts } = await listPartnerSharedCarts()
  const stats = await getPartnerReportingStats()
  const perks = getPartnerPerks(partner.tier, tier.hold_hours, basePercent)
  const openCarts = (carts || []).filter((c: { status: string }) =>
    ['shared', 'accepted'].includes(c.status),
  )
  const nextCart = openCarts[0] as
    | { client_name: string; retail_total: number; trade_total: number }
    | undefined

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
            {tier.label} trade rates at {basePercent}% off merchandise. Build a cart, send a
            white-label invoice to your client, collect from them, then settle your portion with us.
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
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/account/partner/branding">Invoice branding</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/account/partner/payments">Client payment info</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[var(--champagne,#B8956B)]/20 pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Your reporting
        </p>
        <h3 className="font-serif text-2xl font-light tracking-tight">Activity at a glance</h3>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
              <CalendarDays className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Events</span>
            </div>
            <p className="font-serif text-3xl font-light tabular-nums">{stats.eventsCount}</p>
            <p className="text-xs text-muted-foreground">
              Client carts in your pipeline ({stats.openCarts} open)
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">GMV</span>
            </div>
            <p className="font-serif text-3xl font-light tabular-nums">
              {formatCentsWithCommas(stats.gmvCents)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.settledOrders} attributed order{stats.settledOrders === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
              <Percent className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Trade savings</span>
            </div>
            <p className="font-serif text-3xl font-light tabular-nums">
              {formatCentsWithCommas(stats.tradeSavingsCents)}
            </p>
            <p className="text-xs text-muted-foreground">Retail vs trade on settled carts</p>
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

      <section className="space-y-4 border-t border-[var(--champagne,#B8956B)]/20 pt-10">
        <div className="flex items-center gap-2 text-[var(--champagne,#B8956B)]">
          <Gem className="h-4 w-4" />
          <h3 className="font-serif text-xl font-light">{tier.label} perks</h3>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          Benefits included with your {tier.label} membership. Hold windows and rates scale with
          tier.
        </p>
        <ul className="divide-y divide-border/60">
          {perks.map((perk) => (
            <li key={perk.id} className="py-4">
              <p className="text-sm font-medium">{perk.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{perk.detail}</p>
            </li>
          ))}
        </ul>
        <Button asChild variant="link" className="h-auto px-0 text-[var(--champagne,#B8956B)]">
          <Link href="/account/partner/rates">See full rate card →</Link>
        </Button>
      </section>
    </div>
  )
}
