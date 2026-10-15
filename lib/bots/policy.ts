export const BOT_SCOPES = [
  'leads:read',
  'leads:write',
  'tasks:read',
  'tasks:write',
  'clients:message',
  'prices:write',
  'records:delete',
] as const

export type BotScope = (typeof BOT_SCOPES)[number]

export const BOT_ACTIONS = [
  'leads.list',
  'leads.stage',
  'tasks.list',
  'tasks.complete',
  'clients.message',
  'prices.update',
  'records.delete',
] as const

export type BotActionName = (typeof BOT_ACTIONS)[number]

export type Guardrails = {
  neverContactClients: boolean
  readOnlyWeekends: boolean
  approvalThresholdCents: number
}

export const DEFAULT_GUARDRAILS: Guardrails = {
  neverContactClients: true,
  readOnlyWeekends: true,
  approvalThresholdCents: 50_000,
}

const SCOPE_FOR: Record<BotActionName, BotScope> = {
  'leads.list': 'leads:read',
  'leads.stage': 'leads:write',
  'tasks.list': 'tasks:read',
  'tasks.complete': 'tasks:write',
  'clients.message': 'clients:message',
  'prices.update': 'prices:write',
  'records.delete': 'records:delete',
}

const READ_ACTIONS = new Set<BotActionName>(['leads.list', 'tasks.list'])

export type BotDecision =
  | { effect: 'allow' }
  | { effect: 'deny'; code: string; message: string }
  | { effect: 'hold'; code: string; message: string }

export function isBotAction(value: string): value is BotActionName {
  return (BOT_ACTIONS as readonly string[]).includes(value)
}

export function isBotScope(value: string): value is BotScope {
  return (BOT_SCOPES as readonly string[]).includes(value)
}

export function scopesAllow(scopes: readonly string[], action: BotActionName): boolean {
  return scopes.includes(SCOPE_FOR[action])
}

export function scopesAreSubset(requested: readonly string[], allowed: readonly string[]): boolean {
  return requested.every((scope) => allowed.includes(scope))
}

export function zonedParts(at: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(fmt.formatToParts(at).map((part) => [part.type, part.value]))
  const weekday = parts.weekday
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  return { day, minutes: hour * 60 + minute }
}

export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return hour * 60 + minute
}

export function withinRunWindow(input: {
  at: Date
  timeZone: string
  runDays: readonly number[]
  runStart: string
  runEnd: string
}): boolean {
  const start = parseClock(input.runStart)
  const end = parseClock(input.runEnd)
  if (start == null || end == null || end <= start) return false
  const zoned = zonedParts(input.at, input.timeZone)
  if (!input.runDays.includes(zoned.day)) return false
  return zoned.minutes >= start && zoned.minutes < end
}

export function decideBotAction(input: {
  action: BotActionName
  scopes: readonly string[]
  botStatus: 'active' | 'paused'
  guardrails: Guardrails
  amountCents?: number | null
  at: Date
  timeZone: string
  runDays: readonly number[]
  runStart: string
  runEnd: string
}): BotDecision {
  if (input.botStatus !== 'active') {
    return { effect: 'deny', code: 'bot_paused', message: 'This bot is paused.' }
  }
  if (!scopesAllow(input.scopes, input.action)) {
    return {
      effect: 'deny',
      code: 'insufficient_scope',
      message: `This key cannot ${input.action}.`,
    }
  }
  if (
    !withinRunWindow({
      at: input.at,
      timeZone: input.timeZone,
      runDays: input.runDays,
      runStart: input.runStart,
      runEnd: input.runEnd,
    })
  ) {
    return { effect: 'deny', code: 'outside_schedule', message: 'This bot is outside its run window.' }
  }
  const weekend = [0, 6].includes(zonedParts(input.at, input.timeZone).day)
  if (input.guardrails.readOnlyWeekends && weekend && !READ_ACTIONS.has(input.action)) {
    return { effect: 'deny', code: 'weekend_read_only', message: 'Writes are off on weekends.' }
  }
  if (input.action === 'clients.message') {
    if (input.guardrails.neverContactClients) {
      return { effect: 'deny', code: 'never_contact_clients', message: 'This house does not let bots contact clients.' }
    }
    return { effect: 'hold', code: 'approval_required', message: 'Client messages wait for a person.' }
  }
  if (input.action === 'records.delete') {
    return { effect: 'hold', code: 'approval_required', message: 'Deletes wait for a person.' }
  }
  if (input.action === 'prices.update') {
    const amount = input.amountCents
    if (amount == null || amount > input.guardrails.approvalThresholdCents) {
      return { effect: 'hold', code: 'approval_required', message: 'This price change waits for a person.' }
    }
  }
  return { effect: 'allow' }
}
