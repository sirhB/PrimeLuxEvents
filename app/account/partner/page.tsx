import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Share2 } from 'lucide-react'
import { getPartnerProfileForUser, getPartnerBaseDiscountPercent, getPartnerTierSettings } from '@/lib/auth/partners'
import { listPartnerSharedCarts } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { formatCentsWithCommas } from '@/lib/format-money'
import { StatusChip } from '@/components/shared/status-chip'

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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-md border border-gold/20 bg-gradient-to-br from-[#1c1917] via-[#2a2420] to-[#3d342c] px-8 py-12 text-[var(--linen,#F7F4EF)] md:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 20%, rgba(184,149,107,0.35), transparent 50%)',
          }}
        />
        <div className="relative max-w-xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
              Preferred partner
            </p>
            <StatusChip status="active" className="border-gold/30 bg-gold/10 text-gold" />
          </div>
          <h2 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
            {partner.company_name}
          </h2>
          <p className="text-sm font-light text-white/70">
            One job: build a client cart at your {tier.label} trade rate ({basePercent}% off merchandise).
          </p>
          <Button asChild className="rounded-[var(--radius-cta)] bg-gold text-black hover:bg-white">
            <Link href="/catalog" className="gap-2">
              Build a client cart <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="surface-panel rounded-md border border-border p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Share2 className="mt-1 h-5 w-5 text-gold shrink-0" />
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Open client carts
            </p>
            <p className="font-serif text-4xl font-light tabular-nums text-foreground">
              {openCarts.length}
            </p>
            {nextCart ? (
              <p className="text-sm text-muted-foreground font-light">
                Next: {nextCart.client_name} — you owe{' '}
                {formatCentsWithCommas(nextCart.trade_total)} after they pay you retail.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-light">
                No open carts. Start from the catalog, then share from the bag icon.
              </p>
            )}
            <Link
              href="/account/partner/carts"
              className="inline-flex text-sm text-gold underline-offset-2 hover:underline"
            >
              Manage shared carts →
            </Link>
          </div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        <Link href="/account/partner/rates" className="underline underline-offset-2 hover:text-gold">
          Rate card
        </Link>
        {' · '}
        <Link href="/account/partner/branding" className="underline underline-offset-2 hover:text-gold">
          Invoice branding
        </Link>
        {' · '}
        <Link href="/account/partner/payments" className="underline underline-offset-2 hover:text-gold">
          Payment info
        </Link>
      </p>
    </div>
  )
}
