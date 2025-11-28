'use server'

import { createClient } from '@/lib/supabase/server'
import { formatCents } from '@/lib/format-money'

export type SearchResult = {
    type: 'product' | 'order' | 'category' | 'customer' | 'consultation' | 'setting' | 'content' | 'event'
    id: string
    title: string
    subtitle?: string
    url: string
    metadata?: {
        status?: string
        date?: string
        amount?: string
        [key: string]: any
    }
}

export async function searchAdmin(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []

    // Search Products
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description, price')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(8)

    if (products) {
        results.push(
            ...products.map((p) => ({
                type: 'product' as const,
                id: p.id,
                title: p.name,
                subtitle: p.description?.substring(0, 60) + (p.description?.length > 60 ? '...' : ''),
                url: `/admin/products/${p.id}`,
                metadata: {
                    amount: formatCents(p.price),
                }
            }))
        )
    }

    // Search Orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount, status, created_at')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
        .limit(8)

    if (orders) {
        results.push(
            ...orders.map((o) => ({
                type: 'order' as const,
                id: o.id,
                title: `${o.customer_name}`,
                subtitle: o.customer_email,
                url: `/admin/orders/${o.id}`,
                metadata: {
                    status: o.status,
                    amount: formatCents(o.total_amount),
                    date: new Date(o.created_at).toLocaleDateString(),
                }
            }))
        )
    }

    // Search Consultations
    const { data: consultations } = await supabase
        .from('consultations')
        .select('id, customer_name, customer_email, total_amount, status, created_at')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
        .limit(8)

    if (consultations) {
        results.push(
            ...consultations.map((q) => ({
                type: 'consultation' as const,
                id: q.id,
                title: `${q.customer_name}`,
                subtitle: q.customer_email,
                url: `/admin/consultations/${q.id}`,
                metadata: {
                    status: q.status,
                    amount: formatCents(q.total_amount),
                    date: new Date(q.created_at).toLocaleDateString(),
                }
            }))
        )
    }

    // Search Events
    const { data: events } = await supabase
        .from('events')
        .select('id, event_id, name, customer_name, customer_email, event_date, status, budget, manager_name')
        .or(`name.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,event_id.ilike.%${query}%`)
        .limit(8)

    if (events) {
        results.push(
            ...events.map((e) => ({
                type: 'event' as const,
                id: e.id,
                title: e.name,
                subtitle: `${e.event_id} - ${e.customer_name}`,
                url: `/admin/events/${e.id}`,
                metadata: {
                    status: e.status,
                    date: new Date(e.event_date).toLocaleDateString(),
                    amount: formatCents(e.budget || 0),
                }
            }))
        )
    }

    // Search Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, description')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(8)

    if (categories) {
        results.push(
            ...categories.map((c) => ({
                type: 'category' as const,
                id: c.id,
                title: c.name,
                subtitle: c.description?.substring(0, 60),
                url: `/admin/categories/${c.id}`,
            }))
        )
    }

    // Search Customers (aggregate from orders and consultations)
    const { data: customerOrders } = await supabase
        .from('orders')
        .select('customer_name, customer_email, customer_phone')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .limit(5)

    const { data: customerConsultations } = await supabase
        .from('consultations')
        .select('customer_name, customer_email, customer_phone')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .limit(5)

    // Combine and deduplicate customers by email
    const customerMap = new Map<string, { name: string; email: string; phone?: string }>()

    customerOrders?.forEach(c => {
        if (c.customer_email && !customerMap.has(c.customer_email)) {
            customerMap.set(c.customer_email, {
                name: c.customer_name,
                email: c.customer_email,
                phone: c.customer_phone || undefined
            })
        }
    })

    customerConsultations?.forEach(c => {
        if (c.customer_email && !customerMap.has(c.customer_email)) {
            customerMap.set(c.customer_email, {
                name: c.customer_name,
                email: c.customer_email,
                phone: c.customer_phone || undefined
            })
        }
    })

    customerMap.forEach((customer, email) => {
        results.push({
            type: 'customer' as const,
            id: email,
            title: customer.name,
            subtitle: customer.email,
            url: `/admin/customers`,
            metadata: {
                phone: customer.phone,
            }
        })
    })

    // Search Settings
    const { data: settings } = await supabase
        .from('settings')
        .select('id, key, value, description')
        .or(`key.ilike.%${query}%,description.ilike.%${query}%,value.ilike.%${query}%`)
        .limit(8)

    if (settings) {
        results.push(
            ...settings.map((s) => ({
                type: 'setting' as const,
                id: s.id,
                title: s.key,
                subtitle: s.description || s.value?.substring(0, 60),
                url: `/admin/settings`,
            }))
        )
    }

    // Search CMS Content
    const { data: content } = await supabase
        .from('content')
        .select('id, key, value, type')
        .or(`key.ilike.%${query}%,value.ilike.%${query}%`)
        .limit(8)

    if (content) {
        results.push(
            ...content.map((c) => ({
                type: 'content' as const,
                id: c.id,
                title: c.key,
                subtitle: c.value?.substring(0, 60) + (c.value?.length > 60 ? '...' : ''),
                url: `/admin/cms`,
                metadata: {
                    type: c.type,
                }
            }))
        )
    }

    return results
}

