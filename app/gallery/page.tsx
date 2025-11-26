"use client"

import { getSiteContent } from "@/lib/content"
import GalleryGrid from "./gallery-grid"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function GalleryPage() {
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      const data = await getSiteContent()
      setContent(data)
      setLoading(false)
    }
    loadContent()
  }, [])

  if (loading) return null

  const images = content['gallery.images'] || []

  return (
    <div className="py-20 md:py-32 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-serif mb-8 text-foreground">{content['gallery.hero.title']}</h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            {content['gallery.hero.description']}
          </p>
        </motion.div>

        <GalleryGrid images={images} />
      </div>
    </div>
  )
}
