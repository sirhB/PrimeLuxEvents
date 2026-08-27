import { notFound, redirect } from 'next/navigation'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { getPartnerSharedCart } from '@/app/actions/partners'
import { PartnerCartDetailClient } from '@/components/partner/partner-cart-detail'

export default async function PartnerCartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const partner = await getPartnerProfileForUser()
  if (!partner || partner.status !== 'active') redirect('/account/partner/apply')

  const result = await getPartnerSharedCart(id)
  if (!result.cart) notFound()

  return <PartnerCartDetailClient cart={result.cart as any} />
}
