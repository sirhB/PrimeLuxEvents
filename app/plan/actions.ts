'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import { VENUE_LISTINGS } from '@/lib/venues/directory'

const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Corporate',
  'Bridal shower',
  'Baby shower',
  'Private dinner',
  'Anniversary',
  'Other',
] as const

const SERVICES = [
  'Planning',
  'Design',
  'Florals',
  'Lighting design',
  'Staffing',
  'Catering coordination',
] as const

const RENTALS = [
  'Seating',
  'Tables',
  'Linens',
  'Lounge',
  'Lighting',
  'Bars',
  'Dance floor',
  'Tents',
] as const

const BUDGETS = [
  'Under $2,500',
  '$2,500–$7,500',
  '$7,500–$15,000',
  '$15,000–$30,000',
  '$30,000 and above',
] as const

const planSchema = z.object({
  event_type: z.enum(EVENT_TYPES),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  guest_count: z.number().int().positive().max(5000).nullable(),
  venue_choice: z.enum(['primelux', 'own', 'undecided']),
  venue_id: z.string().uuid().nullable(),
  venue_name: z.string().max(200).nullable(),
  services: z.array(z.enum(SERVICES)).max(SERVICES.length),
  rentals: z.array(z.enum(RENTALS)).max(RENTALS.length),
  budget_range: z.enum(BUDGETS),
  contact_name: z.string().min(2).max(160),
  contact_email: z.string().email().max(200),
  contact_phone: z.string().min(7).max(40),
  notes: z.string().max(4000).nullable(),
  website: z.string().max(200).optional(),
})

export type EventPlanInput = z.infer<typeof planSchema>

export async function submitEventPlan(input: EventPlanInput): Promise<{ ok: boolean; reference?: string; error?: string }> {
  try {
    const hdrs = await headers()
    const ip = clientIpFromHeaders(hdrs)
    const rate = checkRateLimit(`event-plan:${ip}`, 5, 60_000)
    if (!rate.allowed) return { ok: false, error: 'Too many requests. Please try again shortly.' }

    const parsed = planSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' }
    if (parsed.data.website) return { ok: true, reference: 'PL-RECEIVED' }

    const knownVenue = parsed.data.venue_id
      ? VENUE_LISTINGS.find((item) => item.id === parsed.data.venue_id)
      : null
    const admin = createServiceClient()
    const row = {
      event_type: parsed.data.event_type,
      event_date: parsed.data.event_date,
      guest_count: parsed.data.guest_count,
      venue_choice: parsed.data.venue_choice,
      venue_id: knownVenue?.id ?? null,
      venue_name: knownVenue?.name || parsed.data.venue_name,
      services: parsed.data.services,
      rentals: parsed.data.rentals,
      budget_range: parsed.data.budget_range,
      contact_name: parsed.data.contact_name,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone,
      notes: parsed.data.notes,
      status: 'new',
    }
    let inserted = await admin.from('event_plans').insert(row).select('id').single()
    if (inserted.error && row.venue_id) {
      inserted = await admin.from('event_plans').insert({ ...row, venue_id: null }).select('id').single()
    }
    const { data, error } = inserted

    if (error || !data) {
      console.error('Event plan insert error:', error)
      return { ok: false, error: 'We could not save the plan. Please try again.' }
    }

    if (parsed.data.venue_choice === 'primelux' && knownVenue) {
      await admin.from('venue_leads').insert({
        venue_id: knownVenue.id,
        venue_name: knownVenue.name,
        contact_name: parsed.data.contact_name,
        contact_email: parsed.data.contact_email,
        contact_phone: parsed.data.contact_phone,
        event_date: parsed.data.event_date,
        guest_count: parsed.data.guest_count,
        stage: 'inquiry',
        source: 'event_plan',
        event_plan_id: data.id,
      })
    }

    const reference = `PL-${String(data.id).slice(0, 8).toUpperCase()}`
    return { ok: true, reference }
  } catch (error) {
    console.error('Unexpected event plan error:', error)
    return { ok: false, error: 'We could not save the plan. Please try again.' }
  }
}
