import { getSiteContent } from "@/lib/content"
import GalleryGrid from "./gallery-grid"

export default async function GalleryPage() {
  const content = await getSiteContent()
  const images = content['gallery.images'] || []

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">{content['gallery.hero.title']}</h1>
          <p className="text-lg text-muted-foreground">
            {content['gallery.hero.description']}
          </p>
        </div>

        <GalleryGrid images={images} />
      </div>
    </div>
  )
}
