import { getSiteContent } from "@/lib/content"
import { ContactPageContent } from "@/components/contact-page-content"

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const content = await getSiteContent()

  return <ContactPageContent content={content} />
}
