'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'

export function BuildRentalFromFavorites({ productIds }: { productIds: string[] }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (productIds.length === 0) return null

  const onClick = () => {
    setBusy(true)
    productIds.forEach((id) => addItem(id, 1))
    toast.success('Added favorites to your rental cart')
    router.push('/cart')
    setBusy(false)
  }

  return (
    <button type="button" className="lux-cta" onClick={onClick} disabled={busy}>
      Build rental from favorites <ArrowRight className="h-4 w-4" />
    </button>
  )
}
