import { TeamTasks } from '@/components/admin/tasks/team-tasks'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function StaffTasksPreview() {
  return (
    <PreviewFrame title="Team tasks" lede="Board, workload, and the due-date calendar.">
      <TeamTasks initial={buildSampleDesk()} />
    </PreviewFrame>
  )
}
