import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClientQuote } from '@/components/account/client-quote'
import { loadClientQuote } from '@/lib/carts/load'

export const dynamic = 'force-dynamic'

export default async function QuotePage({ params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params
  const cart = await loadClientQuote(cartId) // RPC: shared quotes on the client's own event, client prices only
  if (!cart) notFound()
  return (
    <div>
      <Link href="/account/event" className="mb-6 inline-flex min-h-11 items-center text-sm text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]">← Your event</Link>
      <ClientQuote cart={cart} />
    </div>
  )
}
