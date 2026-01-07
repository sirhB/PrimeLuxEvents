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
        <section className="py-24 md:py-48 bg-[#1A1A1A] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10"
                >
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px w-8 bg-gold/50" />
                            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Curated Collections</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-serif font-light text-white tracking-tight leading-[1.1]">The Art of the Archive</h2>
                    </div>
                    <Link
                        href="/catalog"
                        className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-transparent px-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all duration-500 hover:border-gold"
                    >
                        <div className="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 group-hover:translate-y-0" />
                        <span className="relative z-10 group-hover:text-black transition-colors duration-500 flex items-center gap-3">
                            Check Availability <ArrowRight className="h-4 w-4" />
                        </span>
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 auto-rows-[550px]">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`relative group overflow-hidden rounded-[2.5rem] cursor-pointer border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] ${category.size === "large" ? "md:col-span-2" : ""
                                }`}
                        >
                            <Link href={`/catalog?category=${category.id}`} className="block w-full h-full relative">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700" />

                                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <span className="text-gold text-[9px] font-bold uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 block">Unique Series</span>
                                            <h3 className="text-4xl md:text-5xl font-serif text-white font-light tracking-tight leading-tight">{category.name}</h3>
                                        </div>

                                        <p className="text-gray-400 max-w-md text-base font-light leading-relaxed h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 overflow-hidden">
                                            {category.description}
                                        </p>

                                        <div className="pt-4 border-t border-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left">
                                            <span className="inline-flex items-center text-gold text-[10px] font-bold uppercase tracking-[0.4em] group-hover:text-white transition-colors">
                                                Discover Selection <ArrowRight className="ml-3 h-3 w-3 transition-transform group-hover:translate-x-2" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-8 left-8 p-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <ArrowRight className="w-5 h-5 text-gold -rotate-45" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
