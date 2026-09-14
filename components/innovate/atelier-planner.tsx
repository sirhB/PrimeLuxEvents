'use client'

import { useEffect, useMemo, useState } from 'react'
import { ATELIER_VIBES } from '@/lib/innovate/catalog'
import {
  defaultAtelierHardware,
  priceAtelier,
  type AtelierConfig,
} from '@/lib/innovate/pricing'
import type { InnovateQuote } from '@/lib/innovate/types'
import { QuotePanel } from '@/components/innovate/quote-panel'
import { cn } from '@/lib/utils'

export function AtelierPlanner() {
  const [vibeId, setVibeId] =
    useState<(typeof ATELIER_VIBES)[number]['id']>('winter-solstice')
  const [hardwareQty, setHardwareQty] = useState<Record<string, number>>(() =>
    defaultAtelierHardware('winter-solstice'),
  )
  const [clientLabel, setClientLabel] = useState('')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setHardwareQty(defaultAtelierHardware(vibeId))
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 500)
    return () => clearTimeout(t)
  }, [vibeId])

  const vibe = ATELIER_VIBES.find((v) => v.id === vibeId) ?? ATELIER_VIBES[0]
  const config: AtelierConfig = { vibeId, hardwareQty }
  const lines = useMemo(
    () => priceAtelier(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vibeId, hardwareQty],
  )

  const quote: InnovateQuote = {
    studio: 'atelier',
    title: 'PrimeLux Atelier',
    clientLabel: clientLabel || undefined,
    lines,
    config,
    updatedAt: new Date().toISOString(),
  }

  const setQty = (sku: string, qty: number) => {
    setHardwareQty((prev) => ({ ...prev, [sku]: Math.max(0, qty) }))
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            'relative min-h-[42vh] flex-1 overflow-hidden border-b border-[var(--ink)]/10 transition-all duration-700 lg:min-h-0 lg:border-b-0 lg:border-r',
            pulse && 'scale-[1.01]',
          )}
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${vibe.palette.accent}55, transparent 60%), linear-gradient(160deg, ${vibe.palette.secondary}, #0a0a0a 70%)`,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1/2 opacity-60 transition-colors duration-700"
            style={{
              background: `linear-gradient(180deg, ${vibe.palette.primary}33, transparent)`,
            }}
          />
          <div className="absolute bottom-[18%] left-[12%] h-16 w-28 rounded-t-full bg-black/40" />
          <div className="absolute bottom-[16%] right-[18%] h-20 w-36 bg-black/35" />
          <div className="absolute bottom-[14%] left-1/2 h-10 w-48 -translate-x-1/2 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40"
            style={{
              background: `linear-gradient(0deg, ${vibe.palette.primary}44, transparent)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-8 px-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">Vibe preview</p>
            <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">{vibe.label}</h2>
            <p className="mt-2 text-sm text-white/65">{vibe.tagline}</p>
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
              placeholder="e.g. New Year Lounge"
            />
          </label>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Vibe selector
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ATELIER_VIBES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVibeId(v.id)}
                  className={cn(
                    'border px-4 py-4 text-left transition-all duration-300',
                    vibeId === v.id
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
                      : 'border-[var(--ink)]/15 hover:border-[var(--ink)]/35',
                  )}
                >
                  <span className="block font-serif text-lg">{v.label}</span>
                  <span
                    className={cn(
                      'mt-1 block text-xs',
                      vibeId === v.id ? 'text-[var(--linen)]/65' : 'text-[var(--ink)]/50',
                    )}
                  >
                    {v.tagline}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Hardware bundle
            </p>
            <ul className="divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/10">
              {vibe.hardware.map((hw) => (
                <li key={hw.sku} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--ink)]">{hw.label}</p>
                    <p className="text-[11px] text-[var(--ink)]/40">{hw.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 border border-[var(--ink)]/15 text-sm"
                      onClick={() => setQty(hw.sku, (hardwareQty[hw.sku] ?? 0) - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center tabular-nums text-sm">
                      {hardwareQty[hw.sku] ?? 0}
                    </span>
                    <button
                      type="button"
                      className="h-8 w-8 border border-[var(--ink)]/15 text-sm"
                      onClick={() => setQty(hw.sku, (hardwareQty[hw.sku] ?? 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
