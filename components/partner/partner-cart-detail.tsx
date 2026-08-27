'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/components/providers/stripe-provider'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import {
  cancelSharedCart,
  createPartnerSettlePaymentIntent,
  settleSharedCartWithPrimeLux,
} from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Loader2, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type Cart = {
  id: string
  share_token: string
  title: string | null
  client_name: string
  client_email: string | null
  event_date: string | null
  venue_address: string | null
  delivery_address: string | null
  notes: string | null
  status: string
  retail_subtotal: number
  retail_setup_fee: number
  retail_tax_amount: number
  retail_delivery_fee: number
  retail_total: number
  trade_discount_amount: number
  trade_discount_name: string | null
  trade_total: number
  order_id: string | null
  items: any[]
}

export function PartnerCartDetailClient({ cart }: { cart: Cart }) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState(0)
  const [loadingPay, setLoadingPay] = useState(false)
  const [settling, setSettling] = useState(false)

  const sharePath = `/share/${cart.share_token}`

  const [mountedUrl, setMountedUrl] = useState(sharePath)
  useEffect(() => {
    setMountedUrl(`${window.location.origin}${sharePath}`)
  }, [sharePath])

  const canSettle = ['shared', 'accepted'].includes(cart.status) && !cart.order_id

  const startPayment = async () => {
    setLoadingPay(true)
    const result = await createPartnerSettlePaymentIntent(cart.id)
    setLoadingPay(false)
    if (result.error || !result.clientSecret) {
      toast.error(result.error || 'Could not start payment')
      return
    }
    setClientSecret(result.clientSecret)
    setPayAmount(result.amount || cart.trade_total)
  }

  const onPaid = async (paymentIntentId: string) => {
    setSettling(true)
    const result = await settleSharedCartWithPrimeLux({
      sharedCartId: cart.id,
      paymentIntentId,
    })
    setSettling(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Settled with PrimeLux')
    router.push(`/account/orders/${result.orderId}`)
    router.refresh()
  }

  const onCancel = async () => {
    const result = await cancelSharedCart(cart.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Cart cancelled')
    router.push('/account/partner/carts')
    router.refresh()
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(mountedUrl)
    toast.success('Link copied')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Shared cart
        </p>
        <h2 className="font-serif text-3xl font-light tracking-tight">
          {cart.title || cart.client_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {cart.client_name}
          {cart.client_email ? ` · ${cart.client_email}` : ''}
          {cart.event_date ? ` · ${new Date(cart.event_date).toLocaleDateString()}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full" onClick={copyLink}>
          <Copy className="h-3.5 w-3.5" /> Copy client link
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-full">
          <Link href={mountedUrl} target="_blank">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Link>
        </Button>
        {canSettle && (
          <Button type="button" variant="ghost" size="sm" className="rounded-full text-destructive" onClick={onCancel}>
            Cancel cart
          </Button>
        )}
      </div>

      <div className="grid gap-6 rounded-2xl border border-[var(--champagne,#B8956B)]/25 bg-white/50 p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Client pays you (retail)
          </p>
          <p className="font-serif text-3xl font-light">{formatCentsWithCommas(cart.retail_total)}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Subtotal {formatCentsWithCommas(cart.retail_subtotal)}</li>
            <li>Setup {formatCentsWithCommas(cart.retail_setup_fee)}</li>
            <li>Tax {formatCentsWithCommas(cart.retail_tax_amount)}</li>
            <li>Delivery {formatCentsWithCommas(cart.retail_delivery_fee)}</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            You pay PrimeLux (trade)
          </p>
          <p className="font-serif text-3xl font-light text-[var(--champagne,#B8956B)]">
            {formatCentsWithCommas(cart.trade_total)}
          </p>
          <p className="text-xs text-muted-foreground">
            Discount {formatCentsWithCommas(cart.trade_discount_amount)}
            {cart.trade_discount_name ? ` · ${cart.trade_discount_name}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Your margin on merchandise ≈{' '}
            {formatCentsWithCommas(Math.max(0, cart.retail_total - cart.trade_total))}
          </p>
        </div>
      </div>

      {cart.status === 'settled' && cart.order_id && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          Settled with PrimeLux.{' '}
          <Link href={`/account/orders/${cart.order_id}`} className="underline underline-offset-2">
            View order
          </Link>
        </div>
      )}

      {canSettle && !clientSecret && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Confirm you have collected retail from your client, then pay PrimeLux the trade total.
            The client link never accepts payment.
          </p>
          <Button
            type="button"
            className="rounded-full"
            onClick={startPayment}
            disabled={loadingPay}
          >
            {loadingPay ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Pay PrimeLux ${formatCentsWithCommas(cart.trade_total)}`
            )}
          </Button>
        </div>
      )}

      {canSettle && clientSecret && stripePromise && (
        <div className="space-y-4 rounded-2xl border bg-white p-6">
          <h3 className="font-serif text-xl font-light">Settle with PrimeLux</h3>
          {settling ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating order…
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm onSuccess={onPaid} amount={payAmount} />
            </Elements>
          )}
        </div>
      )}

      <div className="space-y-3 border-t pt-8">
        <h3 className="font-serif text-xl font-light">Line items</h3>
        <ul className="divide-y text-sm">
          {(cart.items || []).map((item: any, idx: number) => (
            <li key={idx} className="flex justify-between py-3">
              <span>
                {item.packageData?.name || item.productId || 'Item'}
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
