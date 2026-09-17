'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCentsWithCommas } from '@/lib/format-money'
import { saveDraft } from '@/lib/innovate/drafts'
import {
  formatQuoteSummary,
  quoteTotalCents,
  type InnovateQuote,
} from '@/lib/innovate/types'
import { cn } from '@/lib/utils'

export function QuotePanel({
  quote,
  draftId,
  onDraftSaved,
  className,
}: {
  quote: InnovateQuote
  draftId?: string | null
  onDraftSaved?: (id: string) => void
  className?: string
}) {
  const [copied, setCopied] = useState<'json' | 'summary' | null>(null)
  const total = quoteTotalCents(quote)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(quote, null, 2))
    setCopied('json')
    toast.success('Quote JSON copied')
  }

  const copySummary = async () => {
    await navigator.clipboard.writeText(formatQuoteSummary(quote))
    setCopied('summary')
    toast.success('Quote summary copied')
  }

  const persist = () => {
    const saved = saveDraft(quote, draftId ?? undefined)
    onDraftSaved?.(saved.id)
    toast.success(draftId ? 'Draft updated' : 'Draft saved — reopen anytime from Innovate')
  }

  return (
    <aside
      className={cn(
        'flex flex-col border border-[var(--linen)]/10 bg-[var(--surface-elevated)] text-[var(--linen)] backdrop-blur',
        className,
      )}
    >
      <div className="border-b border-[var(--linen)]/10 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--champagne)]">
          Live quote
          {draftId ? ' · draft' : ''}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-[var(--linen)]">{quote.title}</h2>
        {quote.clientLabel ? (
          <p className="mt-1 text-sm text-[var(--linen)]/55">{quote.clientLabel}</p>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
        {quote.lines.length === 0 ? (
          <p className="text-sm text-[var(--linen)]/45">Configure options to build a quote.</p>
        ) : (
          quote.lines.map((line) => (
            <div
              key={`${line.sku}-${line.label}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-[var(--linen)]">{line.label}</p>
                <p className="text-[11px] uppercase tracking-wider text-[var(--linen)]/40">
                  {line.category}
                  {line.qty > 1 ? ` · ×${line.qty}` : ''}
                </p>
              </div>
              <p className="shrink-0 tabular-nums text-[var(--linen)]/80">
                {formatCentsWithCommas(line.unitPrice * line.qty)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--linen)]/10 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--linen)]/45">Total</span>
          <span
            key={total}
            className="font-serif text-3xl tabular-nums text-[var(--linen)] transition-all duration-300"
          >
            {formatCentsWithCommas(total)}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="justify-start gap-2 border-[var(--linen)]/15 bg-transparent text-[var(--linen)] hover:bg-[var(--linen)]/5 hover:text-[var(--linen)]"
            onClick={copySummary}
          >
            {copied === 'summary' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy summary
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start gap-2 border-[var(--linen)]/15 bg-transparent text-[var(--linen)] hover:bg-[var(--linen)]/5 hover:text-[var(--linen)]"
            onClick={copyJson}
          >
            {copied === 'json' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy JSON
          </Button>
          <Button
            type="button"
            className="justify-start gap-2 bg-[var(--champagne)] text-[var(--ink)] hover:bg-[var(--signal)]"
            onClick={persist}
          >
            <Save className="h-4 w-4" />
            {draftId ? 'Update draft' : 'Save draft'}
          </Button>
        </div>
      </div>
    </aside>
  )
}
