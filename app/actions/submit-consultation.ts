'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const consultationSchema = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    customer_name: z.string().min(1).max(200),
    customer_email: z.string().email().max(200),
    customer_phone: z.string().min(1).max(40),
    event_date: z.string().nullable(),
    number_of_guests: z.number().int().positive().nullable(),
    budget_range: z.string().max(100).nullable(),
    has_venue: z.boolean(),
    venue_name: z.string().max(200).nullable(),
    has_caterer: z.boolean(),
    caterer_name: z.string().max(200).nullable(),
    has_planner: z.boolean(),
    planner_name: z.string().max(200).nullable(),
    message: z.string().min(1).max(5000),
    status: z.literal('new_request'),
})

export type ConsultationSubmission = z.infer<typeof consultationSchema>

/**
 * Public contact/lead intake. Validated server-side and written with the
 * service role so consultations RLS does not need open anon INSERT.
 */
export async function submitConsultationRequest(
    input: ConsultationSubmission,
): Promise<{ success: boolean; error?: string }> {
    try {
        const parsed = consultationSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, error: 'Invalid form data' }
        }

        const admin = createServiceClient()
        const { error } = await admin
            .from('consultations')
            .insert([parsed.data])

        if (error) {
            console.error('Consultation insert error:', error)
            return { success: false, error: 'Failed to submit request' }
        }

        return { success: true }
    } catch (err) {
        console.error('Unexpected consultation error:', err)
        return { success: false, error: 'Failed to submit request' }
    }
}
