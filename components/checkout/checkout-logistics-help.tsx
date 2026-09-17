import { COMPANY } from '@/lib/company'
import { Info } from 'lucide-react'

/** Inline logistics help for checkout — customer self-serve clarity. */
export function CheckoutLogisticsHelp() {
  return (
    <aside className="surface-panel rounded-md p-4 sm:p-5 space-y-3 border-gold/20">
      <div className="flex items-center gap-2 text-gold">
        <Info className="h-4 w-4 shrink-0" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Before you continue</p>
      </div>
      <ul className="space-y-2 text-sm font-light text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground/90">Service area:</span> {COMPANY.serviceAreaLong} from our Shelton showroom.
        </li>
        <li>
          <span className="text-foreground/90">Delivery &amp; pickup:</span> tell us venue access (stairs, dock, gate codes) so the crew arrives prepared.
        </li>
        <li>
          <span className="text-foreground/90">Deposit:</span> pay about half now or the full balance. Remaining balance is due before delivery.
        </li>
        <li>
          <span className="text-foreground/90">Questions?</span>{' '}
          <a href={`tel:${COMPANY.phone.replace(/\D/g, '')}`} className="text-gold hover:underline">
            {COMPANY.phone}
          </a>
          {' · '}
          <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">
            {COMPANY.email}
          </a>
        </li>
      </ul>
    </aside>
  )
}
