"use client"

import { motion } from "framer-motion"

interface GalleryHeroProps {
    title?: string
    description?: string
}

export default function GalleryHero({ title, description }: GalleryHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-16"
        >
            <h1 className="text-4xl md:text-6xl font-serif mb-6">{title}</h1>
            <p className="text-lg text-muted-foreground">
                {description}
            </p>
        </motion.div>
    )
}
