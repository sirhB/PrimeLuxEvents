import Link from 'next/link'
import { ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { WeekPrepClient } from '@/components/admin/week-prep/week-prep-client'
import { loadWeekPrepData } from './actions'

export const dynamic = 'force-dynamic'

export default async function WeekPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const params = await searchParams
  const offsetWeeks = Number.parseInt(params.week || '0', 10) || 0
  const data = await loadWeekPrepData(offsetWeeks)

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Week Prep"
        description="Primary manager canvas — Fri–Sun deliveries across Pick, Pack, Bags, and Load. Generate missing tasks, then drill into schedule or scanner."
        actions={
          <Button
            asChild
            className="h-10 bg-[var(--dashboard-accent-gold)] text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90"
          >
            <Link href="/admin/warehouse/schedule">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Open schedule
            </Link>
          </Button>
        }
      />
      <WeekPrepClient
        window={data.window}
        rows={data.rows}
        summary={data.summary}
        offsetWeeks={offsetWeeks}
      />
    </AdminPage>
  )
}
