import { getSiteContent, getGlobalSettings } from "@/lib/content"
import { ContactPageContent } from "@/components/contact-page-content"

export const revalidate = 60

export default async function ContactPage() {
  const [content, settings] = await Promise.all([
    getSiteContent(),
    getGlobalSettings()
  ])

  return <ContactPageContent content={content} settings={settings} />
}
