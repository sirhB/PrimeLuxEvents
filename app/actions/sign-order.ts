'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { userOwnsOrder } from '@/lib/orders/ownership'
import { isStaffUser } from '@/lib/auth/roles'

export async function signOrder(orderId: string, signatureDataUrl: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to sign' }
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id, customer_email, signature_url')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return { success: false, error: 'Order not found' }
        }

        const staff = await isStaffUser(user.id)
        if (!staff && !userOwnsOrder(user, order)) {
            return { success: false, error: 'You do not have permission to sign this order' }
        }

        // 1. Convert base64 to Blob
        const base64Data = signatureDataUrl.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `${orderId}-${Date.now()}.png`

        // 2. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('signatures')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { success: false, error: 'Failed to upload signature' }
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('signatures')
            .getPublicUrl(fileName)

        // 4. Update Order
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                signature_url: publicUrl,
                signed_at: new Date().toISOString()
            })
            .eq('id', orderId)

        if (updateError) {
            console.error('Update error:', updateError)
            return { success: false, error: 'Failed to update order' }
        }

        revalidatePath(`/account/orders/${orderId}`)
        return { success: true, url: publicUrl }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
