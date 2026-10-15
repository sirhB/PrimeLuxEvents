import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { BotControl } from '@/components/admin/bot/bot-control'
import { BOT_PROMPTS, DEFAULT_BOT_VARIABLES, assertPromptIsPublic, fillPrompt, promptValues, supabaseProjectRef } from '@/lib/admin/bot-prompts'
import { loadSchemaBrief } from '@/lib/admin/schema-brief'

export const dynamic = 'force-dynamic'

export default function BotControlPage() {
  const schema = loadSchemaBrief()
  const projectRef = supabaseProjectRef()
  const values = promptValues(DEFAULT_BOT_VARIABLES, projectRef, schema)
  for (const prompt of BOT_PROMPTS) assertPromptIsPublic(fillPrompt(prompt.template, values))

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Manage"
        title="Bot control"
        description="Setup prompts for the external assistant. Paste one into Grok Bot when you want it to run Prime Lux operations."
      />
      <BotControl projectRef={projectRef} schema={schema} />
    </AdminPage>
  )
}
