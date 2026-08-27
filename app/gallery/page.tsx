import { getSiteContent } from "@/lib/content"
import { GalleryLanding } from "@/components/gallery/gallery-landing"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60

export default async function GalleryPage() {
  const content = await getSiteContent()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('portfolio_categories')
    .select('*')
    .order('name')

  return <GalleryLanding content={content} categories={categories || []} />
}
