import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { FavoriteButton } from '@/components/account/favorite-button'
import { BuildRentalFromFavorites } from '@/components/account/build-rental-from-favorites'
import { formatCurrency } from '@/lib/utils'
import { resolvePriceCents } from '@/lib/catalog/adapters'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: favorites } = await supabase
    .from('favorites')
    .select('id, product_id, products(id, name, slug, image_url, price_cents, categories(name, slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const productIds = (favorites || [])
    .map((f: any) => f.products?.id)
    .filter(Boolean) as string[]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="lux-label">Saved pieces</p>
          <h1 className="font-serif text-3xl font-light tracking-tight">Favorites</h1>
          <p className="text-muted-foreground font-light">
            Pieces you saved — add them to a rental cart when you&apos;re ready.
          </p>
        </div>
        {productIds.length > 0 && <BuildRentalFromFavorites productIds={productIds} />}
      </div>

      {!favorites?.length ? (
        <div className="surface-panel rounded-md border-dashed px-6 py-12 text-center space-y-4">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground font-light">
            No favorites yet. Browse the collection and tap the heart on any piece.
          </p>
          <Link href="/catalog" className="lux-cta inline-flex">
            Browse collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => {
            const product = fav.products
            if (!product) return null
            const href = `/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`
            const price = resolvePriceCents(product)
            return (
              <div key={fav.id} className="surface-panel rounded-md overflow-hidden">
                <div className="relative aspect-[4/5] bg-[var(--surface-muted)]">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-contain p-6" />
                  ) : null}
                  <div className="absolute right-3 top-3">
                    <FavoriteButton productId={product.id} initialFavorited />
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {product.categories?.name || 'Collection'}
                    </p>
                    <Link href={href} className="font-serif text-xl font-light hover:text-gold">
                      {product.name}
                    </Link>
                  </div>
                  <p className="text-lg text-gold">
                    {formatCurrency(price)}{' '}
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">/ day</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
