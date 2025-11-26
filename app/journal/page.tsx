import { getSiteContent } from "@/lib/content"
import { JournalPageContent } from "@/components/journal-page-content"

export default async function JournalPage() {
  const content = await getSiteContent()

  return <JournalPageContent content={content} />
}
