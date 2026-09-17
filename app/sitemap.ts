import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { COMPANY } from '@/lib/company'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    const baseUrl = COMPANY.domain

    const { data: categories } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('is_active', true)

    const categorySlugById = new Map((categories || []).map((c) => [c.id, c.slug]))

    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, category_id')
        .eq('is_active', true)

    const productEntries: MetadataRoute.Sitemap = (products || [])
        .map((product) => {
            const categorySlug = product.category_id
                ? categorySlugById.get(product.category_id)
                : null
            if (!product.slug || !categorySlug) return null
            return {
                url: `${baseUrl}/catalog/${categorySlug}/${product.slug}`,
                lastModified: new Date(product.updated_at || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry != null)

    const { data: packages } = await supabase
        .from('packages')
        .select('id, created_at')

    const packageEntries: MetadataRoute.Sitemap = (packages || []).map((pkg) => ({
        url: `${baseUrl}/packages/${pkg.id}`,
        lastModified: new Date(pkg.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const routes = [
        '',
        '/catalog',
        '/packages',
        '/gallery',
        '/services',
        '/how-it-works',
        '/about',
        '/faq',
        '/journal',
        '/partners',
        '/contact',
        '/rental-agreement',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.9,
    }))

    return [...routes, ...productEntries, ...packageEntries]
}
