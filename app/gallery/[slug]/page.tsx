import { getSiteContent } from "@/lib/content"
import { GalleryDetail } from "@/components/gallery/gallery-detail"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface GalleryDetailPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
    const { slug } = await params
    const content = await getSiteContent()
    const supabase = await createClient()

    // Fetch category
    const { data: category } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!category) {
        notFound()
    }

    // Fetch images for this category
    const { data: images } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('category_id', category.id)
        .order('order_index')

    return (
        <GalleryDetail
            content={content}
            category={category}
            images={images || []}
        />
    )
}
