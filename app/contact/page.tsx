import { getSiteContent, getGlobalSettings } from "@/lib/content"
import { ContactPageContent } from "@/components/contact-page-content"

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const [content, settings] = await Promise.all([
    getSiteContent(),
    getGlobalSettings()
  ])

  return <ContactPageContent content={content} settings={settings} />
}
