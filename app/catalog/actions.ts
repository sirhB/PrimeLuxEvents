'use server'

import { searchPublicCatalog } from '@/lib/catalog/public-catalog'

export async function searchProducts(query: string, sort: string, category: string | null) {
  return searchPublicCatalog(query, sort, category)
}
