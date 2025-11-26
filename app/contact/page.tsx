import { getSiteContent } from "@/lib/content"
import { ContactPageContent } from "@/components/contact-page-content"

export default async function ContactPage() {
  const content = await getSiteContent()

  return <ContactPageContent content={content} />
}
