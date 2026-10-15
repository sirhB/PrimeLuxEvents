import { TemplateEditor } from '@/components/admin/tasks/template-editor'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function TemplatePreview() {
  return (
    <PreviewFrame title="Task templates" lede="Stage changes create these tasks. Admins can edit them.">
      <TemplateEditor initial={buildSampleDesk()} />
    </PreviewFrame>
  )
}
