import { getSiteContent } from "@/lib/content"
import { GalleryPageContent } from "@/components/gallery-page-content"

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const content = await getSiteContent()

  return <GalleryPageContent content={content} />
}
