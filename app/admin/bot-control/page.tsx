import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { BotDesk } from '@/components/admin/bot/bot-desk'
import { BOT_PROMPTS, DEFAULT_BOT_VARIABLES, assertPromptIsPublic, fillPrompt, promptValues, supabaseProjectRef } from '@/lib/admin/bot-prompts'
import { loadSchemaBrief } from '@/lib/admin/schema-brief'
import { renderDigest } from '@/lib/bots/digest'
import { digestFromDesk, voiceFromDesk } from '@/lib/bots/from-desk'
import { sampleBotDesk } from '@/lib/bots/state'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function BotControlPage() {
  const schema = loadSchemaBrief()
  const projectRef = supabaseProjectRef()
  const values = promptValues(DEFAULT_BOT_VARIABLES, projectRef, schema)
  for (const prompt of BOT_PROMPTS) assertPromptIsPublic(fillPrompt(prompt.template, values))
  const { desk } = await loadVenueDesk()
  const initial = sampleBotDesk()
  const digest = renderDigest(digestFromDesk(desk, new Date(), initial.activity))

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Manage"
        title="Bot control"
        description="Prompts, bots, scoped keys, and the checks that hold a risky write for a person."
      />
      <BotDesk projectRef={projectRef} schema={schema} digest={digest} voice={voiceFromDesk(desk)} initial={initial} />
    </AdminPage>
  )
}
