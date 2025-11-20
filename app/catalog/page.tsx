import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"

export default async function CatalogPage() {
  const content = await getSiteContent()

  return <CatalogClient heroTitle={content['catalog.hero.title']} />
}
