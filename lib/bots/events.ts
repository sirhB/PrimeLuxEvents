export const WEBHOOK_EVENTS = [
  'lead.created',
  'lead.stage_changed',
  'task.overdue',
  'client.message',
  'deposit.due',
] as const

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]
