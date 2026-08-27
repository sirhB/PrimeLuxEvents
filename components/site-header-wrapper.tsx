import { getGlobalSettings } from '@/lib/content'
import { SiteHeader } from '@/components/site-header'

export async function SiteHeaderWrapper() {
  const settings = await getGlobalSettings()

  return (
    <SiteHeader
      initialSettings={{
        company_email: settings.company_email || 'info@primeluxevents.com',
        company_phone: settings.company_phone || '(555) 123-4567',
      }}
    />
  )
}
