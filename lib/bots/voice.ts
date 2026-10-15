export type VoiceTask = {
  id: string
  title: string
  assignee: string
  dueOn: string | null
  status: string
}

export type VoiceLead = {
  name: string
  stage: string
  eventDate: string | null
  venue: string | null
}

export type VoiceTour = {
  name: string
  venue: string
  startsAt: string
}

export type VoiceSnapshot = {
  now: string
  timezone: string
  tasks: VoiceTask[]
  leads: VoiceLead[]
  tours: VoiceTour[]
}

export type VoiceDecision = { effect: 'allow' } | { effect: 'deny'; code: string; message: string } | { effect: 'hold'; code: string; message: string }

export type VoiceAction = 'tasks.list' | 'leads.list' | 'tasks.create' | 'tasks.complete'

export type VoiceIntent =
  | { type: 'due_today' }
  | { type: 'overdue' }
  | { type: 'events_today' }
  | { type: 'events_week' }
  | { type: 'new_leads' }
  | { type: 'add_task'; title: string }
  | { type: 'complete_task'; title: string }
  | { type: 'lead_status'; name: string }
  | { type: 'unknown' }

const SECRET = /\bservice_role\b|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|plxbot_[A-Za-z0-9_-]{16,}|sk_(live|test)_/i

export function normalizeVoiceQuery(input: string) {
  return input
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseVoiceIntent(input: string): VoiceIntent {
  const text = normalizeVoiceQuery(input)
  if (!text) return { type: 'unknown' }
  if (/\b(overdue|past due|late tasks|what is late)\b/.test(text)) return { type: 'overdue' }
  if (/\b(due today|what is due|what's due|tasks today|due now)\b/.test(text) || text === 'what is due today') return { type: 'due_today' }
  if (/\b(this week|events this week|on this week|week ahead)\b/.test(text)) return { type: 'events_week' }
  if (/\b(events today|today's events|what is on today|what's on today|on today)\b/.test(text)) return { type: 'events_today' }
  if (/\b(new leads|new lead|new inquiries|new inquiry)\b/.test(text)) return { type: 'new_leads' }

  const add = /^(?:please )?(?:add|create|make) (?:a )?task (.+)$/.exec(text) || /^(?:please )?remind me to (.+)$/.exec(text)
  if (add?.[1]) return { type: 'add_task', title: tidyTitle(add[1]) }

  const done = /^(?:please )?(?:mark|complete|finish) (.+?) done$/.exec(text)
  if (done?.[1]) return { type: 'complete_task', title: tidyTitle(done[1]) }

  const status = /^(?:what is the |what's the )?(?:lead )?status (?:of |for )?(.+)$/.exec(text) || /^where is (.+?) lead$/.exec(text)
  if (status?.[1]) return { type: 'lead_status', name: tidyTitle(status[1]) }

  return { type: 'unknown' }
}

function tidyTitle(value: string) {
  return value.replace(/\b(please|thanks|thank you)\b/g, '').replace(/\s+/g, ' ').trim()
}

export function actionForIntent(intent: VoiceIntent): VoiceAction | null {
  switch (intent.type) {
    case 'due_today':
    case 'overdue':
      return 'tasks.list'
    case 'events_today':
    case 'events_week':
    case 'new_leads':
    case 'lead_status':
      return 'leads.list'
    case 'add_task':
      return 'tasks.create'
    case 'complete_task':
      return 'tasks.complete'
    default:
      return null
  }
}

export function localDay(iso: string, timeZone: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function spokenDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

function listSpeech(intro: string, lines: string[]) {
  if (!lines.length) return intro
  const shown = lines.slice(0, 3)
  const extra = lines.length - shown.length
  const tail = extra > 0 ? ` And ${extra} more.` : ''
  return `${intro} ${shown.join('. ')}.${tail}`
}

function findTask(tasks: VoiceTask[], title: string) {
  const needle = title.toLowerCase()
  return (
    tasks.find((task) => task.title.toLowerCase() === needle) ||
    tasks.find((task) => task.title.toLowerCase().includes(needle) || needle.includes(task.title.toLowerCase())) ||
    null
  )
}

export function speakable(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean || SECRET.test(clean)) return 'I cannot say that.'
  return clean.length > 420 ? `${clean.slice(0, 400).trim()}.` : clean
}

export function answerVoice(intent: VoiceIntent, snapshot: VoiceSnapshot, decision: VoiceDecision | null): string {
  if (intent.type === 'unknown' || !decision) {
    return speakable('Ask what is due today, what is overdue, what is on this week, about new leads, or the status of a lead. You can also add a task or mark one done.')
  }
  if (decision.effect === 'deny') return speakable(decision.message)
  if (decision.effect === 'hold') return speakable('That is waiting for a person to approve.')

  const today = localDay(snapshot.now, snapshot.timezone)
  const weekEnd = addDays(today, 7)
  const open = snapshot.tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled')

  if (intent.type === 'due_today') {
    const due = open.filter((task) => task.dueOn === today)
    return speakable(listSpeech(due.length ? `${due.length === 1 ? 'One task is' : `${due.length} tasks are`} due today.` : 'Nothing is due today.', due.map((task) => `${task.title}, for ${task.assignee}`)))
  }
  if (intent.type === 'overdue') {
    const late = open.filter((task) => task.dueOn && task.dueOn < today)
    return speakable(listSpeech(late.length ? `${late.length === 1 ? 'One task is' : `${late.length} tasks are`} overdue.` : 'Nothing is overdue.', late.map((task) => `${task.title}, for ${task.assignee}, was due ${spokenDate(task.dueOn || '')}`)))
  }
  if (intent.type === 'events_today' || intent.type === 'events_week') {
    const inRange = (day: string) => (intent.type === 'events_today' ? day === today : day >= today && day <= weekEnd)
    const items = [
      ...snapshot.tours.filter((tour) => inRange(localDay(tour.startsAt, snapshot.timezone))).map((tour) => `Tour for ${tour.name} at ${tour.venue}`),
      ...snapshot.leads.filter((lead) => lead.eventDate && inRange(lead.eventDate) && lead.stage !== 'lost').map((lead) => `${lead.name} at ${lead.venue || 'a venue to be chosen'}`),
    ]
    const label = intent.type === 'events_today' ? 'today' : 'this week'
    return speakable(listSpeech(items.length ? `On the book ${label}.` : `Nothing is on the book ${label}.`, items))
  }
  if (intent.type === 'new_leads') {
    const leads = snapshot.leads.filter((lead) => lead.stage === 'inquiry')
    return speakable(listSpeech(leads.length ? `${leads.length === 1 ? 'One new lead.' : `${leads.length} new leads.`}` : 'No new leads.', leads.map((lead) => lead.name)))
  }
  if (intent.type === 'lead_status') {
    const needle = intent.name.toLowerCase()
    const lead = snapshot.leads.find((item) => item.name.toLowerCase() === needle || item.name.toLowerCase().includes(needle))
    if (!lead) return speakable(`I could not find ${intent.name}.`)
    const when = lead.eventDate ? ` on ${spokenDate(lead.eventDate)}` : ''
    const where = lead.venue ? ` at ${lead.venue}` : ''
    return speakable(`${lead.name} is in ${lead.stage}${where}${when}.`)
  }
  if (intent.type === 'add_task') {
    if (!intent.title) return speakable('Say the task after add a task.')
    return speakable(`Added the task. ${intent.title}.`)
  }
  const task = findTask(snapshot.tasks, intent.title)
  if (!task) return speakable(`I could not find ${intent.title}.`)
  return speakable(`Marked ${task.title} done.`)
}
