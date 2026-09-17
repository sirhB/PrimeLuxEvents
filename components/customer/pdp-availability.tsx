'use client'

import { CalendarDays, MapPin, Package } from 'lucide-react'
import { format } from 'date-fns'
import { useCart } from '@/components/providers/cart-provider'
import { COMPANY } from '@/lib/company'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  stock: number
  className?: string
}

/** Event-date availability + delivery logistics on the PDP. */
export function PdpAvailabilityPanel({ stock, className }: Props) {
  const { eventDetails, openEventDetails } = useCart()
  const eventDate = eventDetails?.date ? new Date(eventDetails.date) : null
  const available = stock > 0

  return (
    <div
      className={cn(
        'rounded-md border border-white/10 bg-white/5 px-5 py-4 space-y-4',
        className,
      )}
      role="region"
      aria-label="Availability and delivery"
    >
      <div className="flex items-start gap-3">
        <Package className="h-4 w-4 text-gold shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Availability</p>
          {eventDate ? (
            <p className="mt-1 text-sm text-gray-300 font-light">
              {available
                ? `In stock for ${format(eventDate, 'MMM d, yyyy')} — ${stock} unit${stock === 1 ? '' : 's'} typically available.`
                : `Low stock for ${format(eventDate, 'MMM d, yyyy')}. Message us to confirm before you reserve.`}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-300 font-light">
              {available
                ? `${stock} unit${stock === 1 ? '' : 's'} typically available. Set your event date to check this weekend.`
                : 'Ask us to confirm stock for your event date.'}{' '}
              <button
                type="button"
                onClick={openEventDetails}
                className="text-gold underline underline-offset-2 font-medium"
              >
                Set event date
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <CalendarDays className="h-4 w-4 text-gold shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Lead time</p>
          <p className="mt-1 text-sm text-gray-300 font-light">
            Book 4–8 weeks ahead for peak Fri–Sun weekends. Shorter lead times often work — call{' '}
            {COMPANY.phone}.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Delivery</p>
          <p className="mt-1 text-sm text-gray-300 font-light">
            White-glove delivery &amp; pickup across {COMPANY.serviceArea}. From our Shelton, CT
            warehouse. Fee calculated at checkout from your venue address.{' '}
            <Link href="/faq" className="text-gold underline underline-offset-2">
              Delivery FAQ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
