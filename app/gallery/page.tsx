import GalleryGrid from "./gallery-grid"
import { getSiteContent } from "@/lib/content"
import GalleryHero from "./gallery-hero"

export default async function GalleryPage() {
  const content = await getSiteContent()
  const images = content['gallery.images'] || []

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <GalleryHero
          title={content['gallery.hero.title']}
          description={content['gallery.hero.description']}
        />
        <GalleryGrid images={images} />
      </div>
    </div>
  )
}
