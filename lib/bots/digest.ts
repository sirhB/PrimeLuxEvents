export type DigestInput = {
  now: string
  timezone: string
  leads: { name: string; stage: string; createdAt: string }[]
  stageMoves: { name: string; from: string; to: string; at: string }[]
  tours: { name: string; venue: string; startsAt: string }[]
  events: { name: string; venue: string; eventDate: string }[]
  deposits: { name: string; status: string; amountCents: number; dueOn: string | null }[]
  tasks: { title: string; assignee: string; dueOn: string | null; status: string }[]
  clientActivity: { name: string; body: string; at: string }[]
}

export function localDate(iso: string, timeZone: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function linesOrNone(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None.'
}

export function renderDigest(input: DigestInput): string {
  const today = localDate(input.now, input.timezone)
  const weekEnd = addDays(today, 7)
  const inWeek = (value: string) => {
    const day = value.slice(0, 10)
    return day >= today && day <= weekEnd
  }
  const newLeads = input.leads.filter((lead) => lead.stage === 'inquiry' || localDate(lead.createdAt, input.timezone) === today)
  const moves = input.stageMoves.filter((move) => localDate(move.at, input.timezone) >= addDays(today, -1))
  const tours = input.tours.filter((tour) => inWeek(localDate(tour.startsAt, input.timezone)))
  const events = input.events.filter((event) => inWeek(event.eventDate))
  const deposits = input.deposits.filter((deposit) => {
    if (deposit.status === 'due') return true
    if (!deposit.dueOn) return false
    return deposit.dueOn >= addDays(today, -14) && deposit.dueOn <= weekEnd
  })
  const overdue = input.tasks.filter((task) => task.dueOn && task.dueOn < today && task.status !== 'completed' && task.status !== 'cancelled')
  const client = input.clientActivity.filter((item) => localDate(item.at, input.timezone) >= addDays(today, -7))

  return [
    `Daily digest · ${today} · ${input.timezone}`,
    '',
    'New leads',
    linesOrNone(newLeads.map((lead) => `${lead.name} · ${lead.stage}`)),
    '',
    'Stage moves',
    linesOrNone(moves.map((move) => `${move.name}: ${move.from} → ${move.to}`)),
    '',
    'Tours and events this week',
    linesOrNone([
      ...tours.map((tour) => `Tour · ${tour.name} · ${tour.venue} · ${localDate(tour.startsAt, input.timezone)}`),
      ...events.map((event) => `Event · ${event.name} · ${event.venue} · ${event.eventDate}`),
    ]),
    '',
    'Deposits',
    linesOrNone(deposits.map((deposit) => `${deposit.name} · ${deposit.status} · ${money(deposit.amountCents)}`)),
    '',
    'Overdue staff tasks',
    linesOrNone(overdue.map((task) => `${task.title} · ${task.assignee} · due ${task.dueOn}`)),
    '',
    'Client activity',
    linesOrNone(client.map((item) => `${item.name}: ${item.body}`)),
  ].join('\n')
}
