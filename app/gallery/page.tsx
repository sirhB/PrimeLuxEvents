"use client"

import GalleryGrid from "./gallery-grid"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function GalleryPage() {
  const [content, setContent] = useState<any>({})

  useEffect(() => {
    import("@/lib/content").then((mod) => {
      mod.getSiteContent().then(setContent)
    })
  }, [])

  const images = content['gallery.images'] || []

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-serif mb-6">{content['gallery.hero.title']}</h1>
          <p className="text-lg text-muted-foreground">
            {content['gallery.hero.description']}
          </p>
        </motion.div>

        <GalleryGrid images={images} />
      </div>
    </div>
  )
}
