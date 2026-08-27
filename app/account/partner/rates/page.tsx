import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  getPartnerProfileForUser,
  getPartnerBaseDiscountPercent,
  getPartnerTierSettings,
} from '@/lib/auth/partners'
import { createClient } from '@/lib/supabase/server'
import { formatCentsWithCommas } from '@/lib/format-money'

export default async function PartnerRatesPage() {
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  const basePercent = await getPartnerBaseDiscountPercent(partner)
  const tier = await getPartnerTierSettings(partner.tier)
  const supabase = await createClient()
  const { data: discounts } = await supabase
    .from('tiered_discounts')
    .select('*')
    .eq('is_active', true)
    .order('min_cart_total', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Trade rates
        </p>
        <h2 className="font-serif text-3xl font-light tracking-tight">
          {tier.label} · {basePercent}% base
        </h2>
        <p className="text-sm text-muted-foreground">
          These rates apply when you settle with PrimeLux. Your client-facing share link always
          shows retail pricing — you keep the difference after collecting from them.
        </p>
      </div>

      <div className="space-y-4 border-t border-[var(--champagne,#B8956B)]/20 pt-8">
        <h3 className="font-serif text-xl font-light">Volume ladder</h3>
        <p className="text-sm text-muted-foreground">
          You receive the greater of your base trade rate or the best volume tier you qualify for
          (not stacked on the same merchandise twice).
        </p>
        <ul className="divide-y divide-border/60">
          <li className="flex items-center justify-between py-3 text-sm">
            <span>Base {tier.label} trade</span>
            <span className="font-medium">{basePercent}% off</span>
          </li>
          {(discounts || []).map((d: any) => (
            <li key={d.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                Cart from {formatCentsWithCommas(d.min_cart_total)} · {d.name}
              </span>
              <span className="font-medium">
                {d.discount_type === 'percentage'
                  ? `${d.discount_value}% off`
                  : formatCentsWithCommas(d.discount_value)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Questions about your tier?{' '}
        <Link href="/account/messages" className="underline underline-offset-2">
          Message the team
        </Link>
        .
      </p>
    </div>
  )
}
