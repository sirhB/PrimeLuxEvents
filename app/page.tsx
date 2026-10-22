import { HouseLedgerHero } from '@/components/home/house-ledger-hero'
import { HomeChapters, type HomeCategory } from '@/components/home/home-chapters'
import { loadPublicVenues } from '@/lib/venues/load'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

async function loadCategories(): Promise<HomeCategory[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(8)
    return (data || []).map((row) => ({ id: row.id, name: row.name, slug: row.slug, description: row.description || null }))
  } catch {
    return []
  }
}

export default async function Home() {
  const [venues, categories] = await Promise.all([loadPublicVenues(), loadCategories()])

  return (
    <div className="flex flex-col">
      <HouseLedgerHero venues={venues} />
      <HomeChapters venues={venues} categories={categories} />
    </div>
  )
}
