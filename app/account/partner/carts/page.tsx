import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { listPartnerSharedCarts } from '@/app/actions/partners'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/shared/status-chip'

export default async function PartnerCartsPage() {
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  const { carts } = await listPartnerSharedCarts()
  const open = (carts || []).filter((c: any) => ['shared', 'accepted', 'draft'].includes(c.status))
  const settled = (carts || []).filter((c: any) => !['shared', 'accepted', 'draft'].includes(c.status))

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="lux-label">Client events</p>
          <h2 className="font-serif text-3xl font-light tracking-tight">Shared carts</h2>
          <p className="max-w-lg text-sm text-muted-foreground font-light">
            One cart per client event. Retail for them; trade settle-up for you.
          </p>
        </div>
        <Button asChild className="rounded-[var(--radius-cta)]">
          <Link href="/catalog">New client cart</Link>
        </Button>
      </div>

      {!carts?.length ? (
        <div className="rounded-md border border-dashed border-gold/40 px-6 py-16 text-center space-y-3">
          <p className="font-serif text-xl font-light">No client carts yet</p>
          <p className="text-sm text-muted-foreground">
            Build a cart in the catalog, then choose “Share with client” from the bag.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Needs action ({open.length})
            </h3>
            {open.length === 0 ? (
              <p className="text-sm text-muted-foreground">All clear — no open carts.</p>
            ) : (
              <ul className="space-y-3">
                {open.map((cart: any) => (
                  <li key={cart.id}>
                    <Link
                      href={`/account/partner/carts/${cart.id}`}
                      className="surface-panel flex flex-col gap-3 rounded-md border border-border p-5 transition-colors hover:border-gold/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-serif text-lg font-light">
                            {cart.title || cart.client_name}
                          </p>
                          <StatusChip status={cart.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cart.client_name}
                          {cart.event_date
                            ? ` · Event ${new Date(cart.event_date).toLocaleDateString()}`
                            : ' · Event date TBD'}
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
                          <p className="font-medium text-gold">
                            {formatCentsWithCommas(cart.trade_total)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {settled.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Closed ({settled.length})
              </h3>
              <ul className="divide-y divide-border border-t border-border">
                {settled.map((cart: any) => (
                  <li
                    key={cart.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/account/partner/carts/${cart.id}`}
                        className="font-serif text-base font-light hover:text-gold"
                      >
                        {cart.title || cart.client_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {cart.event_date
                          ? new Date(cart.event_date).toLocaleDateString()
                          : 'No event date'}
                      </p>
                    </div>
                    <StatusChip status={cart.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
