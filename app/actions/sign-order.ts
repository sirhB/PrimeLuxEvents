'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signOrder(orderId: string, signatureDataUrl: string) {
    const supabase = await createClient()

    try {
        // 1. Convert base64 to Blob
        const base64Data = signatureDataUrl.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `${orderId}-${Date.now()}.png`

        // 2. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
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
