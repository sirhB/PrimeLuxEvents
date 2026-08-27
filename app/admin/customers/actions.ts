'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCustomer(email: string, data: { name?: string, phone?: string }) {
    const supabase = await createClient()
    const normalized = email.toLowerCase()

    const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('email', normalized)
        .maybeSingle()

    if (profiles) {
        await supabase.from('user_profiles').update({
            full_name: data.name,
            phone: data.phone,
        }).eq('id', profiles.id)
    }

    await supabase.from('customer_details').upsert({
        email: normalized,
        full_name: data.name || null,
        phone: data.phone || null,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    revalidatePath('/admin/customers')
    return { success: true }
}

export async function deleteCustomer(email: string) {
    const supabase = await createClient()
    const normalized = email.toLowerCase()

    const { error } = await supabase.from('customer_details').upsert({
        email: normalized,
        is_archived: true,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    if (error) {
        console.error('Archive customer failed:', error)
        return { success: false, message: error.message }
    }

    revalidatePath('/admin/customers')
    return { success: true, message: 'Customer archived' }
}
