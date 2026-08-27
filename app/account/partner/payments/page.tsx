import { redirect } from 'next/navigation'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { PartnerPaymentMethodsForm } from '@/components/partner/partner-payment-methods-form'

export default async function PartnerPaymentsPage() {
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  return (
    <div className="py-2">
      <PartnerPaymentMethodsForm
        initial={{
          payment_zelle: partner.payment_zelle,
          payment_venmo: partner.payment_venmo,
          payment_apple_cash: partner.payment_apple_cash,
          payment_cash_app: partner.payment_cash_app,
          payment_other_label: partner.payment_other_label,
          payment_other_value: partner.payment_other_value,
          payment_instructions: partner.payment_instructions,
        }}
      />
    </div>
  )
}
