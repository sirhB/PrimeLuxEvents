'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/authorization'
import { createServiceClient } from '@/lib/supabase/server'
import { generateBotKey } from '@/lib/bots/keys'
import { isBotScope, scopesAreSubset } from '@/lib/bots/policy'
import { diffLines } from '@/lib/bots/versions'

export async function issueBotKey(input: { botId: string; label: string; scopes: string[] }) {
  await requirePermission('bot.manage')
  const label = input.label.trim()
  const scopes = input.scopes.filter(isBotScope)
  if (label.length < 2) return { ok: false as const, error: 'Name the key.' }
  if (!scopes.length) return { ok: false as const, error: 'Choose at least one scope.' }

  const admin = createServiceClient()
  const { data: bot, error: botError } = await admin.from('ops_bots').select('id, scopes').eq('id', input.botId).maybeSingle()
  if (botError || !bot) return { ok: false as const, error: 'That bot was not found.' }
  if (!scopesAreSubset(scopes, bot.scopes || [])) {
    return { ok: false as const, error: 'A key cannot exceed the bot’s scopes.' }
  }

  const issued = generateBotKey()
  const { error } = await admin.from('ops_bot_keys').insert({
    bot_id: input.botId,
    label,
    key_prefix: issued.keyPrefix,
    key_hash: issued.keyHash,
    scopes,
  })
  if (error) return { ok: false as const, error: 'The key could not be saved.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const, rawKey: issued.rawKey, keyPrefix: issued.keyPrefix }
}

export async function revokeBotKey(id: string) {
  await requirePermission('bot.manage')
  const admin = createServiceClient()
  const { error } = await admin.from('ops_bot_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false as const, error: 'The key could not be revoked.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const }
}

export async function decideBotApproval(id: string, status: 'approved' | 'rejected') {
  await requirePermission('bot.manage')
  const admin = createServiceClient()
  const { data, error } = await admin.rpc('bot_decide_approval', { p_id: id, p_status: status })
  if (error || !data?.ok) return { ok: false as const, error: data?.code || 'The decision could not be saved.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const }
}

export async function undoBotActivity(id: string) {
  await requirePermission('bot.manage')
  const admin = createServiceClient()
  const { data, error } = await admin.rpc('bot_undo_activity', { p_id: id })
  if (error || !data?.ok) return { ok: false as const, error: data?.code || 'That change could not be undone.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const }
}

export async function saveBotGuardrails(input: {
  neverContactClients: boolean
  readOnlyWeekends: boolean
  approvalThresholdCents: number
}) {
  await requirePermission('bot.manage')
  const admin = createServiceClient()
  const { data: row } = await admin.from('ops_bot_guardrails').select('id').limit(1).maybeSingle()
  if (!row?.id) return { ok: false as const, error: 'Guardrails are not installed.' }
  const { error } = await admin
    .from('ops_bot_guardrails')
    .update({
      never_contact_clients: input.neverContactClients,
      read_only_weekends: input.readOnlyWeekends,
      approval_threshold_cents: input.approvalThresholdCents,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  if (error) return { ok: false as const, error: 'Guardrails could not be saved.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const }
}

export async function savePromptRollback(input: { promptId: 'master' | 'ops' | 'digest'; body: string; note: string }) {
  await requirePermission('bot.manage')
  const admin = createServiceClient()
  const { data: latest } = await admin
    .from('ops_bot_prompt_versions')
    .select('version, body')
    .eq('prompt_id', input.promptId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  const version = (latest?.version || 0) + 1
  const { error } = await admin.from('ops_bot_prompt_versions').insert({
    prompt_id: input.promptId,
    version,
    body: input.body,
    note: input.note,
  })
  if (error) return { ok: false as const, error: 'The version could not be saved.' }
  revalidatePath('/admin/bot-control')
  return { ok: true as const, version, diff: diffLines(latest?.body || '', input.body) }
}

export async function submitBotRequest(input: { botId: string; title: string; body: string; submittedBy: string }) {
  await requirePermission('bot_inbox.create')
  const title = input.title.trim()
  if (title.length < 3) return { ok: false as const, error: 'Add a short title.' }
  const admin = createServiceClient()
  const { error } = await admin.from('ops_bot_requests').insert({
    bot_id: input.botId || null,
    title,
    body: input.body.trim(),
    status: 'open',
    submitted_by_name: input.submittedBy.trim() || 'Staff',
  })
  if (error) return { ok: false as const, error: 'The request could not be saved.' }
  revalidatePath('/admin/bot-control')
  revalidatePath('/admin/bot-inbox')
  return { ok: true as const }
}
