'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'

const inquirySchema = z.object({
  venue_id: z.string().uuid(),
  venue_name: z.string().min(2).max(160),
  contact_name: z.string().min(2).max(160),
  contact_email: z.string().email().max(200),
  contact_phone: z.string().min(7).max(40),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  guest_count: z.number().int().positive().max(5000).nullable(),
  notes: z.string().max(4000).nullable(),
  website: z.string().max(200).optional(),
})

export type VenueInquiryInput = z.infer<typeof inquirySchema>

export async function submitVenueInquiry(input: VenueInquiryInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const hdrs = await headers()
    const rate = checkRateLimit(`venue-inquiry:${clientIpFromHeaders(hdrs)}`, 5, 60_000)
    if (!rate.allowed) return { ok: false, error: 'Too many requests. Please try again shortly.' }

    const parsed = inquirySchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' }
    if (parsed.data.website) return { ok: true }

    const admin = createServiceClient()
    const { error } = await admin.from('venue_leads').insert({
      venue_id: parsed.data.venue_id,
      venue_name: parsed.data.venue_name,
      contact_name: parsed.data.contact_name,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone,
      event_date: parsed.data.event_date,
      guest_count: parsed.data.guest_count,
      notes_preview: parsed.data.notes,
      stage: 'new',
      source: 'venue_page',
    })
    if (error) {
      console.error('Venue inquiry error:', error)
      return { ok: false, error: 'We could not save the inquiry. Please try again.' }
    }
    if (parsed.data.notes) {
      const { data: lead } = await admin
        .from('venue_leads')
        .select('id')
        .eq('contact_email', parsed.data.contact_email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lead?.id) {
        await admin.from('venue_notes').insert({ lead_id: lead.id, body: parsed.data.notes, author_name: 'Guest' })
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('Unexpected venue inquiry error:', error)
    return { ok: false, error: 'We could not save the inquiry. Please try again.' }
  }
}
