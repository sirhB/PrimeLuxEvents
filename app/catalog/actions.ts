'use server'

import { fetchCatalogProducts } from "@/lib/catalog/queries"

export async function searchProducts(query: string, sort: string, category: string | null) {
    return fetchCatalogProducts({
        query: query || null,
        sort: sort || 'name',
        categorySlug: category,
        limit: 100,
    })
}
