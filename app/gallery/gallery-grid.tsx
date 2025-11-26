"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface GalleryImage {
    id: string
    src: string
    alt: string
    category: string
}

interface GalleryGridProps {
    images: GalleryImage[]
}

const categories = ["All", "Weddings", "Corporate", "Social"]

export default function GalleryGrid({ images }: GalleryGridProps) {
    const [filter, setFilter] = useState("All")

    const filteredImages = filter === "All" ? images : images.filter((img) => img.category === filter)

    return (
        <>
            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-6 mb-16"
            >
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`text-sm font-medium uppercase tracking-widest px-4 py-2 border-b-2 transition-all duration-300 ${filter === cat
                            ? "border-gold text-gold"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </motion.div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image) => (
                        <motion.div
                            layout
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className="relative aspect-square group overflow-hidden bg-secondary rounded-sm shadow-lg"
                        >
                            <Image
                                src={image.src || "/placeholder.svg"}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-center text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gold">{image.category}</p>
                                    <h3 className="font-serif text-2xl">{image.alt}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    )
}
