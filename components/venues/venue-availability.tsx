import type { DayStatus } from '@/lib/venues/load'

const LABEL: Record<DayStatus['status'], string> = { open: 'Open', held: 'On hold', booked: 'Booked' }

export function VenueAvailability({ days }: { days: DayStatus[] }) {
  const first = days[0] ? new Date(`${days[0].day}T12:00:00`) : new Date()
  const lead = (first.getDay() + 6) % 7 // Monday-first grid
  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--theme-muted)]">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <ol className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => <li key={`pad-${i}`} aria-hidden="true" />)}
        {days.map((d) => {
          const date = new Date(`${d.day}T12:00:00`)
          return (
            <li key={d.day}
              title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${LABEL[d.status]}`}
              className={
                'flex aspect-square items-center justify-center text-xs ' +
                (d.status === 'open'
                  ? 'border border-[var(--theme-dark)]/12 bg-[var(--suite-paper)]'
                  : d.status === 'held'
                    ? 'bg-[var(--theme-accent)]/30 text-[var(--theme-dark)]'
                    : 'bg-[var(--theme-dark)] text-[var(--theme-on-dark)] line-through')
              }>
              <span className="sr-only">{date.toDateString()} {LABEL[d.status]}</span>
              <span aria-hidden="true">{date.getDate()}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 flex flex-wrap gap-4 text-[11px] text-[var(--theme-muted)]">
        <span>□ Open</span><span>▨ On hold</span><span>■ Booked</span>
        <span>Dates confirm with the venue desk.</span>
      </p>
    </div>
  )
}
