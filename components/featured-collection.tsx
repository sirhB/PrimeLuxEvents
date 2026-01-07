"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Eye, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  categories?: { name: string, slug?: string } | null
  rental_price_daily?: number
  is_featured?: boolean
  slug?: string
}

export function FeaturedCollection() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFeaturedProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_featured', true)
        .limit(8)

      if (data) {
        setFeaturedProducts(data)
      }
      setLoading(false)
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-24 md:py-40 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full border-2 border-gold/10 border-t-gold animate-spin" />
            <div className="text-gold/40 text-[10px] font-bold tracking-[0.4em] uppercase">Curating the gallery</div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="py-24 md:py-40 bg-[#1A1A1A] overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 mb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-end gap-10"
        >
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
        </motion.div>
      </div>

      <div className="relative w-full z-10">
        {/* Subtle masks for the scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-48 z-10 bg-gradient-to-r from-[#1A1A1A] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-48 z-10 bg-gradient-to-l from-[#1A1A1A] to-transparent pointer-events-none" />

        <InfiniteScrollRow products={featuredProducts} direction="left" speed={60} />
      </div>
    </section>
  )
}

function InfiniteScrollRow({ products, direction, speed }: { products: Product[], direction: "left" | "right", speed: number }) {
  return (
    <div className="flex overflow-hidden py-10">
      <motion.div
        className="flex gap-16 px-8"
        initial={{ x: direction === "left" ? 0 : -1000 }}
        animate={{ x: direction === "left" ? "-50%" : "0%" }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ width: "max-content" }}
      >
        {[...products, ...products, ...products, ...products].map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </motion.div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const price = product.rental_price_daily || product.price

  return (
    <motion.div
      className="flex-shrink-0 w-[420px] group relative"
      whileHover={{ y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1E1E1E] mb-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-700 border border-white/5">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
              <Eye className="w-3.5 h-3.5" /> Discovery Details
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 px-4">
          <h3 className="font-serif text-2xl font-light text-white group-hover:text-gold transition-colors tracking-tight leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-6 bg-white/10" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold decoration-gold/30 underline underline-offset-4">{formatCurrency(price)} <span className="text-[8px] opacity-50 font-normal">/ day</span></p>
            <span className="h-px w-6 bg-white/10" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
