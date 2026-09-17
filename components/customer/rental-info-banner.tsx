import { COMPANY } from '@/lib/company'
import { MapPin, Clock, CreditCard } from 'lucide-react'

/** Compact customer-facing facts near browse / cart / checkout decisions. */
export function RentalInfoBanner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`surface-panel rounded-md px-4 py-3 md:px-6 md:py-4 ${className}`}
      role="note"
      aria-label="Rental information"
    >
      <ul className="grid gap-3 sm:grid-cols-3 text-sm font-light text-muted-foreground">
        <li className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
              Delivery area
            </span>
            {COMPANY.serviceAreaLong}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
              Lead time
            </span>
            Book 4–8 weeks ahead for peak weekends; shorter lead times often available — call {COMPANY.phone}.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CreditCard className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
              Deposit
            </span>
            Reserve with ~50% deposit or pay in full at checkout. Balance due before delivery.
          </span>
        </li>
      </ul>
    </div>
  )
}
