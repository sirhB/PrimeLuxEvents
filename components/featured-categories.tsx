"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

/** Links use catalog category *names* (catalog filters by name, not slug). */
const categories = [
  {
    id: "seating",
    name: "Seating",
    displayName: "Seating",
    description: "Sofas, chairs, and lounge sets for every layout.",
    image: "/luxury-seating.jpg",
  },
  {
    id: "tables",
    name: "Tables",
    displayName: "Tables",
    description: "Dining and cocktail tables that set the room.",
    image: "/statement-tables.jpg",
  },
  {
    id: "decor",
    name: "Decor",
    displayName: "Decor",
    description: "Vases, candelabras, and finishing accents.",
    image: "/decor-accents.jpg",
  },
  {
    id: "lighting",
    name: "Lighting",
    displayName: "Lighting",
    description: "Chandeliers, uplighting, and fixtures.",
    image: "/ambient-lighting.jpg",
  },
]

export function FeaturedCategories() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface)] py-24 md:py-36">
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl md:mb-16"
        >
          <p className="lux-label mb-4">Collection</p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-foreground md:text-6xl">
            Browse by category
          </h2>
          <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground md:text-lg">
            Start with the pieces that shape the room, then build from there.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.06 }}
            className="group relative min-h-[420px] overflow-hidden border-t border-border sm:border-l sm:first:border-l-0 lg:min-h-[520px]"
          >
            <Link
              href={`/catalog?category=${encodeURIComponent(category.name)}`}
              className="absolute inset-0 block"
            >
              <Image
                src={category.image}
                alt={category.displayName}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-serif text-3xl font-light tracking-tight text-white transition-colors duration-300 group-hover:text-[var(--champagne)]">
                  {category.displayName}
                </h3>
                <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-white/75">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                  View selection
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-4 block h-px w-10 origin-left scale-x-100 bg-[var(--champagne)] transition-transform duration-500 group-hover:scale-x-150" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-10 flex max-w-6xl justify-center px-6 md:mt-14 md:px-10">
        <Link href="/catalog" className="lux-cta-ghost group">
          Full catalog
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}
