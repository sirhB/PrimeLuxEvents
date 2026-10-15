import { MyTasksPanel } from '@/components/admin/tasks/my-tasks-panel'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function MyTasksPreview() {
  return (
    <PreviewFrame title="My tasks" lede="Assigned to Mara Quinn.">
      <MyTasksPanel initial={buildSampleDesk()} />
    </PreviewFrame>
  )
}
