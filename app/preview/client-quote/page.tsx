import { ClientQuote } from '@/components/account/client-quote'
import { sampleQuote } from '@/lib/carts/sample'

export const dynamic = 'force-dynamic'

export default function ClientQuotePreview() {
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] px-4 py-6 text-[var(--dashboard-text)] md:p-10">
      <ClientQuote cart={sampleQuote()} demo />
    </div>
  )
}
