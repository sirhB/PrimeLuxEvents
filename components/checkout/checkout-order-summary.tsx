'use client'

import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/stripe'
import { cn } from '@/lib/utils'

export type CheckoutTotals = {
  subtotal: number
  discountAmount?: number
  discountName?: string
  setupFee?: number
  taxRate: number
  taxAmount: number
  deliveryFee: number
  totalAmount: number
}

function isTradeDiscount(totals: CheckoutTotals) {
  if (!totals.discountAmount || totals.discountAmount <= 0) return false
  const name = (totals.discountName || '').toLowerCase()
  return name.includes('trade') || name.includes('partner')
}

export function TradeRateChip({ label }: { label?: string | null }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-cta)] border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold"
      role="status"
    >
      <Check className="h-3 w-3" aria-hidden />
      {label?.trim() || 'Trade rate applied'}
    </div>
  )
}

type Props = {
  totals: CheckoutTotals | null
  isCalculating?: boolean
  itemCount?: number
  showAgreement?: boolean
  agreesToRentalAgreement?: boolean
  onToggleAgreement?: () => void
  children?: React.ReactNode
  className?: string
}

export function CheckoutOrderSummary({
  totals,
  isCalculating,
  itemCount,
  showAgreement,
  agreesToRentalAgreement,
  onToggleAgreement,
  children,
  className,
}: Props) {
  const trade = totals ? isTradeDiscount(totals) : false

  return (
    <div
      className={cn(
        'lg:sticky lg:top-24 surface-panel rounded-md overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-gold/10',
        className,
      )}
    >
      <div className="bg-[var(--surface-muted)] text-foreground border-b border-border py-5 px-5 sm:px-6">
        <h3 className="text-lg sm:text-xl font-serif font-bold text-center">Order summary</h3>
        {typeof itemCount === 'number' && (
          <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        )}
      </div>
      <div className="p-5 sm:p-6 space-y-5">
        {trade && totals && (
          <div className="flex justify-center">
            <TradeRateChip label={totals.discountName} />
          </div>
        )}

        {totals ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</span>
            </div>
            {(totals.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="font-medium">{totals.discountName || 'Discount'}</span>
                <span className="font-medium">-{formatCurrency(totals.discountAmount || 0)}</span>
              </div>
            )}
            {(totals.setupFee ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Setup fee</span>
                <span className="font-medium text-foreground">{formatCurrency(totals.setupFee || 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({(totals.taxRate * 100).toFixed(2)}%)</span>
              <span className="font-medium text-foreground">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-foreground">
                {isCalculating ? '…' : formatCurrency(totals.deliveryFee)}
              </span>
            </div>
            <div className="pt-3 border-t border-gold/10 flex justify-between items-baseline">
              <span className="text-base font-serif font-bold text-foreground">Total</span>
              <span className="font-bold text-2xl text-gold">{formatCurrency(totals.totalAmount)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}

        {showAgreement && onToggleAgreement && (
          <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onToggleAgreement}
                className={cn(
                  'mt-0.5 h-5 w-5 rounded-[var(--radius-cta)] border-2 flex items-center justify-center shrink-0 transition-all',
                  agreesToRentalAgreement ? 'bg-gold border-gold' : 'border-gold/30 hover:border-gold',
                )}
                aria-pressed={agreesToRentalAgreement}
                aria-label="Agree to rental agreement"
              >
                {agreesToRentalAgreement && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
              </button>
              <label
                className="text-xs sm:text-sm font-medium cursor-pointer leading-relaxed text-foreground"
                onClick={onToggleAgreement}
              >
                I agree to the{' '}
                <Link
                  href="/rental-agreement"
                  target="_blank"
                  className="text-gold underline underline-offset-2 font-bold"
                  onClick={(e) => e.stopPropagation()}
                >
                  rental agreement
                </Link>
              </label>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
