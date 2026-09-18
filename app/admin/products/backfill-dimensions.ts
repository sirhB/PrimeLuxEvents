'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/auth/roles'
import { dimensionsUpdatePayload } from '@/lib/products/dimensions'

/**
 * Backfill height/width from name & description for products missing dimensions.
 * Strips dimension phrases from description only when they were not in the name.
 */
export async function backfillProductDimensions(): Promise<{
  updated: number
  scanned: number
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isStaffUser(user.id))) {
    return { updated: 0, scanned: 0, error: 'Unauthorized' }
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, height, width')
    .or('height.is.null,width.is.null')

  if (error) {
    return { updated: 0, scanned: 0, error: error.message }
  }

  let updated = 0
  for (const product of products || []) {
    const payload = dimensionsUpdatePayload(product.name, product.description, {
      height: product.height,
      width: product.width,
    })

    if (!payload.changed) continue
    if (!payload.height && !payload.width) continue

    const { error: updateError } = await supabase
      .from('products')
      .update({
        height: payload.height,
        width: payload.width,
        description: payload.description,
      })
      .eq('id', product.id)

    if (!updateError) updated += 1
  }

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  return { updated, scanned: products?.length || 0 }
}
