import { getSiteContent } from "@/lib/content"
import { HowItWorksPageContent } from "@/components/how-it-works-page-content"

export const revalidate = 60

export default async function HowItWorksPage() {
  const content = await getSiteContent()

  return <HowItWorksPageContent content={content} />
}
