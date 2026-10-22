import publicImages from '@/lib/generated/public-images.json'
import { createClient } from '@/lib/supabase/server'
import { resolvePriceCents } from '@/lib/catalog/adapters'

export type HomeProduct = {
  id: string | null
  name: string
  image: string
  href: string
  price_cents: number | null
  group: string
}

export type HomeData = {
  products: HomeProduct[]
  /** Real counts only; null means "not known" and the UI shows a labeled placeholder. */
  stats: { products: number | null; categories: number | null; venues: number }
}

// Rental groups shown as tabs. Matching is by product/category name keywords.
export const RAIL_GROUPS = [
  { id: 'seating', label: 'Seating', match: /(chair|throne|sofa|loveseat|bench|lounge|stool)/i },
  { id: 'tables', label: 'Tables', match: /(table|bar\b|counter)/i },
  { id: 'backdrops', label: 'Backdrops', match: /(backdrop|wall|arch|column|canopy)/i },
  { id: 'tabletop', label: 'Tabletop', match: /(charger|plate|goblet|glass|flute|bowl|chafer|vase|centerpiece|runner|tablecloth|linen)/i },
  { id: 'lighting', label: 'Lighting', match: /(light|chandelier|candle|lamp|marquee|glow)/i },
  { id: 'tents', label: 'Tents', match: /(tent)/i },
] as const

function groupFor(name: string) {
  return RAIL_GROUPS.find((g) => g.match.test(name))?.id ?? 'other'
}

function titleFromFile(file: string) {
  return file.replace(/\.(jpe?g|png|webp)$/i, '').replace(/regular$/i, '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Offline fallback: the real product photos that ship in /public, named from their files. */
function localProducts(): HomeProduct[] {
  try {
    return (publicImages as string[])
      .filter((p) => p.startsWith('/images/products/') && !p.slice('/images/products/'.length).includes('/'))
      .map((p) => p.slice('/images/products/'.length))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !/regular\./i.test(f))
      .map((file) => {
        const name = titleFromFile(file)
        return { id: null, name, image: `/images/products/${file}`, href: '/catalog', price_cents: null, group: groupFor(name) }
      })
  } catch {
    return []
  }
}

export async function loadHomeData(venueCount: number): Promise<HomeData> {
  try {
    const supabase = await createClient()
    const [{ data, error }, cats] = await Promise.all([
      supabase.from('products').select('id, name, slug, image_url, price_cents, price, category_id, is_active').eq('is_active', true).not('image_url', 'is', null).limit(400),
      supabase.from('categories').select('id, slug', { count: 'exact' }).eq('is_active', true),
    ])
    if (error || !data?.length) throw new Error('no products')
    const catSlug = new Map((cats.data || []).map((c) => [c.id, c.slug]))
    const products = data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      image: row.image_url as string,
      href: row.slug && catSlug.get(row.category_id) ? `/catalog/${catSlug.get(row.category_id)}/${row.slug}` : '/catalog',
      price_cents: resolvePriceCents(row),
      group: groupFor(row.name as string),
    }))
    return { products, stats: { products: data.length, categories: cats.count ?? null, venues: venueCount } }
  } catch {
    return { products: localProducts(), stats: { products: null, categories: null, venues: venueCount } }
  }
}
