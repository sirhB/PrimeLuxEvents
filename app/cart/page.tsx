'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { createClient } from '@/lib/supabase/client'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RentalInfoBanner } from '@/components/customer/rental-info-banner'
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

const MINIMUM_ORDER = 15000 // cents

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, cartCount, isLoaded, eventDetails } = useCart()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const productIds = items.filter((i) => i.productId).map((i) => i.productId!)
      if (productIds.length === 0) {
        setProducts([])
        return
      }
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price_cents, image_url, category_id')
        .in('id', productIds)
      setProducts(data || [])
    }
    if (isLoaded) load()
  }, [items, isLoaded])

  const subtotal = items.reduce((acc, item) => {
    if (item.packageId && item.packageData) {
      return acc + resolvePriceCents({ price: item.packageData.price }) * item.quantity
    }
    if (item.productId) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return acc
      const price = resolvePriceCents(product)
      const modifiersPrice = Object.values(item.modifiers || {}).reduce(
        (mAcc: number, curr: any) => mAcc + (curr.priceAdjustment || 0),
        0,
      )
      return acc + (price + modifiersPrice) * item.quantity
    }
    return acc
  }, 0)

  const canCheckout = subtotal >= MINIMUM_ORDER && items.length > 0
  const remaining = Math.max(0, MINIMUM_ORDER - subtotal)

  if (!isLoaded) {
    return (
      <main className="page-shell pt-28 pb-20">
        <div className="container max-w-4xl mx-auto px-4 text-muted-foreground font-light">
          Loading your rental…
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell pt-28 pb-24 md:pb-20">
      <div className="container max-w-5xl mx-auto px-4 md:px-6 space-y-10">
        <header className="space-y-3">
          <p className="lux-label">Your rental</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight">
            Cart
          </h1>
          <p className="text-muted-foreground font-light max-w-xl">
            Review quantities, then continue to event details and secure checkout.
            {eventDetails?.date
              ? ` Event date on file: ${new Date(eventDetails.date).toLocaleDateString()}.`
              : ' You can set your event date in the next step.'}
          </p>
        </header>

        <RentalInfoBanner />

        {items.length === 0 ? (
          <div className="surface-panel rounded-md px-8 py-16 text-center space-y-6">
            <ShoppingBag className="h-10 w-10 text-gold mx-auto opacity-60" />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-light">Your cart is empty</h2>
              <p className="text-muted-foreground font-light">
                Browse the collection to start building your rental.
              </p>
            </div>
            <Link href="/catalog" className="lux-cta inline-flex">
              Browse collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            <ul className="space-y-4">
              {items.map((item) => {
                const product = item.productId
                  ? products.find((p) => p.id === item.productId)
                  : null
                const name =
                  item.packageData?.name || product?.name || 'Rental item'
                const image =
                  item.packageData?.image_url || product?.image_url || '/placeholder.jpg'
                const unit = item.packageData
                  ? resolvePriceCents({ price: item.packageData.price })
                  : product
                    ? resolvePriceCents(product)
                    : 0
                const line = unit * item.quantity

                return (
                  <li
                    key={item.id}
                    className="surface-panel rounded-md p-4 sm:p-5 flex gap-4"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius)] bg-[var(--surface-muted)]">
                      <Image src={image} alt={name} fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex justify-between gap-4">
                        <h2 className="font-serif text-lg font-light truncate">{name}</h2>
                        <p className="font-medium text-gold shrink-0">{formatCurrency(line)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center border border-border rounded-[var(--radius-cta)]">
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center hover:text-gold"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center hover:text-gold"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 flex items-center gap-1.5"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <aside className="surface-panel rounded-md p-6 space-y-5 lg:sticky lg:top-28">
              <p className="lux-label">Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{cartCount} item{cartCount === 1 ? '' : 's'}</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Delivery fees and tax are calculated at checkout from your venue address.
              </p>
              {!canCheckout && (
                <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                  Minimum order {formatCurrency(MINIMUM_ORDER)}. Add {formatCurrency(remaining)} more to continue.
                </p>
              )}
              <Button
                className={cn('lux-cta w-full !h-12')}
                disabled={!canCheckout}
                onClick={() => router.push('/checkout')}
              >
                Continue to checkout <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                href="/catalog"
                className="block text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
              >
                Keep browsing
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
