import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * True until the canonical permission catalog is in the database.
 * A missing RPC (migration not applied) keeps the bridge on so nobody is locked out.
 */
export const isCatalogBridgeActive = cache(async (): Promise<boolean> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('permission_catalog_ready')
    if (error) return true
    return data !== true
  } catch {
    return true
  }
})
