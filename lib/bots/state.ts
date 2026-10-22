import { MASTER_PROMPT } from '../admin/bot-prompts'
import type { ActivityEntry } from './activity'
import { undoActivity } from './activity'
import { DEFAULT_GUARDRAILS, type Guardrails } from './policy'
import { rollbackVersion, type PromptVersion } from './versions'
import { WEBHOOK_EVENTS, type WebhookEvent } from './events'

export type { WebhookEvent }

export type BotRecord = {
  id: string
  name: string
  role: string
  scopes: string[]
  status: 'active' | 'paused'
  timezone: string
  digestTime: string
  runDays: number[]
  runStart: string
  runEnd: string
  webhookUrl: string
  webhookEvents: WebhookEvent[]
  secretSet: boolean
}

export type BotKeyRecord = {
  id: string
  botId: string
  label: string
  keyPrefix: string
  scopes: string[]
  revokedAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export type ApprovalRecord = {
  id: string
  botId: string
  botName: string
  action: string
  summary: string
  amountCents: number | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export type RequestRecord = {
  id: string
  botId: string
  title: string
  body: string
  status: 'open' | 'in_progress' | 'done' | 'declined'
  submittedBy: string
  createdAt: string
}

export type DeliveryRecord = {
  id: string
  botId: string
  botName: string
  event: WebhookEvent
  status: 'delivered' | 'retrying' | 'failed' | 'pending'
  attempts: number
  signature: string | null
  lastError: string | null
  createdAt: string
}

export type BotDeskState = {
  bots: BotRecord[]
  keys: BotKeyRecord[]
  activity: ActivityEntry[]
  approvals: ApprovalRecord[]
  guardrails: Guardrails
  versions: PromptVersion[]
  requests: RequestRecord[]
  deliveries: DeliveryRecord[]
  revealedKey: { id: string; rawKey: string } | null
}

const WEEKDAYS = [1, 2, 3, 4, 5]

export function sampleBotDesk(now = new Date()): BotDeskState {
  const at = now.toISOString()
  const earlier = new Date(now.getTime() - 3_600_000).toISOString()
  return {
    bots: [
      {
        id: 'bot-ops',
        name: 'Ops desk',
        role: 'Ops and staff tasks',
        scopes: ['leads:read', 'leads:write', 'tasks:read', 'tasks:write'],
        status: 'active',
        timezone: 'America/New_York',
        digestTime: '8:00 AM',
        runDays: WEEKDAYS,
        runStart: '08:00',
        runEnd: '18:00',
        webhookUrl: 'https://hooks.example/ops',
        webhookEvents: ['lead.created', 'lead.stage_changed', 'task.overdue'],
        secretSet: true,
      },
      {
        id: 'bot-digest',
        name: 'Morning digest',
        role: 'Daily business digest',
        scopes: ['leads:read', 'tasks:read'],
        status: 'active',
        timezone: 'America/New_York',
        digestTime: '8:00 AM',
        runDays: WEEKDAYS,
        runStart: '07:30',
        runEnd: '09:00',
        webhookUrl: '',
        webhookEvents: ['deposit.due'],
        secretSet: false,
      },
    ],
    keys: [
      {
        id: 'key-ops',
        botId: 'bot-ops',
        label: 'Ops weekday',
        keyPrefix: 'plxbot_WkDay01',
        scopes: ['leads:read', 'leads:write', 'tasks:read', 'tasks:write'],
        revokedAt: null,
        lastUsedAt: earlier,
        createdAt: earlier,
      },
      {
        id: 'key-read',
        botId: 'bot-digest',
        label: 'Digest read',
        keyPrefix: 'plxbot_ReadOnly',
        scopes: ['leads:read', 'tasks:read'],
        revokedAt: null,
        lastUsedAt: null,
        createdAt: earlier,
      },
    ],
    activity: [
      {
        id: 'act-stage',
        botId: 'bot-ops',
        botName: 'Ops desk',
        action: 'leads.stage',
        tableName: 'venue_leads',
        recordId: 'lead-jordan',
        before: { stage: 'inquiry' },
        after: { stage: 'tour' },
        reversible: true,
        undoneAt: null,
        createdAt: earlier,
      },
    ],
    approvals: [
      {
        id: 'apr-price',
        botId: 'bot-ops',
        botName: 'Ops desk',
        action: 'prices.update',
        summary: 'Avery Cole · Pavilion wedding · $28,000 to $32,000',
        amountCents: 3_200_000,
        status: 'pending',
        createdAt: earlier,
      },
      {
        id: 'apr-delete',
        botId: 'bot-ops',
        botName: 'Ops desk',
        action: 'records.delete',
        summary: 'Mark Sam Idris lost. This can be undone.',
        amountCents: null,
        status: 'pending',
        createdAt: at,
      },
    ],
    guardrails: { ...DEFAULT_GUARDRAILS },
    versions: [
      {
        id: 'ver-master-2',
        promptId: 'master',
        version: 2,
        body: MASTER_PROMPT,
        note: 'Current master prompt',
        createdAt: at,
      },
      {
        id: 'ver-master-1',
        promptId: 'master',
        version: 1,
        body: 'You are the operations assistant for {{business_name}}. Read first. Ask before you delete or contact a client.',
        note: 'First draft',
        createdAt: earlier,
      },
    ],
    requests: [
      {
        id: 'req-tour',
        botId: 'bot-ops',
        title: 'Confirm Avery’s tour',
        body: 'Check that Saturday’s Pavilion tour is still on the board.',
        status: 'open',
        submittedBy: 'Mara Quinn',
        createdAt: earlier,
      },
    ],
    deliveries: [
      {
        id: 'del-stage',
        botId: 'bot-ops',
        botName: 'Ops desk',
        event: 'lead.stage_changed',
        status: 'delivered',
        attempts: 1,
        signature: null,
        lastError: null,
        createdAt: earlier,
      },
      {
        id: 'del-overdue',
        botId: 'bot-ops',
        botName: 'Ops desk',
        event: 'task.overdue',
        status: 'retrying',
        attempts: 1,
        signature: null,
        lastError: 'Endpoint timed out',
        createdAt: at,
      },
    ],
    revealedKey: null,
  }
}

export type DeskAction =
  | { type: 'save-bot'; bot: BotRecord }
  | { type: 'set-status'; id: string; status: 'active' | 'paused' }
  | { type: 'reveal-key'; key: BotKeyRecord; rawKey: string }
  | { type: 'dismiss-key' }
  | { type: 'revoke-key'; id: string; at: string }
  | { type: 'touch-key'; id: string; at: string }
  | { type: 'undo'; id: string; at: string }
  | { type: 'decide'; id: string; status: 'approved' | 'rejected' }
  | { type: 'guardrails'; guardrails: Guardrails }
  | { type: 'rollback'; versionId: string; at: string }
  | { type: 'add-request'; request: RequestRecord }
  | { type: 'set-request-status'; id: string; status: RequestRecord['status'] }
  | { type: 'set-webhook'; id: string; webhookUrl: string; webhookEvents: WebhookEvent[] }
  | { type: 'log-delivery'; delivery: DeliveryRecord }

export function reduceBotDesk(state: BotDeskState, action: DeskAction): BotDeskState {
  switch (action.type) {
    case 'save-bot': {
      const exists = state.bots.some((bot) => bot.id === action.bot.id)
      return {
        ...state,
        bots: exists ? state.bots.map((bot) => (bot.id === action.bot.id ? action.bot : bot)) : [action.bot, ...state.bots],
      }
    }
    case 'set-status':
      return { ...state, bots: state.bots.map((bot) => (bot.id === action.id ? { ...bot, status: action.status } : bot)) }
    case 'reveal-key':
      return { ...state, keys: [action.key, ...state.keys], revealedKey: { id: action.key.id, rawKey: action.rawKey } }
    case 'dismiss-key':
      return { ...state, revealedKey: null }
    case 'revoke-key':
      return {
        ...state,
        keys: state.keys.map((key) => (key.id === action.id ? { ...key, revokedAt: action.at } : key)),
        revealedKey: state.revealedKey?.id === action.id ? null : state.revealedKey,
      }
    case 'touch-key':
      return { ...state, keys: state.keys.map((key) => (key.id === action.id ? { ...key, lastUsedAt: action.at } : key)) }
    case 'undo': {
      const entry = state.activity.find((item) => item.id === action.id)
      if (!entry) return state
      const result = undoActivity(entry, action.at)
      if (!result.ok) return state
      return { ...state, activity: state.activity.map((item) => (item.id === action.id ? result.entry : item)) }
    }
    case 'decide':
      return {
        ...state,
        approvals: state.approvals.map((item) => (item.id === action.id ? { ...item, status: action.status } : item)),
      }
    case 'guardrails':
      return { ...state, guardrails: action.guardrails }
    case 'rollback':
      return { ...state, versions: rollbackVersion(state.versions, action.versionId, action.at) }
    case 'add-request':
      return { ...state, requests: [action.request, ...state.requests] }
    case 'set-request-status':
      return {
        ...state,
        requests: state.requests.map((request) => (request.id === action.id ? { ...request, status: action.status } : request)),
      }
    case 'set-webhook':
      return {
        ...state,
        bots: state.bots.map((bot) =>
          bot.id === action.id ? { ...bot, webhookUrl: action.webhookUrl, webhookEvents: action.webhookEvents, secretSet: true } : bot,
        ),
      }
    case 'log-delivery':
      return { ...state, deliveries: [action.delivery, ...state.deliveries] }
    default:
      return state
  }
}

export { WEBHOOK_EVENTS }
