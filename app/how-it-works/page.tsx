import { getSiteContent } from "@/lib/content"
import { HowItWorksPageContent } from "@/components/how-it-works-page-content"

export const dynamic = 'force-dynamic'

export default async function HowItWorksPage() {
  const content = await getSiteContent()

  return <HowItWorksPageContent content={content} />
}
