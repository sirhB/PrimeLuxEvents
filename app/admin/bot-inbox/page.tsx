import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { BotInbox } from '@/components/admin/bot/bot-inbox'

export const dynamic = 'force-dynamic'

export default function BotInboxPage() {
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Manage" title="Bot inbox" description="Ask a bot to look something up. Keys stay on the bot desk." />
      <BotInbox />
    </AdminPage>
  )
}
