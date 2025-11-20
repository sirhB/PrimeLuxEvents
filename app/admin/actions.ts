'use server'

import { createClient } from '@/lib/supabase/server'

export type SearchResult = {
    type: 'product' | 'order' | 'category' | 'customer'
    id: string
    title: string
    subtitle?: string
    url: string
}

export async function searchAdmin(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []

    // Search Products
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5)

    if (products) {
        results.push(
            ...products.map((p) => ({
                type: 'product' as const,
                id: p.id,
                title: p.name,
                subtitle: p.description?.substring(0, 50),
                url: `/admin/products/${p.id}`,
            }))
        )
    }

    // Search Orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,id.eq.${query}`)
        .limit(5)

    if (orders) {
        results.push(
            ...orders.map((o) => ({
                type: 'order' as const,
                id: o.id,
                title: `Order #${o.id.slice(0, 8)}`,
                subtitle: `${o.customer_name} (${o.customer_email}) - $${o.total_amount}`,
                url: `/admin/orders/${o.id}`,
            }))
        )
    }

    // Search Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5)

    if (categories) {
        results.push(
            ...categories.map((c) => ({
                type: 'category' as const,
                id: c.id,
                title: c.name,
                url: `/admin/categories/${c.id}`,
            }))
        )
    }

    return results
}
