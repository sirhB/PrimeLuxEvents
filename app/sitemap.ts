import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    const baseUrl = 'https://primeluxevents.com'

    // Get all products
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')

    const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
        url: `${baseUrl}/catalog/product/${product.slug}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Get all packages
    const { data: packages } = await supabase
        .from('packages')
        .select('id, created_at') // Assuming packages don't have slugs yet, using ID

    const packageEntries: MetadataRoute.Sitemap = (packages || []).map((pkg) => ({
        url: `${baseUrl}/packages/${pkg.id}`,
        lastModified: new Date(pkg.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Static routes
    const routes = [
        '',
        '/catalog',
        '/gallery',
        '/services',
        '/how-it-works',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.9,
    }))

    return [...routes, ...productEntries, ...packageEntries]
}
