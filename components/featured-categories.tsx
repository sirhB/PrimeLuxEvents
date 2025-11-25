"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const categories = [
    {
        id: "seating",
        name: "Luxury Seating",
        description: "Velvet sofas, gold chivari chairs, and lounge sets.",
        image: "/luxury-seating.jpg", // Placeholder, user should replace
        size: "large", // spans 2 columns
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

interface FeaturedCategoriesProps {
    label: string
    title: string
    ctaText: string
}

export function FeaturedCategories({ label, title, ctaText }: FeaturedCategoriesProps) {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6"
                >
                    <div className="max-w-2xl">
                        <span className="text-primary text-sm font-medium tracking-widest uppercase mb-2 block">{label}</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-foreground">{title}</h2>
                    </div>
                    <ButtonLink href="/catalog" text={ctaText} />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative group overflow-hidden rounded-sm cursor-pointer ${category.size === "large" ? "md:col-span-2" : ""
                                }`}
                        >
                            <Link href={`/catalog?category=${category.id}`} className="block w-full h-full">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-3xl font-serif text-white mb-2">{category.name}</h3>
                                        <p className="text-white/80 max-w-md mb-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            {category.description}
                                        </p>
                                        <span className="inline-flex items-center text-white text-sm font-medium tracking-widest uppercase group-hover:text-primary transition-colors">
                                            Explore <ArrowRight className="ml-2 h-4 w-4" />
                                        </span>
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

function ButtonLink({ href, text }: { href: string; text: string }) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all duration-300"
        >
            {text}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
    )
}
