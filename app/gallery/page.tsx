import { getSiteContent } from "@/lib/content"
import { motion } from "framer-motion"
import GalleryGrid from "./gallery-grid"

export default async function GalleryPage() {
  const content = await getSiteContent()
  const images = content['gallery.images'] || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background"
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-4xl md:text-6xl font-serif mb-6"
            >
              {content['gallery.hero.title']}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              {content['gallery.hero.description']}
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="container mx-auto px-4 md:px-6 pb-20">
          <GalleryGrid images={images} />
        </div>
      </motion.div>
    </motion.div>
  )
}
