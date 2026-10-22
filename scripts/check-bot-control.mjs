import assert from 'node:assert/strict'
import { decideBotAction, DEFAULT_GUARDRAILS } from '../lib/bots/policy.ts'
import { generateBotKey, hashBotKey, botKeyLooksValid } from '../lib/bots/keys.ts'
import { sanitizeBotPayload } from '../lib/bots/sanitize.ts'
import { undoActivity } from '../lib/bots/activity.ts'
import { diffLines, rollbackVersion } from '../lib/bots/versions.ts'
import { renderDigest } from '../lib/bots/digest.ts'
import { signWebhook, verifyWebhook } from '../lib/bots/webhooks.ts'
import { deliveryStatus, retryDelayMs } from '../lib/bots/delivery.ts'
import { checkRateLimit } from '../lib/security/rate-limit.ts'
import { permissionForAdminPath } from '../lib/admin/route-access.ts'
import { userHasPermission } from '../lib/auth/permission-catalog.ts'

const open = {
  botStatus: 'active',
  scopes: ['leads:read', 'leads:write', 'tasks:read', 'tasks:write', 'clients:message', 'prices:write', 'records:delete'],
  guardrails: DEFAULT_GUARDRAILS,
  at: new Date('2026-10-15T19:00:00Z'),
  timeZone: 'America/New_York',
  runDays: [1, 2, 3, 4, 5],
  runStart: '08:00',
  runEnd: '18:00',
}

assert.equal(decideBotAction({ ...open, action: 'leads.list', scopes: ['leads:read'] }).effect, 'allow')
assert.equal(decideBotAction({ ...open, action: 'leads.stage', scopes: ['leads:read'] }).effect, 'deny')
assert.equal(decideBotAction({ ...open, action: 'clients.message' }).code, 'never_contact_clients')
assert.equal(decideBotAction({ ...open, action: 'records.delete' }).effect, 'hold')
assert.equal(decideBotAction({ ...open, action: 'prices.update', amountCents: 3_200_000 }).effect, 'hold')
assert.equal(
  decideBotAction({ ...open, action: 'prices.update', amountCents: 1000, guardrails: { ...DEFAULT_GUARDRAILS, approvalThresholdCents: 50_000 } }).effect,
  'allow',
)
assert.equal(decideBotAction({ ...open, action: 'leads.stage', at: new Date('2026-10-17T19:00:00Z'), runDays: [6] }).code, 'weekend_read_only')
assert.equal(decideBotAction({ ...open, action: 'leads.list', at: new Date('2026-10-17T19:00:00Z'), runDays: [6], scopes: ['leads:read'] }).effect, 'allow')
assert.equal(decideBotAction({ ...open, action: 'leads.list', at: new Date('2026-10-15T02:00:00Z') }).code, 'outside_schedule')
assert.equal(decideBotAction({ ...open, action: 'leads.list', botStatus: 'paused' }).code, 'bot_paused')

const issued = generateBotKey()
assert.equal(botKeyLooksValid(issued.rawKey), true)
assert.notEqual(issued.keyHash, issued.rawKey)
assert.equal(issued.keyHash, hashBotKey(issued.rawKey))
assert.equal(issued.keyPrefix.includes(issued.rawKey.slice(issued.keyPrefix.length)), false)
assert.equal(JSON.stringify(issued).includes('service_role'), false)

const dirty = sanitizeBotPayload({
  ok: true,
  key_hash: issued.keyHash,
  webhook_secret: 'hidden',
  note: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
  service_role: process.env.SUPABASE_SERVICE_ROLE_KEY || 'service_role',
})
assert.deepEqual(Object.keys(dirty), ['ok', 'note'])
assert.equal(dirty.note, '[redacted]')

const undone = undoActivity({
  id: 'a',
  botId: 'b',
  botName: 'Ops',
  action: 'leads.stage',
  tableName: 'venue_leads',
  recordId: 'lead',
  before: { stage: 'inquiry' },
  after: { stage: 'tour' },
  reversible: true,
  undoneAt: null,
  createdAt: '2026-10-15T12:00:00Z',
}, '2026-10-15T13:00:00Z')
assert.equal(undone.ok, true)
assert.equal(undone.restored.stage, 'inquiry')
assert.equal(undoActivity({ ...undone.entry }, '2026-10-15T14:00:00Z').ok, false)

const versions = rollbackVersion([
  { id: 'v1', promptId: 'master', version: 1, body: 'Read first.', note: 'First', createdAt: '2026-10-15T12:00:00Z' },
], 'v1', '2026-10-15T13:00:00Z')
assert.equal(versions[0].version, 2)
assert.equal(versions[0].body, 'Read first.')
assert.equal(versions.length, 2)
const diff = diffLines('alpha\nkeep', 'beta\nkeep')
assert.deepEqual(diff.map((line) => line.kind), ['del', 'add', 'same'])

const digest = renderDigest({
  now: '2026-10-15T15:00:00Z',
  timezone: 'America/New_York',
  leads: [{ name: 'Jordan Hale', stage: 'inquiry', createdAt: '2026-10-15T15:00:00Z' }],
  stageMoves: [{ name: 'Jordan Hale', from: 'inquiry', to: 'tour', at: '2026-10-15T15:00:00Z' }],
  tours: [{ name: 'Avery Cole', venue: 'Prime Lux Pavilion', startsAt: '2026-10-18T18:00:00Z' }],
  events: [{ name: 'Avery Cole', venue: 'Prime Lux Pavilion', eventDate: '2026-11-14' }],
  deposits: [{ name: 'Avery Cole', status: 'due', amountCents: 800_000, dueOn: '2026-10-25' }],
  tasks: [{ title: 'Prep the room', assignee: 'Mara Quinn', dueOn: '2026-10-13', status: 'pending' }],
  clientActivity: [{ name: 'Avery Cole', body: 'Updated the guest count to 140.', at: '2026-10-14T16:00:00Z' }],
})
assert.match(digest, /Jordan Hale/)
assert.match(digest, /Prep the room/)
assert.match(digest, /\$8,000/)
assert.doesNotMatch(digest, /November/)

const secret = 'demo-signing-secret'
const signature = signWebhook(secret, '100', '{"event":"lead.created"}')
assert.equal(verifyWebhook(secret, '100', '{"event":"lead.created"}', signature), true)
assert.equal(verifyWebhook('other', '100', '{"event":"lead.created"}', signature), false)
assert.equal(deliveryStatus(1, false), 'retrying')
assert.equal(deliveryStatus(3, false), 'failed')
assert.equal(retryDelayMs(2), 120_000)

const bucket = `bot-test-${Date.now()}`
for (let i = 0; i < 60; i += 1) assert.equal(checkRateLimit(bucket, 60, 60_000).allowed, true)
assert.equal(checkRateLimit(bucket, 60, 60_000).allowed, false)

assert.equal(permissionForAdminPath('/admin/bot-control'), 'bot.view')
assert.equal(permissionForAdminPath('/admin/bot-inbox'), 'bot_inbox.view')
const staff = { roles: [{ name: 'staff' }], permissions: [] }
assert.equal(userHasPermission(staff, 'bot.view', { bridge: true }), false)
assert.equal(userHasPermission(staff, 'bot.manage', { bridge: true }), false)
assert.equal(userHasPermission(staff, 'bot_inbox.create', { bridge: true }), true)
assert.equal(userHasPermission({ roles: [{ name: 'manager' }], permissions: [] }, 'bot.manage', { bridge: true }), true)
assert.equal(userHasPermission({ roles: [{ name: 'viewer' }], permissions: [] }, 'bot.view', { bridge: true }), false)

import { parseVoiceIntent, answerVoice, actionForIntent, speakable } from '../lib/bots/voice.ts'
import { decideBotAction as decideVoiceAction } from '../lib/bots/policy.ts'

const voiceNow = '2026-10-15T19:00:00.000Z'
const voiceSnapshot = {
  now: voiceNow,
  timezone: 'America/New_York',
  tasks: [
    { id: 't1', title: 'Confirm the tour time', assignee: 'Mara Quinn', dueOn: '2026-10-15', status: 'pending' },
    { id: 't2', title: 'Prep the room', assignee: 'Mara Quinn', dueOn: '2026-10-13', status: 'pending' },
  ],
  leads: [
    { name: 'Jordan Hale', stage: 'inquiry', eventDate: '2026-12-04', venue: 'Prime Lux Pavilion' },
    { name: 'Avery Cole', stage: 'tour', eventDate: '2026-11-14', venue: 'Prime Lux Pavilion' },
  ],
  tours: [{ name: 'Avery Cole', venue: 'Prime Lux Pavilion', startsAt: '2026-10-18T18:00:00.000Z' }],
}
const voiceOpen = {
  scopes: ['leads:read', 'tasks:read', 'tasks:write'],
  botStatus: 'active',
  guardrails: DEFAULT_GUARDRAILS,
  at: new Date(voiceNow),
  timeZone: 'America/New_York',
  runDays: [1, 2, 3, 4, 5],
  runStart: '08:00',
  runEnd: '18:00',
}

assert.equal(parseVoiceIntent("What's due today?").type, 'due_today')
assert.equal(parseVoiceIntent('What is overdue?').type, 'overdue')
assert.equal(parseVoiceIntent("What's on this week?").type, 'events_week')
assert.equal(parseVoiceIntent('Any new leads?').type, 'new_leads')
assert.equal(parseVoiceIntent('Status of Avery').type, 'lead_status')
assert.equal(parseVoiceIntent('Add a task call the florist').type, 'add_task')
assert.equal(parseVoiceIntent('Mark prep the room done').type, 'complete_task')
assert.equal(parseVoiceIntent('hello there').type, 'unknown')

const due = answerVoice(parseVoiceIntent('what is due today'), voiceSnapshot, { effect: 'allow' })
assert.match(due, /Confirm the tour time/)
assert.doesNotMatch(due, /Prep the room/)
const late = answerVoice(parseVoiceIntent('what is overdue'), voiceSnapshot, { effect: 'allow' })
assert.match(late, /Prep the room/)
const leads = answerVoice(parseVoiceIntent('new leads'), voiceSnapshot, { effect: 'allow' })
assert.match(leads, /Jordan Hale/)
assert.doesNotMatch(leads, /Avery Cole/)
const status = answerVoice(parseVoiceIntent('status of Avery'), voiceSnapshot, { effect: 'allow' })
assert.match(status, /tour/)
assert.match(status, /Pavilion/)

const addAction = actionForIntent(parseVoiceIntent('add a task call the florist'))
assert.equal(addAction, 'tasks.create')
assert.equal(decideVoiceAction({ ...voiceOpen, action: addAction, scopes: ['tasks:read'] }).effect, 'deny')
assert.equal(decideVoiceAction({ ...voiceOpen, action: 'tasks.create', at: new Date('2026-10-17T19:00:00Z'), runDays: [6] }).code, 'weekend_read_only')
assert.equal(decideVoiceAction({ ...voiceOpen, action: 'tasks.create' }).effect, 'allow')
const added = answerVoice(parseVoiceIntent('add a task call the florist'), voiceSnapshot, { effect: 'allow' })
assert.match(added, /Added the task/)
const held = answerVoice(parseVoiceIntent('add a task call the florist'), voiceSnapshot, { effect: 'hold', code: 'approval_required', message: 'waiting' })
assert.match(held, /waiting for a person/)
assert.equal(speakable('token plxbot_' + 'a'.repeat(20)), 'I cannot say that.')
assert.doesNotMatch(due + late + status + added, /service_role|plxbot_|sk_test/)

console.log('bot control checks passed')
