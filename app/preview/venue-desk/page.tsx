import { VenueCrm } from '@/components/admin/venue/venue-crm'
import { SAMPLE_DAYS, SAMPLE_LEADS } from '@/lib/venues/crm'
import { SuiteToggle } from '@/components/suite/suite-toggle'

export default function VenueDeskPreview() {
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] p-4 text-[var(--dashboard-text)] md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Venue suite</p>
          <h1 className="font-serif text-4xl">Venue desk</h1>
        </div>
        <SuiteToggle />
      </div>
      <VenueCrm leads={SAMPLE_LEADS} days={SAMPLE_DAYS} live={false} />
    </div>
  )
}
