import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { TemplateEditor } from '@/components/admin/tasks/template-editor'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function TaskTemplatesPage() {
  const { desk, live } = await loadVenueDesk()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Venue suite" title="Task templates" description="What gets created when a tour is booked or a date is confirmed." />
      <TemplateEditor initial={desk} live={live} />
    </AdminPage>
  )
}
