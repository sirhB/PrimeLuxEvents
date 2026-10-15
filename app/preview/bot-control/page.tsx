import { BotDesk } from '@/components/admin/bot/bot-desk'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { BOT_PROMPTS, DEFAULT_BOT_VARIABLES, assertPromptIsPublic, fillPrompt, promptValues, supabaseProjectRef } from '@/lib/admin/bot-prompts'
import { loadSchemaBrief } from '@/lib/admin/schema-brief'
import { renderDigest } from '@/lib/bots/digest'
import { digestFromDesk } from '@/lib/bots/from-desk'
import { sampleBotDesk } from '@/lib/bots/state'
import { buildSampleDesk } from '@/lib/venues/desk'

export const dynamic = 'force-dynamic'

export default function BotControlPreview() {
  const schema = loadSchemaBrief()
  const projectRef = supabaseProjectRef()
  const values = promptValues(DEFAULT_BOT_VARIABLES, projectRef, schema)
  for (const prompt of BOT_PROMPTS) assertPromptIsPublic(fillPrompt(prompt.template, values))
  const initial = sampleBotDesk()
  const digest = renderDigest(digestFromDesk(buildSampleDesk(), new Date(), initial.activity))

  return (
    <PreviewFrame title="Bot control" lede="Prompts, keys, and the checks around them.">
      <BotDesk projectRef={projectRef} schema={schema} digest={digest} initial={initial} hostToast />
    </PreviewFrame>
  )
}
