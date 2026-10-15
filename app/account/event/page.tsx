import { EventHub } from '@/components/account/event-hub'
import { loadClientHub } from '@/lib/venues/load-client-hub'

export const dynamic = 'force-dynamic'

export default async function AccountEventPage() {
  const { hub, live } = await loadClientHub()
  if (!hub) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">Your event</p>
        <h1 className="mt-2 font-serif text-4xl">Nothing is linked yet</h1>
        <p className="mt-3 text-sm text-[var(--dashboard-text-muted)]">
          When your coordinator connects this account to a booking, the schedule, proposal, and checklist will show up here.
        </p>
      </div>
    )
  }
  return <EventHub initial={hub} live={live} />
}
