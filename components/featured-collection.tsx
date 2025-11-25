"use client"

import Link from "next/link"
import Image from "next/image"
import { products } from "@/lib/data"
import { ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"

export function FeaturedCollection() {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 6)

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Featured Rentals</h2>
            <p className="text-muted-foreground max-w-md">Hand-picked pieces that define luxury and elegance.</p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <AutoScrollCarousel products={featuredProducts} />
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

function AutoScrollCarousel({ products }: { products: Product[] }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -100 * products.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {/* Render products twice for seamless loop */}
        {[...products, ...products].map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            className="flex-shrink-0 w-[300px]"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link href={`/catalog/${product.id}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4 rounded-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-lg group-hover:underline decoration-1 underline-offset-4">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
