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

export async function persistHold(leadId: string, venueId: string | null, starts: string, ends: string) {
  const { supabase } = await client()
  if (venueId) {
    const { data: conflicts } = await supabase.rpc('venue_hold_conflicts', { p_venue_id: venueId, p_starts: starts, p_ends: ends })
    if (conflicts && conflicts.length) throw new Error('Those dates conflict with another hold.')
  }
  const { error } = await supabase.from('venue_bookings').insert({ lead_id: leadId, venue_id: venueId, starts_on: starts, ends_on: ends, status: 'hold' })
  if (error) throw new Error('Could not hold the date')
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
