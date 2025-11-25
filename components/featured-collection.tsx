"use client"

import Link from "next/link"
import Image from "next/image"
import { products } from "@/lib/data"
import { ArrowRight, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"

interface FeaturedCollectionProps {
  title: string
  description: string
  ctaText: string
}

export function FeaturedCollection({ title, description, ctaText }: FeaturedCollectionProps) {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 6)

  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-md">{description}</p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors"
          >
            {ctaText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <InfiniteScrollRow products={featuredProducts} direction="left" speed={25} />
      </div>
    </section>
  )
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  featured?: boolean
}

function InfiniteScrollRow({ products, direction, speed }: { products: Product[], direction: "left" | "right", speed: number }) {
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex gap-8 px-4"
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
  return (
    <motion.div
      className="flex-shrink-0 w-[300px] group relative"
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/catalog/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4 rounded-sm">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white/90 text-black px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wider backdrop-blur-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-4 h-4" /> View
            </span>
          </div>
        </div>
        <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
      </Link>
    </motion.div>
  )
}
