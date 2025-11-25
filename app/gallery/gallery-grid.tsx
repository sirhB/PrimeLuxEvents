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
                className="flex justify-center gap-4 mb-12"
            >
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                        onClick={() => setFilter(cat)}
                        className={`text-sm font-medium uppercase tracking-widest px-4 py-2 border-b-2 transition-colors ${filter === cat
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </motion.div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            whileHover={{ y: -10 }}
                            className="relative aspect-square group overflow-hidden bg-secondary rounded-sm"
                        >
                            <Image
                                src={image.src || "/placeholder.svg"}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileHover={{ y: 0, opacity: 1 }}
                                    className="text-center text-white p-4"
                                >
                                    <p className="text-sm font-medium uppercase tracking-widest mb-2">{image.category}</p>
                                    <h3 className="font-serif text-xl">{image.alt}</h3>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    )
}
