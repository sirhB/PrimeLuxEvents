'use client'

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
            {/* Enhanced Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center gap-4 mb-12"
            >
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`text-sm font-medium uppercase tracking-widest px-4 py-2 border-b-2 transition-all duration-300 relative overflow-hidden ${
                            filter === cat
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <motion.div
                            initial={false}
                            animate={{
                                width: filter === cat ? "100%" : "0%",
                                height: "2px",
                                backgroundColor: "hsl(var(--primary))"
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0"
                        />
                        {cat}
                    </motion.button>
                ))}
            </motion.div>

            {/* Enhanced Grid with Staggered Animations */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                layout: { duration: 0.3 }
                            }}
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            className="relative aspect-square group overflow-hidden bg-secondary shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <Image
                                    src={image.src || "/placeholder.svg"}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>

                            {/* Enhanced Overlay with Animations */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end"
                            >
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileHover={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="text-center text-white p-6 w-full"
                                >
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2, delay: 0.2 }}
                                        className="text-sm font-medium uppercase tracking-widest mb-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block"
                                    >
                                        {image.category}
                                    </motion.p>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                        className="font-serif text-xl"
                                    >
                                        {image.alt}
                                    </motion.h3>
                                </motion.div>
                            </motion.div>

                            {/* Shine effect */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    )
}
