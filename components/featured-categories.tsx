"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const categories = [
    {
        id: "seating",
        name: "Luxury Seating",
        description: "Velvet sofas, gold chivari chairs, and bespoke lounge sets.",
        image: "/luxury-seating.jpg",
        size: "large",
    },
    {
        id: "tables",
        name: "Statement Tables",
        description: "Hand-crafted dining and cocktail tables.",
        image: "/statement-tables.jpg",
        size: "medium",
    },
    {
        id: "decor",
        name: "Decor & Accents",
        description: "Vases, candelabras, and unique props.",
        image: "/decor-accents.jpg",
        size: "small",
    },
    {
        id: "lighting",
        name: "Ambient Lighting",
        description: "Chandeliers, uplighting, and neon signs.",
        image: "/ambient-lighting.jpg",
        size: "medium",
    },
]

export function FeaturedCategories() {
    return (
        <section className="py-24 md:py-40 bg-[#FDFBF7] relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8"
                >
                    <div className="max-w-2xl">
                        <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Curated Collections</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-light text-gray-900 tracking-tight">Explore by Category</h2>
                    </div>
                    <Link
                        href="/catalog"
                        className="group inline-flex items-center justify-center px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#1A1A1A] rounded-full hover:bg-gold hover:text-black transition-all duration-500"
                    >
                        View Full Catalog
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[450px]">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative group overflow-hidden rounded-3xl cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.04)] ${category.size === "large" ? "md:col-span-2" : ""
                                }`}
                        >
                            <Link href={`/catalog?category=${category.id}`} className="block w-full h-full">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-3xl md:text-4xl font-serif text-white font-light tracking-tight">{category.name}</h3>
                                        <p className="text-white/70 max-w-md text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            {category.description}
                                        </p>
                                        <div className="pt-2">
                                            <span className="inline-flex items-center text-gold text-[10px] font-bold uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                                                Discover Collection <ArrowRight className="ml-2 h-3 w-3" />
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
