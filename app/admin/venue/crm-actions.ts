'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { tasksForStage, type DeskWorkspace, type PipelineStage, type TaskTemplate } from '@/lib/venues/desk'

async function client() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sign in required')
  return { supabase, user }
}

function refresh() {
  revalidatePath('/admin/venue')
  revalidatePath('/admin/my-tasks')
  revalidatePath('/admin/staff-tasks')
  revalidatePath('/admin/task-templates')
}

export async function persistStage(leadId: string, stage: PipelineStage, desk: DeskWorkspace) {
  const { supabase, user } = await client()
  const { error } = await supabase.from('venue_leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', leadId)
  if (error) throw new Error('Could not update the stage')
  await supabase.from('crm_activities').insert({ lead_id: leadId, kind: 'stage', body: `Stage set to ${stage}.`, author_name: user.email || 'Staff' })
  const lead = desk.leads.find((item) => item.id === leadId)
  if (lead) {
    const spawned = tasksForStage({ ...desk, leads: desk.leads.map((item) => item.id === leadId ? { ...item, stage } : item) }, { ...lead, stage }, stage)
    if (spawned.length) {
      const { error: taskError } = await supabase.from('tasks').insert(spawned.map((task) => ({
        title: task.title,
        description: task.description,
        status: 'pending',
        priority: task.priority,
        task_type: 'venue',
        lead_id: leadId,
        assigned_to_text: task.assignee_name,
        due_date: task.due_on,
        checklist: task.checklist,
        template_key: task.template_key,
        created_by_text: user.email || 'Staff',
      })))
      if (taskError) throw new Error('Stage saved, but the tasks did not')
      await supabase.from('staff_notifications').insert(spawned.map((task) => ({
        recipient_name: task.assignee_name,
        kind: 'assignment',
        title: 'Task assigned',
        body: task.title,
        href: '/admin/my-tasks',
        user_id: user.id,
      })))
    }
  }
  refresh()
}

export async function persistActivity(leadId: string, kind: string, body: string) {
  const { supabase, user } = await client()
  const { error } = await supabase.from('crm_activities').insert({ lead_id: leadId, kind, body: body.slice(0, 4000), author_name: user.email || 'Staff' })
  if (error) throw new Error('Could not log that')
  refresh()
}

export async function persistHold(leadId: string, venueId: string | null, starts: string, ends: string, venueName: string | null = null) {
  const { supabase, user } = await client()
  if (venueId) {
    const { data: conflicts } = await supabase.rpc('venue_hold_conflicts', { p_venue_id: venueId, p_starts: starts, p_ends: ends })
    if (conflicts && conflicts.length) throw new Error('Those dates conflict with another hold.')
  }
  const { error } = await supabase.from('venue_bookings').insert({ lead_id: leadId, venue_id: venueId, venue_name: venueName, starts_on: starts, ends_on: ends, status: 'hold' })
  if (error) throw new Error('Could not hold the date')
  await supabase.from('crm_activities').insert({ lead_id: leadId, kind: 'note', body: `Date held ${starts}${ends !== starts ? ` to ${ends}` : ''}.`, author_name: user.email || 'Staff' })
  revalidatePath('/venues/[slug]', 'page')
  refresh()
}

export async function persistTemplates(templates: TaskTemplate[]) {
  const { supabase } = await client()
  for (const template of templates) {
    const id = template.id.startsWith('tpl-') || template.id.startsWith('aaaaaaaa-') ? template.id : undefined
    const row = { name: template.name, trigger_stage: template.trigger_stage, active: template.active }
    const saved = id && !id.startsWith('tpl-')
      ? await supabase.from('task_templates').update(row).eq('id', id).select('id').single()
      : await supabase.from('task_templates').insert(row).select('id').single()
    if (saved.error || !saved.data) throw new Error('Could not save the template')
    await supabase.from('task_template_items').delete().eq('template_id', saved.data.id)
    if (template.items.length) {
      const { error } = await supabase.from('task_template_items').insert(template.items.map((item) => ({
        template_id: saved.data.id,
        item_key: item.key,
        title: item.title,
        offset_days: item.offset_days,
        priority: item.priority,
        checklist: item.checklist,
      })))
      if (error) throw new Error('Could not save the template tasks')
    }
  }
  refresh()
}

export async function persistTaskStatus(taskId: string, status: string) {
  const { supabase } = await client()
  if (taskId.includes(':')) return
  const { error } = await supabase.from('tasks').update({ status, updated_at: new Date().toISOString(), completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', taskId)
  if (error) throw new Error('Could not update the task')
  refresh()
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID.test(value))
}

async function logLead(supabase: Awaited<ReturnType<typeof createClient>>, leadId: string, kind: string, body: string, author: string) {
  await supabase.from('crm_activities').insert({ lead_id: leadId, kind, body: body.slice(0, 4000), author_name: author })
}

export async function persistOwner(leadId: string, ownerName: string) {
  const { supabase, user } = await client()
  const owner = ownerName.trim().slice(0, 120) || 'Unassigned'
  const { error } = await supabase.from('venue_leads').update({ owner_name: owner, updated_at: new Date().toISOString() }).eq('id', leadId)
  if (error) throw new Error('Could not change the owner')
  await logLead(supabase, leadId, 'note', `Owner set to ${owner}.`, user.email || 'Staff')
  refresh()
}

export async function persistTour(id: string, leadId: string, venueId: string | null, venueName: string | null, startsAt: string) {
  const { supabase, user } = await client()
  if (!startsAt) throw new Error('Pick a tour time')
  const { error } = await supabase.from('venue_tours').insert({ id: isUuid(id) ? id : undefined, lead_id: leadId, venue_id: venueId, venue_name: venueName, starts_at: new Date(startsAt).toISOString(), status: 'scheduled' })
  if (error) throw new Error('Could not schedule the tour')
  await supabase.from('venue_leads').update({ stage: 'tour', updated_at: new Date().toISOString() }).eq('id', leadId)
  await logLead(supabase, leadId, 'note', `Tour scheduled for ${startsAt.replace('T', ' ')}.`, user.email || 'Staff')
  refresh()
}

export async function persistProposal(leadId: string, lines: { kind: string; name: string; quantity: number; unit_cents: number }[]) {
  const { supabase, user } = await client()
  const clean = lines.slice(0, 200).map((line) => ({
    kind: line.kind === 'rental' ? 'rental' : 'service',
    name: String(line.name || 'Item').slice(0, 200),
    quantity: Math.max(1, Math.min(100_000, Math.round(Number(line.quantity) || 1))),
    unit_cents: Math.max(0, Math.min(100_000_000, Math.round(Number(line.unit_cents) || 0))),
  }))
  const { data: existing } = await supabase.from('crm_proposals').select('id').eq('lead_id', leadId).order('created_at', { ascending: true }).limit(1).maybeSingle()
  let proposalId = existing?.id as string | undefined
  if (!proposalId) {
    const created = await supabase.from('crm_proposals').insert({ lead_id: leadId, title: 'Proposal', status: 'draft' }).select('id').single()
    if (created.error || !created.data) throw new Error('Could not save the proposal')
    proposalId = created.data.id
  } else {
    await supabase.from('crm_proposals').update({ updated_at: new Date().toISOString() }).eq('id', proposalId)
  }
  const { error: delError } = await supabase.from('crm_proposal_lines').delete().eq('proposal_id', proposalId)
  if (delError) throw new Error('Could not save the proposal lines')
  if (clean.length) {
    const { error } = await supabase.from('crm_proposal_lines').insert(clean.map((line) => ({ ...line, proposal_id: proposalId })))
    if (error) throw new Error('Could not save the proposal lines')
  }
  const total = clean.reduce((sum, line) => sum + line.quantity * line.unit_cents, 0)
  await supabase.from('venue_leads').update({ value_cents: total, updated_at: new Date().toISOString() }).eq('id', leadId)
  await logLead(supabase, leadId, 'note', `Proposal updated: ${clean.length} line${clean.length === 1 ? '' : 's'}, $${(total / 100).toFixed(2)}.`, user.email || 'Staff')
  refresh()
}

/** Status only. Nothing is emailed or sent to the client. */
export async function persistContract(leadId: string, status: 'draft' | 'sent' | 'signed') {
  const { supabase, user } = await client()
  if (!['draft', 'sent', 'signed'].includes(status)) throw new Error('Unknown contract status')
  const now = new Date().toISOString()
  const row = { status, signed_at: status === 'signed' ? now : null, updated_at: now }
  const { data: existing } = await supabase.from('crm_contracts').select('id').eq('lead_id', leadId).limit(1).maybeSingle()
  const { error } = existing
    ? await supabase.from('crm_contracts').update(row).eq('id', existing.id)
    : await supabase.from('crm_contracts').insert({ ...row, lead_id: leadId })
  if (error) throw new Error('Could not save the contract status')
  if (status === 'signed') await confirmLeadHolds(supabase, leadId)
  await logLead(supabase, leadId, 'note', `Contract marked ${status} (status only, nothing sent).`, user.email || 'Staff')
  refresh()
}

/** Status only. No charge is made. */
export async function persistPayment(leadId: string, status: 'due' | 'paid' | 'waived') {
  const { supabase, user } = await client()
  if (!['due', 'paid', 'waived'].includes(status)) throw new Error('Unknown payment status')
  const { data: existing } = await supabase.from('crm_payments').select('id').eq('lead_id', leadId).eq('kind', 'deposit').limit(1).maybeSingle()
  const { error } = existing
    ? await supabase.from('crm_payments').update({ status, updated_at: new Date().toISOString() }).eq('id', existing.id)
    : await supabase.from('crm_payments').insert({ lead_id: leadId, kind: 'deposit', status, amount_cents: 500_000 })
  if (error) throw new Error('Could not save the payment status')
  if (status === 'paid') await confirmLeadHolds(supabase, leadId)
  await logLead(supabase, leadId, 'note', `Deposit marked ${status} (status only, no charge made).`, user.email || 'Staff')
  refresh()
}

/** A signed contract or paid deposit turns the lead's live holds into confirmed bookings. */
async function confirmLeadHolds(supabase: Awaited<ReturnType<typeof createClient>>, leadId: string) {
  await supabase.from('venue_bookings').update({ status: 'confirmed' }).eq('lead_id', leadId).eq('status', 'hold')
  revalidatePath('/venues/[slug]', 'page')
}

export async function persistReminder(id: string, leadId: string, dueOn: string, body: string, ownerName: string) {
  const { supabase, user } = await client()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueOn) || !body.trim()) throw new Error('A reminder needs a date and a note')
  const { error } = await supabase.from('crm_reminders').insert({ id: isUuid(id) ? id : undefined, lead_id: leadId, due_on: dueOn, body: body.trim().slice(0, 1000), owner_name: ownerName, done: false, created_by: user.id })
  if (error) throw new Error('Could not save the reminder')
  await logLead(supabase, leadId, 'note', `Follow-up set for ${dueOn}: ${body.trim().slice(0, 200)}`, user.email || 'Staff')
  refresh()
}

export async function persistReminderDone(id: string, done: boolean) {
  const { supabase } = await client()
  if (!isUuid(id)) return
  const { error } = await supabase.from('crm_reminders').update({ done, done_at: done ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw new Error('Could not update the reminder')
  refresh()
}

export async function persistChecklist(taskId: string, checklist: { id: string; label: string; done: boolean }[]) {
  const { supabase } = await client()
  if (!isUuid(taskId)) return
  const clean = checklist.slice(0, 100).map((item) => ({ id: String(item.id).slice(0, 64), label: String(item.label).slice(0, 300), done: Boolean(item.done) }))
  const { error } = await supabase.from('tasks').update({ checklist: clean, updated_at: new Date().toISOString() }).eq('id', taskId)
  if (error) throw new Error('Could not save the checklist')
  refresh()
}

export async function persistComment(id: string, taskId: string, body: string) {
  const { supabase, user } = await client()
  if (!isUuid(taskId) || !body.trim()) return
  const { error } = await supabase.from('task_comments').insert({ id: isUuid(id) ? id : undefined, task_id: taskId, body: body.trim().slice(0, 2000), author_name: user.email || 'Staff', created_by: user.id })
  if (error) throw new Error('Could not save the comment')
  refresh()
}

export async function persistView(id: string, view: { name: string; stage: string; source: string; owner: string; query: string }) {
  const { supabase, user } = await client()
  const { error } = await supabase.from('crm_saved_views').insert({
    id: isUuid(id) ? id : undefined,
    name: view.name.trim().slice(0, 80) || 'View',
    stage: view.stage,
    source: view.source,
    owner_name: view.owner,
    query: view.query.slice(0, 200),
    created_by: user.id,
  })
  if (error) throw new Error('Could not save the view')
  refresh()
}

export async function persistAbandonDays(days: number) {
  const { supabase } = await client()
  const value = Math.max(1, Math.min(60, Math.round(Number(days) || 3)))
  const { error } = await supabase.from('settings').upsert(
    { key: 'crm_cart_abandon_days', value: String(value), description: 'Days without checkout before a lead cart counts as abandoned', updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error('Could not save the abandoned-cart setting')
  refresh()
  return value
}
