import { getGlobalSettings } from '@/lib/content'
import { SiteHeader } from '@/components/site-header'
import { COMPANY } from '@/lib/company'

export async function SiteHeaderWrapper() {
  const settings = await getGlobalSettings()

  return (
    <SiteHeader
      initialSettings={{
        company_email: settings.company_email || COMPANY.email,
        company_phone: settings.company_phone || COMPANY.phone,
      }}
    />
  )
}
