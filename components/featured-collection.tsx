import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { fetchFeaturedProducts } from "@/lib/catalog/queries"

export async function FeaturedCollection() {
  const featuredProducts = await fetchFeaturedProducts(8)

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="py-24 md:py-40 bg-[#1A1A1A] overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 mb-24 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-8 bg-gold/50" />
              <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">The Gallery</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-light text-white tracking-tight leading-[1.1]">Trending Masterpieces</h2>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center text-[10px] font-bold uppercase tracking-[0.4em] text-white hover:text-gold transition-all duration-500 pb-2 border-b border-white/10 hover:border-gold"
          >
            Explore Full Collection
            <ArrowRight className="ml-3 h-3 w-3 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>

      <div className="relative w-full z-10 overflow-x-auto pb-4">
        <div className="flex gap-6 px-6 md:px-12 min-w-max">
          {featuredProducts.map((product) => {
            const price = product.rental_price_daily || product.price
            const href = `/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`
            return (
              <Link
                key={product.id}
                href={href}
                className="group relative w-64 md:w-80 shrink-0"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 border border-white/10">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      sizes="320px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                      Coming soon
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70">
                    {product.categories?.name || 'Collection'}
                  </p>
                  <h3 className="font-serif text-xl text-white font-light line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-white/60">{formatCurrency(price)} <span className="text-[10px] uppercase tracking-widest">/ day</span></p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
