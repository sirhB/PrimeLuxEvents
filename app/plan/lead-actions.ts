'use server'

import { createHash, randomBytes } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import { VENUE_LISTINGS } from '@/lib/venues/directory'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import { LEAD_COOKIE, PLAN_BUDGETS, PLAN_EVENT_TYPES, type PlanLeadDraft } from '@/lib/leads/plan-options'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const leadSchema = z.object({
  event_type: z.enum(PLAN_EVENT_TYPES),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  guest_count: z.number().int().positive().max(5000),
  location_choice: z.enum(['primelux', 'own', 'tbd']),
  venue_id: z.string().uuid().nullable(),
  location_detail: z.string().trim().max(200).nullable(),
  budget_range: z.enum(PLAN_BUDGETS).nullable(),
  contact_name: z.string().trim().min(2).max(160),
  contact_email: z.string().trim().toLowerCase().email().max(200),
  contact_phone: z.string().trim().regex(/^[0-9+()\-.\s]{7,40}$/),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
})

const cartItemSchema = z.object({
  id: z.string().max(80),
  productId: z.string().uuid().optional(),
  packageId: z.string().max(80).optional(),
  quantity: z.number().int().min(1).max(10_000),
  modifiers: z.record(z.any()).optional(),
  packageSelections: z.record(z.array(z.string())).optional(),
  packageData: z.object({ name: z.string().max(200), price: z.number().min(0), image_url: z.string().max(500).optional() }).passthrough().optional(),
})

export type LeadSnapshot = {
  hasLead: boolean
  leadId: string | null
  source: 'cookie' | 'account' | null
  details: Partial<PlanLeadDraft> | null
  prefill: { contact_name: string; contact_email: string; contact_phone: string } | null
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

async function readToken() {
  const store = await cookies()
  const value = store.get(LEAD_COOKIE)?.value
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null
}

async function setToken(token: string) {
  const store = await cookies()
  store.set(LEAD_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: COOKIE_MAX_AGE })
}

async function currentUser() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    const { data: profile } = await supabase.from('user_profiles').select('full_name, phone, email').eq('id', data.user.id).maybeSingle()
    return {
      id: data.user.id,
      email: (profile?.email || data.user.email || '').toLowerCase(),
      name: profile?.full_name || (data.user.user_metadata?.full_name as string) || '',
      phone: profile?.phone || (data.user.phone as string) || '',
    }
  } catch {
    return null
  }
}

function toDetails(row: Record<string, unknown>): Partial<PlanLeadDraft> {
  return {
    event_type: String(row.event_type || ''),
    event_date: (row.event_date as string) || '',
    date_unsure: Boolean(row.date_flexible),
    guest_count: row.guest_count ? String(row.guest_count) : '',
    location_choice: (row.location_choice as PlanLeadDraft['location_choice']) || '',
    venue_id: (row.venue_id as string) || '',
    location_detail: (row.location_detail as string) || '',
    budget_range: (row.budget_range as string) || '',
    contact_name: String(row.contact_name || ''),
    contact_email: String(row.contact_email || ''),
    contact_phone: String(row.contact_phone || ''),
    consent: Boolean(row.contact_consent),
  }
}

/** What the browser needs to decide whether "Add to cart" opens the plan flow. Never returns other leads. */
export async function getLeadSnapshot(): Promise<LeadSnapshot> {
  const token = await readToken()
  const user = await currentUser()
  try {
    const admin = createServiceClient()
    if (token) {
      const { data } = await admin.from('venue_leads').select('*').eq('visitor_token_hash', hashToken(token)).maybeSingle()
      if (data) return { hasLead: true, leadId: data.id, source: 'cookie', details: toDetails(data), prefill: null }
    }
    if (user) {
      const { data } = await admin.from('venue_leads').select('*').eq('user_id', user.id).eq('source', 'plan_flow').order('created_at', { ascending: false }).limit(1).maybeSingle()
      const prefill = { contact_name: user.name, contact_email: user.email, contact_phone: user.phone }
      if (data) {
        // Re-attach this browser to the account's lead so the cart follows them.
        const fresh = randomBytes(32).toString('hex')
        await admin.from('venue_leads').update({ visitor_token_hash: hashToken(fresh) }).eq('id', data.id)
        await setToken(fresh)
        return { hasLead: true, leadId: data.id, source: 'account', details: toDetails(data), prefill }
      }
      return { hasLead: false, leadId: null, source: null, details: null, prefill }
    }
  } catch (error) {
    console.error('Lead snapshot error:', error)
  }
  return { hasLead: false, leadId: null, source: null, details: null, prefill: null }
}

async function upsertContact(admin: ReturnType<typeof createServiceClient>, name: string, email: string, phone: string) {
  try {
    const { data: existing } = await admin.from('crm_contacts').select('id').ilike('email', email).limit(1).maybeSingle()
    if (existing?.id) return existing.id as string
    const { data } = await admin.from('crm_contacts').insert({ name, email, phone }).select('id').single()
    return (data?.id as string) || null
  } catch {
    return null
  }
}

export async function submitPlanLead(input: Omit<PlanLeadDraft, 'guest_count' | 'event_date' | 'date_unsure' | 'venue_id' | 'location_detail' | 'budget_range' | 'event_type' | 'location_choice' | 'consent'> & {
  event_type: string
  event_date: string | null
  guest_count: number
  location_choice: string
  venue_id: string | null
  location_detail: string | null
  budget_range: string | null
  consent: boolean
}): Promise<{ ok: boolean; leadId?: string; error?: string }> {
  try {
    const hdrs = await headers()
    const rate = checkRateLimit(`plan-lead:${clientIpFromHeaders(hdrs)}`, 6, 10 * 60_000)
    if (!rate.allowed) return { ok: false, error: 'Too many tries. Please wait a few minutes.' }
    if (input.website) return { ok: true, leadId: 'received' } // honeypot

    const parsed = leadSchema.safeParse(input)
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0]
      return { ok: false, error: field === 'consent' ? 'Please agree to be contacted.' : 'Please check your details and try again.' }
    }
    const d = parsed.data
    const venue = d.location_choice === 'primelux' && d.venue_id ? VENUE_LISTINGS.find((v) => v.id === d.venue_id) ?? null : null
    const user = await currentUser()
    const admin = createServiceClient()
    const now = new Date().toISOString()

    const leadFields = {
      event_type: d.event_type,
      event_date: d.event_date,
      date_flexible: d.event_date === null,
      guest_count: d.guest_count,
      location_choice: d.location_choice,
      venue_id: venue?.id ?? null,
      venue_name: venue?.name ?? (d.location_choice === 'own' ? d.location_detail : null),
      location_detail: d.location_detail,
      budget_range: d.budget_range,
      contact_name: d.contact_name,
      contact_email: d.contact_email,
      contact_phone: d.contact_phone,
      contact_consent: true,
      contact_consent_at: now,
      updated_at: now,
    }

    // Update the visitor's own lead if this browser already has one.
    const existingToken = await readToken()
    if (existingToken) {
      const { data } = await admin.from('venue_leads').update(leadFields).eq('visitor_token_hash', hashToken(existingToken)).select('id').maybeSingle()
      if (data?.id) return { ok: true, leadId: data.id }
    }

    const token = randomBytes(32).toString('hex')
    const contactId = await upsertContact(admin, d.contact_name, d.contact_email, d.contact_phone)

    const plan = await admin.from('event_plans').insert({
      event_type: d.event_type,
      event_date: d.event_date,
      guest_count: d.guest_count,
      venue_choice: d.location_choice === 'tbd' ? 'undecided' : d.location_choice,
      venue_id: venue?.id ?? null,
      venue_name: leadFields.venue_name,
      budget_range: d.budget_range,
      contact_name: d.contact_name,
      contact_email: d.contact_email,
      contact_phone: d.contact_phone,
      status: 'new',
    }).select('id').single()

    const { data, error } = await admin.from('venue_leads').insert({
      ...leadFields,
      contact_id: contactId,
      stage: 'inquiry',
      source: 'plan_flow',
      user_id: user?.id ?? null,
      visitor_token_hash: hashToken(token),
      event_plan_id: plan.data?.id ?? null,
    }).select('id').single()
    if (error || !data) {
      console.error('Plan lead insert error:', error)
      return { ok: false, error: 'We could not save your details. Please try again.' }
    }
    await admin.from('lead_carts').insert({ lead_id: data.id }).then(() => null, () => null)
    await setToken(token)
    return { ok: true, leadId: data.id }
  } catch (error) {
    console.error('Unexpected plan lead error:', error)
    return { ok: false, error: 'We could not save your details. Please try again.' }
  }
}

/** Persist the cart against the visitor's lead (token-scoped RPC; subtotal priced on the server). */
export async function syncLeadCart(rawItems: unknown): Promise<{ ok: boolean }> {
  const token = await readToken()
  if (!token) return { ok: false }
  const parsed = z.array(cartItemSchema).max(200).safeParse(rawItems)
  if (!parsed.success) return { ok: false }
  const items = parsed.data
  try {
    const hdrs = await headers()
    if (!checkRateLimit(`lead-cart:${clientIpFromHeaders(hdrs)}`, 60, 60_000).allowed) return { ok: false }
    const supabase = await createClient()
    const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))] as string[]
    const prices = new Map<string, { name: string; cents: number }>()
    if (ids.length) {
      const { data } = await supabase.from('products').select('*').in('id', ids)
      for (const row of data || []) {
        const cents = resolvePriceCents(row)
        prices.set(row.id, { name: row.name, cents })
      }
    }
    let subtotal = 0
    const stored = items.map((item) => {
      const product = item.productId ? prices.get(item.productId) : null
      const unit = product ? product.cents : resolvePriceCents({ price: item.packageData?.price ?? 0 })
      subtotal += unit * item.quantity
      return {
        id: item.id,
        product_id: item.productId ?? null,
        package_id: item.packageId ?? null,
        name: product?.name || item.packageData?.name || 'Item',
        quantity: item.quantity,
        unit_cents: unit,
        modifiers: item.modifiers ?? {},
      }
    })
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const { error } = await supabase.rpc('save_lead_cart', { p_token: token, p_items: stored, p_item_count: count, p_subtotal_cents: subtotal })
    if (error) console.error('Lead cart sync error:', error.message)
    return { ok: !error }
  } catch (error) {
    console.error('Lead cart sync error:', error)
    return { ok: false }
  }
}

export async function markLeadCartCheckedOut(orderId?: string | null): Promise<void> {
  const token = await readToken()
  if (!token) return
  try {
    const supabase = await createClient()
    const valid = orderId && /^[0-9a-f-]{36}$/i.test(orderId) ? orderId : null
    await supabase.rpc('mark_lead_cart_checked_out', { p_token: token, p_order_id: valid })
  } catch {
    /* non-blocking */
  }
}
