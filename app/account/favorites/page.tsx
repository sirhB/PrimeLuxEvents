import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { FavoriteButton } from '@/components/account/favorite-button'
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-light tracking-tight">Favorites</h1>
        <p className="text-muted-foreground">Pieces you have saved for your next event.</p>
      </div>

      {!favorites?.length ? (
        <Card className="border-dashed">
          <CardContent className="space-y-4 py-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No favorites yet. Browse the collection and tap the heart on any piece.</p>
            <Button asChild className="rounded-full">
              <Link href="/catalog">Browse collection</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => {
            const product = fav.products
            if (!product) return null
            const href = `/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`
            const price = resolvePriceCents(product)
            return (
              <Card key={fav.id} className="overflow-hidden border-border/60 bg-white/80">
                <div className="relative aspect-[4/5] bg-[var(--linen,#F7F4EF)]">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-contain p-6" />
                  ) : null}
                  <div className="absolute right-3 top-3">
                    <FavoriteButton productId={product.id} initialFavorited />
                  </div>
                </div>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {product.categories?.name || 'Collection'}
                    </p>
                    <Link href={href} className="font-serif text-xl font-light hover:text-[var(--champagne,#B8956B)]">
                      {product.name}
                    </Link>
                  </div>
                  <p className="text-lg">{formatCurrency(price)} <span className="text-xs uppercase tracking-widest text-muted-foreground">/ day</span></p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
