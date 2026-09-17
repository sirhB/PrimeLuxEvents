import Link from 'next/link'
import { Mail, MessageSquare, Phone } from 'lucide-react'
import { COMPANY } from '@/lib/company'

export function OrderSupportCta({ orderId }: { orderId: string }) {
  const shortId = orderId.slice(0, 8).toUpperCase()
  const mailSubject = encodeURIComponent(`Help with order ${shortId}`)
  const mailBody = encodeURIComponent(
    `Hi PrimeLux,\n\nI need help with order ${shortId}.\n\n`,
  )

  return (
    <div className="surface-panel rounded-md border border-gold/10 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="font-serif text-lg font-bold">Need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Message us in your account first — we reply during business hours. Phone is for urgent
          delivery-day issues.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="/account/messages" className="lux-cta w-full justify-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Message support
        </Link>
        <a
          href={`mailto:${COMPANY.email}?subject=${mailSubject}&body=${mailBody}`}
          className="lux-cta-ghost w-full justify-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Email {COMPANY.email}
        </a>
        <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, '')}`} className="lux-cta-ghost w-full justify-center gap-2">
          <Phone className="h-4 w-4" />
          Call {COMPANY.phone}
        </a>
      </div>
    </div>
  )
}
