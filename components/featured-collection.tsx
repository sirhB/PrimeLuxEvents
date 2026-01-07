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
      <section className="py-24 md:py-40 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
            <div className="text-gold font-serif text-xl font-light tracking-widest uppercase">Curating Collection...</div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="py-24 md:py-40 bg-[#FDFBF7] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end gap-8"
        >
          <div className="max-w-2xl">
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4 block">The Gallery</span>
            <h2 className="text-4xl md:text-6xl font-serif font-light text-gray-900 tracking-tight">Trending in the Catalog</h2>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gold transition-colors"
          >
            View Full Collection
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#FDFBF7] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none" />

        <InfiniteScrollRow products={featuredProducts} direction="left" speed={40} />
      </div>
    </section>
  )
}

function InfiniteScrollRow({ products, direction, speed }: { products: Product[], direction: "left" | "right", speed: number }) {
  return (
    <div className="flex overflow-hidden py-10">
      <motion.div
        className="flex gap-10 px-5"
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
      className="flex-shrink-0 w-[350px] group relative"
      whileHover={{ y: -15 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Link href={`/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white mb-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 border border-border/5">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="flex gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
              <span className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl">
                <Eye className="w-3 h-3" /> Quick View
              </span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-gold transition-colors tracking-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-border/50" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{formatCurrency(price)} / Day</p>
            <span className="w-8 h-px bg-border/50" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
