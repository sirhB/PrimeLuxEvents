import { createClient } from '@/lib/supabase/server'
import { loadCartLimits } from '@/lib/carts/load'
import { isEligible } from './policy'
import type { MembersDeskData } from './admin-types'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Admin-only data (RLS: these tables are admin-readable). */
export async function loadMembersDesk(): Promise<MembersDeskData> {
  const db = await createClient()
  const [members, bans, elig, cats, prods, leads, assigns, limits] = await Promise.all([
    db.from('planner_memberships').select('*').order('updated_at', { ascending: false }),
    db.from('planner_bans').select('planner_user_id'),
    db.from('member_discount_eligibility').select('*'),
    db.from('categories').select('id, name').order('name'),
    db.from('products').select('id, name, category_id').order('name').limit(1000),
    db.from('venue_leads').select('id, contact_name, event_type, event_date').order('event_date', { ascending: true }).limit(300),
    db.from('planner_event_assignments').select('lead_id, planner_user_id'),
    loadCartLimits(),
  ])
  const ids = [...new Set((members.data ?? []).map((r: Row) => r.planner_user_id))]
  const { data: profiles } = ids.length ? await db.from('user_profiles').select('id, full_name, email').in('id', ids) : { data: [] }
  const prof = new Map(((profiles ?? []) as Row[]).map((p) => [p.id, p]))
  const banned = new Set(((bans.data ?? []) as Row[]).map((b) => b.planner_user_id))
  const assignRows = (assigns.data ?? []) as Row[]

  const product = new Map<string, boolean>(); const category = new Map<string, boolean>()
  for (const r of (elig.data ?? []) as Row[]) (r.target_type === 'product' ? product : category).set(r.target_id, r.eligible)
  const catName = new Map(((cats.data ?? []) as Row[]).map((c) => [c.id, c.name]))

  return {
    limits,
    members: ((members.data ?? []) as Row[]).map((m) => ({
      id: m.planner_user_id, name: prof.get(m.planner_user_id)?.full_name || 'Planner', email: prof.get(m.planner_user_id)?.email || '',
      status: m.status, periodEnd: m.current_period_end, terminatedReason: m.terminated_reason, banned: banned.has(m.planner_user_id),
      eventCount: assignRows.filter((a) => a.planner_user_id === m.planner_user_id).length,
    })),
    categories: ((cats.data ?? []) as Row[]).map((c) => ({ id: c.id, name: c.name, rule: category.has(c.id) ? category.get(c.id)! : null })),
    products: ((prods.data ?? []) as Row[]).map((p) => ({
      id: p.id, name: p.name, categoryId: p.category_id, categoryName: catName.get(p.category_id) ?? '—',
      rule: product.has(p.id) ? product.get(p.id)! : null, effective: isEligible({ productId: p.id, categoryId: p.category_id }, { product, category }),
    })),
    leads: ((leads.data ?? []) as Row[]).map((l) => ({
      id: l.id, title: [l.contact_name, l.event_type].filter(Boolean).join(' · ') || 'Event',
      plannerId: assignRows.find((a) => a.lead_id === l.id)?.planner_user_id ?? null,
    })),
  }
}
