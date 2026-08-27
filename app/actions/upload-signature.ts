'use server'

import { createServiceClient } from '@/lib/supabase/server'

/**
 * Upload a checkout/order signature via the service role so storage RLS
 * does not need to allow anonymous public uploads.
 */
export async function uploadSignatureImage(
    dataUrl: string,
    fileName: string,
): Promise<{ url?: string; error?: string }> {
    try {
        if (!dataUrl?.startsWith('data:image/')) {
            return { error: 'Invalid signature image' }
        }

        const base64Data = dataUrl.split(',')[1]
        if (!base64Data) {
            return { error: 'Invalid signature payload' }
        }

        const buffer = Buffer.from(base64Data, 'base64')
        if (buffer.length > 2_000_000) {
            return { error: 'Signature image is too large' }
        }

        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
        const admin = createServiceClient()

        const { error: uploadError } = await admin.storage
            .from('signatures')
            .upload(safeName, buffer, {
                contentType: 'image/png',
                upsert: true,
            })

        if (uploadError) {
            console.error('Signature upload error:', uploadError)
            return { error: 'Failed to upload signature' }
        }

        const { data: { publicUrl } } = admin.storage
            .from('signatures')
            .getPublicUrl(safeName)

        return { url: publicUrl }
    } catch (err) {
        console.error('Unexpected signature upload error:', err)
        return { error: 'Failed to upload signature' }
    }
}
