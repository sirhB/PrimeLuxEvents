import { BotControl } from '@/components/admin/bot/bot-control'
import { PreviewFrame } from '@/components/admin/venue/preview-frame'
import { BOT_PROMPTS, DEFAULT_BOT_VARIABLES, assertPromptIsPublic, fillPrompt, promptValues, supabaseProjectRef } from '@/lib/admin/bot-prompts'
import { loadSchemaBrief } from '@/lib/admin/schema-brief'

export const dynamic = 'force-dynamic'

export default function BotControlPreview() {
  const schema = loadSchemaBrief()
  const projectRef = supabaseProjectRef()
  const values = promptValues(DEFAULT_BOT_VARIABLES, projectRef, schema)
  for (const prompt of BOT_PROMPTS) assertPromptIsPublic(fillPrompt(prompt.template, values))

  return (
    <PreviewFrame title="Bot control" lede="Prompts Devyn pastes into the external assistant.">
      <BotControl projectRef={projectRef} schema={schema} hostToast />
    </PreviewFrame>
  )
}
