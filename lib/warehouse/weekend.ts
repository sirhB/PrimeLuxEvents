/** Weekend / delivery-window date helpers (local calendar dates as YYYY-MM-DD). */

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateString(value: string): Date {
  return new Date(`${value}T12:00:00`)
}

export function addDaysToDateString(value: string, days: number): string {
  const date = parseDateString(value)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

export type WeekendWindow = {
  /** Friday of the weekend window */
  start: string
  /** Sunday of the weekend window */
  end: string
  label: string
}

/**
 * Returns the Fri–Sun window for the upcoming weekend.
 * On Friday–Sunday, returns the current weekend; Mon–Thu returns the next one.
 */
export function getUpcomingWeekendWindow(from: Date = new Date()): WeekendWindow {
  const base = new Date(from)
  base.setHours(12, 0, 0, 0)
  const day = base.getDay() // 0 Sun … 5 Fri 6 Sat

  let daysUntilFriday: number
  if (day === 5 || day === 6 || day === 0) {
    // Already in Fri–Sun → snap to this Friday
    daysUntilFriday = day === 5 ? 0 : day === 6 ? -1 : -2
  } else {
    // Mon–Thu → next Friday
    daysUntilFriday = (5 - day + 7) % 7
  }

  const friday = new Date(base)
  friday.setDate(base.getDate() + daysUntilFriday)
  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)

  const start = toDateString(friday)
  const end = toDateString(sunday)
  const label = formatWeekendLabel(start, end)
  return { start, end, label }
}

export function shiftWeekendWindow(window: WeekendWindow, weeks: number): WeekendWindow {
  const start = addDaysToDateString(window.start, weeks * 7)
  const end = addDaysToDateString(window.end, weeks * 7)
  return { start, end, label: formatWeekendLabel(start, end) }
}

export function formatWeekendLabel(start: string, end: string): string {
  const startDate = parseDateString(start)
  const endDate = parseDateString(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const year =
    startDate.getFullYear() === endDate.getFullYear()
      ? `, ${endDate.getFullYear()}`
      : ` ${startDate.getFullYear()} – ${endDate.getFullYear()}`
  return `${startDate.toLocaleDateString('en-US', opts)} – ${endDate.toLocaleDateString('en-US', opts)}${year}`
}

export function eachDateInRange(start: string, end: string): string[] {
  const dates: string[] = []
  let cursor = start
  while (cursor <= end) {
    dates.push(cursor)
    cursor = addDaysToDateString(cursor, 1)
  }
  return dates
}
