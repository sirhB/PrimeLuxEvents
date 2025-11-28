'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    await supabase.from('products').delete().eq('id', id)
    revalidatePath('/admin/products')
}
