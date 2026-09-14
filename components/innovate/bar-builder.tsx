'use client'

import { useMemo, useState } from 'react'
import { BAR_ADDONS, BAR_BASES, BAR_WRAP_OPTIONS } from '@/lib/innovate/catalog'
import { priceBar, type BarConfig } from '@/lib/innovate/pricing'
import type { InnovateQuote } from '@/lib/innovate/types'
import { QuotePanel } from '@/components/innovate/quote-panel'
import { cn } from '@/lib/utils'

export function BarBuilder() {
  const [baseId, setBaseId] = useState<(typeof BAR_BASES)[number]['id']>('marble-top')
  const [addonIds, setAddonIds] = useState<string[]>(['ice-well'])
  const [wrapId, setWrapId] =
    useState<(typeof BAR_WRAP_OPTIONS)[number]['id']>('vinyl-wrap')
  const [brandText, setBrandText] = useState('HOUSE')
  const [clientLabel, setClientLabel] = useState('')

  const config: BarConfig = { baseId, addonIds, wrapId, brandText }
  const lines = useMemo(
    () => priceBar(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseId, addonIds, wrapId, brandText],
  )

  const quote: InnovateQuote = {
    studio: 'bar',
    title: 'Modular Bar Station',
    clientLabel: clientLabel || undefined,
    lines,
    config,
    updatedAt: new Date().toISOString(),
  }

  const base = BAR_BASES.find((b) => b.id === baseId) ?? BAR_BASES[0]

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-[42vh] flex-1 overflow-hidden border-b border-[var(--ink)]/10 bg-[#1a1714] lg:min-h-0 lg:border-b-0 lg:border-r">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(184,149,107,0.35), transparent 55%)',
            }}
          />
          <div className="absolute bottom-[20%] left-1/2 w-[min(28rem,78%)] -translate-x-1/2">
            <div
              className={cn(
                'relative h-28 w-full transition-all duration-500',
                base.id === 'marble-top' && 'bg-gradient-to-b from-[#e8e4dc] to-[#b8b0a4]',
                base.id === 'tufted-velvet' && 'bg-gradient-to-b from-[#5a2a38] to-[#2a1218]',
                base.id === 'led-underlit' &&
                  'bg-gradient-to-b from-[#2a2e36] to-[#121418] shadow-[0_20px_40px_rgba(184,149,107,0.45)]',
              )}
            >
              {base.id === 'tufted-velvet' && (
                <div className="absolute inset-2 grid grid-cols-6 gap-1 opacity-40">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-full border border-white/20" />
                  ))}
                </div>
              )}
              {wrapId !== 'none' && (
                <div className="absolute inset-x-8 bottom-3 top-8 flex items-center justify-center border border-[var(--linen)]/25 bg-black/25">
                  <span className="font-serif text-lg tracking-[0.2em] text-[var(--linen)]/90 md:text-xl">
                    {brandText || 'LOGO'}
                  </span>
                </div>
              )}
              {base.id === 'led-underlit' && (
                <div className="absolute -bottom-1 left-2 right-2 h-1 bg-[var(--champagne)] shadow-[0_0_18px_rgba(184,149,107,0.9)]" />
              )}
            </div>
            <div className="mx-auto h-10 w-[92%] bg-black/50" />
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/50">
              {base.label}
              {addonIds.length ? ` · +${addonIds.length} add-ons` : ''}
            </p>
          </div>
        </div>

        <div className="space-y-8 bg-[var(--linen)] p-6 lg:p-8">
          <label className="block max-w-md">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Client label
            </span>
            <input
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
            />
          </label>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Base structure
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {BAR_BASES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBaseId(b.id)}
                  className={cn(
                    'border px-4 py-4 text-left transition-colors',
                    baseId === b.id
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
                      : 'border-[var(--ink)]/15 hover:border-[var(--ink)]/35',
                  )}
                >
                  <span className="block font-serif text-lg">{b.label}</span>
                  <span
                    className={cn(
                      'mt-1 block text-xs',
                      baseId === b.id ? 'text-[var(--linen)]/65' : 'text-[var(--ink)]/50',
                    )}
                  >
                    {b.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Add-ons
            </p>
            <div className="flex flex-wrap gap-2">
              {BAR_ADDONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAddon(a.id)}
                  className={cn(
                    'border px-3 py-1.5 text-xs transition-colors',
                    addonIds.includes(a.id)
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
                      : 'border-[var(--ink)]/15 text-[var(--ink)]/70',
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Branded panel
              </p>
              <div className="flex flex-wrap gap-2">
                {BAR_WRAP_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWrapId(w.id)}
                    className={cn(
                      'border px-3 py-1.5 text-xs transition-colors',
                      wrapId === w.id
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
                        : 'border-[var(--ink)]/15 text-[var(--ink)]/70',
                    )}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Brand text
              </span>
              <input
                value={brandText}
                onChange={(e) => setBrandText(e.target.value.slice(0, 24))}
                disabled={wrapId === 'none'}
                className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)] disabled:opacity-40"
              />
            </label>
          </div>
        </div>
      </div>

      <QuotePanel
        quote={quote}
        className="w-full shrink-0 lg:sticky lg:top-0 lg:h-screen lg:w-80 xl:w-96"
      />
    </div>
  )
}
