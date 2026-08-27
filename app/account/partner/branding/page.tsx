import { redirect } from 'next/navigation'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { PartnerBrandingForm } from '@/components/partner/partner-branding-form'

export default async function PartnerBrandingPage() {
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  return (
    <div className="py-2">
      <PartnerBrandingForm
        initial={{
          company_name: partner.company_name,
          brand_display_name: partner.brand_display_name,
          brand_logo_url: partner.brand_logo_url,
          brand_accent_color: partner.brand_accent_color,
          brand_tagline: partner.brand_tagline,
          business_email: partner.business_email,
          business_address: partner.business_address,
          business_city: partner.business_city,
          business_region: partner.business_region,
          business_postal: partner.business_postal,
          invoice_footer_note: partner.invoice_footer_note,
          phone: partner.phone,
          website: partner.website,
        }}
      />
    </div>
  )
}
