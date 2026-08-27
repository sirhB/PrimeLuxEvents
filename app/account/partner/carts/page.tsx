import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { listPartnerSharedCarts } from '@/app/actions/partners'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Button } from '@/components/ui/button'

const statusLabel: Record<string, string> = {
  shared: 'Awaiting settle-up',
  accepted: 'Client reviewed',
  settled: 'Paid to PrimeLux',
  cancelled: 'Cancelled',
  expired: 'Expired',
  draft: 'Draft',
}

export default async function PartnerCartsPage() {
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  const { carts } = await listPartnerSharedCarts()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
            Shared carts
          </p>
          <h2 className="font-serif text-3xl font-light tracking-tight">Client selections</h2>
          <p className="max-w-lg text-sm text-muted-foreground">
            Each link shows retail pricing only. After your client pays you, settle the trade total
            with PrimeLux here.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/catalog">New selection</Link>
        </Button>
      </div>

      {!carts?.length ? (
        <div className="rounded-2xl border border-dashed border-[var(--champagne,#B8956B)]/40 px-6 py-16 text-center">
          <p className="font-serif text-xl font-light">No shared carts yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Build a cart in the catalog, then choose &ldquo;Share with client&rdquo; from the bag.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70 border-t border-[var(--champagne,#B8956B)]/20">
          {carts.map((cart: any) => (
            <li key={cart.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/account/partner/carts/${cart.id}`}
                  className="font-serif text-lg font-light hover:text-[var(--champagne,#B8956B)]"
                >
                  {cart.title || cart.client_name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {cart.client_name}
                  {cart.event_date
                    ? ` · ${new Date(cart.event_date).toLocaleDateString()}`
                    : ''}
                  {' · '}
                  {statusLabel[cart.status] || cart.status}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Client (retail)
                  </p>
                  <p>{formatCentsWithCommas(cart.retail_total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    You owe
                  </p>
                  <p className="font-medium text-[var(--champagne,#B8956B)]">
                    {formatCentsWithCommas(cart.trade_total)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/account/partner/carts/${cart.id}`}>Open</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
