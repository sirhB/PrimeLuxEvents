import { getSiteContent } from "@/lib/content"
import { AboutPageContent } from "@/components/about-page-content"

export const revalidate = 60

export default async function AboutPage() {
  const content = await getSiteContent()

  return <AboutPageContent content={content} />
}
