import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { botKeyLooksValid, hashBotKey } from '@/lib/bots/keys'
import { decideBotAction, type Guardrails } from '@/lib/bots/policy'
import { actionForIntent, answerVoice, parseVoiceIntent, speakable, type VoiceSnapshot } from '@/lib/bots/voice'

export const dynamic = 'force-dynamic'

const LIMIT = 20
const WINDOW_MS = 60_000

function speak(status: number, speech: string, extra?: Record<string, string>) {
  return new NextResponse(speakable(speech), {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  })
}

function bearer(request: Request) {
  const header = request.headers.get('authorization') || ''
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return (match?.[1] || request.headers.get('x-bot-key') || '').trim()
}

async function readQuery(request: Request) {
  const type = request.headers.get('content-type') || ''
  if (type.includes('application/json')) {
    const body = (await request.json()) as { query?: unknown }
    return typeof body.query === 'string' ? body.query.trim() : ''
  }
  return (await request.text()).trim()
}

function clock(value: unknown) {
  return String(value || '').slice(0, 5)
}

/**
 * Siri / Shortcuts voice endpoint.
 * Bearer token is a scoped bot key. The body is plain text or JSON { query }.
 * The response is short text meant to be spoken. Writes are checked again in bot_record_voice.
 */
export async function POST(request: Request) {
  const raw = bearer(request)
  if (!raw || !botKeyLooksValid(raw)) {
    return speak(401, 'That key was not accepted.')
  }

  const keyHash = hashBotKey(raw)
  const rate = checkRateLimit(`voice:${keyHash}`, LIMIT, WINDOW_MS)
  if (!rate.allowed) {
    return speak(429, 'Too many requests. Try again shortly.', { 'Retry-After': String(rate.retryAfterSec) })
  }

  let query = ''
  try {
    query = await readQuery(request)
  } catch {
    return speak(400, 'Say what you need after Prime Lux.')
  }
  if (!query) return speak(400, 'Say what you need after Prime Lux.')
  if (query.length > 400) return speak(400, 'That was too long. Try a shorter question.')

  const intent = parseVoiceIntent(query)
  const action = actionForIntent(intent)

  try {
    const admin = createServiceClient()
    const { data: key, error: keyError } = await admin
      .from('ops_bot_keys')
      .select('id, bot_id, scopes, revoked_at')
      .eq('key_hash', keyHash)
      .maybeSingle()
    if (keyError) return speak(503, 'Prime Lux is offline right now.')
    if (!key || key.revoked_at) return speak(401, 'That key was not accepted.')

    const { data: bot, error: botError } = await admin
      .from('ops_bots')
      .select('status, timezone, run_days, run_start, run_end')
      .eq('id', key.bot_id)
      .maybeSingle()
    if (botError || !bot) return speak(503, 'Prime Lux is offline right now.')

    const { data: guard } = await admin
      .from('ops_bot_guardrails')
      .select('never_contact_clients, read_only_weekends, approval_threshold_cents')
      .limit(1)
      .maybeSingle()
    const guardrails: Guardrails = {
      neverContactClients: guard?.never_contact_clients ?? true,
      readOnlyWeekends: guard?.read_only_weekends ?? true,
      approvalThresholdCents: guard?.approval_threshold_cents ?? 50_000,
    }
    const decision = action
      ? decideBotAction({
          action,
          scopes: key.scopes || [],
          botStatus: bot.status === 'paused' ? 'paused' : 'active',
          guardrails,
          at: new Date(),
          timeZone: bot.timezone || 'America/New_York',
          runDays: Array.isArray(bot.run_days) ? bot.run_days : [1, 2, 3, 4, 5],
          runStart: clock(bot.run_start) || '08:00',
          runEnd: clock(bot.run_end) || '18:00',
        })
      : null

    const snapshot = await loadSnapshot(admin, bot.timezone || 'America/New_York')
    const speech = answerVoice(intent, snapshot, decision)
    const write = decision?.effect === 'allow' && (action === 'tasks.create' || action === 'tasks.complete') && !speech.startsWith('I could not find') && !speech.startsWith('Say the task')
    const hold = decision?.effect === 'hold'
    const payload =
      intent.type === 'add_task' || intent.type === 'complete_task'
        ? { title: intent.title, intent: intent.type, summary: intent.title }
        : { intent: intent.type }
    const { error: logError } = await admin.rpc('bot_record_voice', {
      p_key_hash: keyHash,
      p_action: hold ? 'voice.hold' : write ? action : 'voice.query',
      p_payload: payload,
    })
    if (logError) return speak(503, 'Prime Lux is offline right now.')

    if (!decision || decision.effect === 'allow') return speak(200, speech)
    if (decision.effect === 'hold') return speak(202, speech)
    if (
      decision.code === 'insufficient_scope' ||
      decision.code === 'weekend_read_only' ||
      decision.code === 'outside_schedule' ||
      decision.code === 'bot_paused' ||
      decision.code === 'never_contact_clients'
    ) {
      return speak(403, speech)
    }
    return speak(401, speech)
  } catch {
    return speak(503, 'Prime Lux is offline right now.')
  }
}

async function loadSnapshot(admin: ReturnType<typeof createServiceClient>, timezone: string): Promise<VoiceSnapshot> {
  const now = new Date().toISOString()
  const [tasks, leads, tours] = await Promise.all([
    admin.from('tasks').select('id, title, status, due_date, assigned_to_text, audience').limit(80),
    admin.from('venue_leads').select('contact_name, stage, event_date, venue_name').limit(80),
    admin.from('venue_tours').select('lead_id, venue_name, starts_at').limit(40),
  ])
  return {
    now,
    timezone,
    tasks: (tasks.data || [])
      .filter((task) => task.audience !== 'client')
      .map((task) => ({
        id: String(task.id),
        title: String(task.title || 'Task'),
        assignee: String(task.assigned_to_text || 'Unassigned'),
        dueOn: task.due_date ? String(task.due_date) : null,
        status: String(task.status || 'pending'),
      })),
    leads: (leads.data || []).map((lead) => ({
      name: String(lead.contact_name || 'Lead'),
      stage: String(lead.stage || 'inquiry'),
      eventDate: lead.event_date ? String(lead.event_date) : null,
      venue: lead.venue_name ? String(lead.venue_name) : null,
    })),
    tours: (tours.data || []).map((tour) => ({
      name: 'Tour',
      venue: String(tour.venue_name || 'the venue'),
      startsAt: String(tour.starts_at || now),
    })),
  }
}
