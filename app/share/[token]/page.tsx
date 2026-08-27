import { getSharedCartByToken } from '@/app/actions/partners'
import { formatCentsWithCommas } from '@/lib/format-money'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default async function SharedCartPublicPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await getSharedCartByToken(token)

  if (result.error || !result.cart) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl font-light">Selection unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">{result.error}</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">
          Back to PrimeLux
        </Link>
      </div>
    )
  }

  const { cart, partner, products } = result
  const productMap = new Map((products || []).map((p: any) => [p.id, p]))

  return (
    <div className="min-h-screen bg-[var(--linen,#F7F4EF)]">
      <div className="relative overflow-hidden border-b border-[var(--champagne,#B8956B)]/20 bg-gradient-to-br from-[#1c1917] via-[#2a2420] to-[#3d342c] px-6 py-16 text-[var(--linen,#F7F4EF)] md:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 30% 0%, rgba(184,149,107,0.4), transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--champagne,#B8956B)]">
            Prepared by {partner?.company_name || 'your planner'}
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tight md:text-5xl">
            {cart.title || `${cart.client_name}'s selection`}
          </h1>
          <p className="max-w-xl text-sm font-light text-white/70">
            Review the curated rental selection for your event. Payment is handled by your planner
            — this page is for review only.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-12 md:px-12">
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--champagne,#B8956B)]/30 bg-white/70 px-5 py-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne,#B8956B)]" />
          <p className="text-sm text-muted-foreground">
            There is no checkout on this link. Your planner will collect payment and coordinate
            delivery with PrimeLux Events.
          </p>
        </div>

        {(cart.event_date || cart.venue_address) && (
          <div className="space-y-1 text-sm">
            {cart.event_date && (
              <p>
                <span className="text-muted-foreground">Event date · </span>
                {new Date(cart.event_date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            {cart.event_type && (
              <p>
                <span className="text-muted-foreground">Occasion · </span>
                {cart.event_type}
              </p>
            )}
            {cart.venue_address && (
              <p>
                <span className="text-muted-foreground">Venue · </span>
                {cart.venue_address}
              </p>
            )}
          </div>
        )}

        {cart.notes && (
          <blockquote className="border-l-2 border-[var(--champagne,#B8956B)]/50 pl-4 text-sm italic text-muted-foreground">
            {cart.notes}
          </blockquote>
        )}

        <ul className="divide-y divide-border/70 border-y border-[var(--champagne,#B8956B)]/20">
          {(cart.items || []).map((item: any, idx: number) => {
            if (item.packageId && item.packageData) {
              const price = resolvePriceCents({ price: item.packageData.price })
              return (
                <li key={idx} className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="font-serif text-lg font-light">{item.packageData.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--champagne,#B8956B)]">
                      Package · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatCentsWithCommas(price * item.quantity)}</p>
                </li>
              )
            }
            const product = item.productId ? productMap.get(item.productId) : null
            const unit = product ? resolvePriceCents(product) : 0
            const modifiersPrice = Object.values(item.modifiers || {}).reduce(
              (acc: number, curr: any) => acc + (curr.priceAdjustment || 0),
              0,
            )
            return (
              <li key={idx} className="flex items-center justify-between gap-4 py-5">
                <div className="flex items-center gap-4">
                  {product?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-16 w-14 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-serif text-lg font-light">
                      {product?.name || 'Rental item'}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm">
                  {formatCentsWithCommas((unit + modifiersPrice) * item.quantity)}
                </p>
              </li>
            )
          })}
        </ul>

        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCentsWithCommas(cart.retail_subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Setup</span>
            <span>{formatCentsWithCommas(cart.retail_setup_fee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCentsWithCommas(cart.retail_tax_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatCentsWithCommas(cart.retail_delivery_fee)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-serif text-xl font-light">
            <span>Total</span>
            <span>{formatCentsWithCommas(cart.retail_total)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Questions about this selection? Reach out to{' '}
          {partner?.company_name || 'your event planner'}.
        </p>
      </div>
    </div>
  )
}
