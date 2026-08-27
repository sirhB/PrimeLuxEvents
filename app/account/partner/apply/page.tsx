import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { PartnerApplyForm } from '@/components/partner/partner-apply-form'
import { redirect } from 'next/navigation'

export default async function PartnerApplyPage() {
  const partner = await getPartnerProfileForUser()

  if (partner?.status === 'active') {
    redirect('/account/partner')
  }

  const mode = !partner
    ? 'apply'
    : partner.status === 'pending'
      ? 'pending'
      : partner.status === 'suspended'
        ? 'suspended'
        : 'revoked'

  return (
    <div className="py-4">
      <PartnerApplyForm mode={mode} companyName={partner?.company_name} />
    </div>
  )
}
