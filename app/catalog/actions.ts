'use server'

import { createClient } from "@/lib/supabase/server"

export async function searchProducts(query: string, sort: string, category: string | null) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('products')
        .select(`
      *,
      categories:categories(name, slug)
    `)

    // Apply Category Filter
    if (category) {
        dbQuery = dbQuery.eq('categories.name', category)
    }

    // Apply Search Filter
    if (query) {
        // ILIKE is case-insensitive pattern matching
        // We search name, description, and category name
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Apply Sorting
    switch (sort) {
        case 'price-low':
            // Check if rental_price_daily exists, if not fallback to price
            // Note: This simple sort might need a DB function if price logic is complex, 
            // but for now we'll sort by the primary price column assuming it's consistent.
            dbQuery = dbQuery.order('price', { ascending: true })
            break
        case 'price-high':
            dbQuery = dbQuery.order('price', { ascending: false })
            break
        case 'newest':
            dbQuery = dbQuery.order('created_at', { ascending: false })
            break
        default: // name
            dbQuery = dbQuery.order('name', { ascending: true })
    }

    // Limit results for performance (e.g., top 50 matches)
    dbQuery = dbQuery.limit(50)

    const { data, error } = await dbQuery

    if (error) {
        console.error('Search error:', error)
        return []
    }

    return data || []
}
