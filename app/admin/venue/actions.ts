'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sign in required')
  return supabase
}

export async function updateLeadStage(leadId: string, stage: string) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from('venue_leads')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) throw new Error('Could not update the stage')
  revalidatePath('/admin/venue')
}

export async function addVenueNote(leadId: string, body: string) {
  const supabase = await requireUser()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('venue_notes').insert({
    lead_id: leadId,
    body: body.slice(0, 4000),
    author_name: user?.email || 'Staff',
  })
  if (error) throw new Error('Could not save the note')
  revalidatePath('/admin/venue')
}

export async function scheduleVenueTour(leadId: string, venueId: string | null, startsAt: string) {
  const supabase = await requireUser()
  const { error } = await supabase.from('venue_tours').insert({
    lead_id: leadId,
    venue_id: venueId,
    starts_at: startsAt,
    status: 'scheduled',
  })
  if (error) throw new Error('Could not schedule the tour')
  await supabase.from('venue_leads').update({ stage: 'tour', updated_at: new Date().toISOString() }).eq('id', leadId)
  revalidatePath('/admin/venue')
}

export async function createVenueBooking(leadId: string, venueId: string | null, startsOn: string, endsOn: string) {
  const supabase = await requireUser()
  const { error } = await supabase.from('venue_bookings').insert({
    lead_id: leadId,
    venue_id: venueId,
    starts_on: startsOn,
    ends_on: endsOn,
    status: 'hold',
  })
  if (error) throw new Error('Could not hold the date')
  await supabase.from('venue_leads').update({ stage: 'booked', updated_at: new Date().toISOString() }).eq('id', leadId)
  revalidatePath('/admin/venue')
}

const DAY_STATUSES = new Set(['open', 'hold', 'booked', 'closed'])

export async function setVenueAvailability(venueId: string, day: string, status: string) {
  const supabase = await requireUser()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !DAY_STATUSES.has(status)) throw new Error('Pick a day and a status')
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('venue_availability').upsert(
    { venue_id: venueId, day, status, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: 'venue_id,day' },
  )
  if (error) throw new Error('Could not update availability')
  revalidatePath('/admin/venue')
  revalidatePath('/admin/venue/availability')
  revalidatePath('/venues/[slug]', 'page')
}

export async function updateEventPlanStatus(planId: string, status: string) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from('event_plans')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', planId)
  if (error) throw new Error('Could not update the plan')
  revalidatePath('/admin/event-plans')
}
