'use client'

import { useMemo, useState } from 'react'
import {
  AMBIENCE_PRESETS,
  BACKDROP_FRAMES,
  FLOOR_MATERIALS,
} from '@/lib/innovate/catalog'
import { priceBackdrop, type BackdropConfig } from '@/lib/innovate/pricing'
import type { InnovateQuote } from '@/lib/innovate/types'
import { QuotePanel } from '@/components/innovate/quote-panel'
import { cn } from '@/lib/utils'

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
          : 'border-[var(--ink)]/15 text-[var(--ink)]/70 hover:border-[var(--ink)]/40',
      )}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
        {label}
      </span>
      {children}
    </label>
  )
}

export function BackdropStudio() {
  const [frameId, setFrameId] =
    useState<(typeof BACKDROP_FRAMES)[number]['id']>('arch-wall')
  const [materialId, setMaterialId] =
    useState<(typeof FLOOR_MATERIALS)[number]['id']>('matte-vinyl')
  const [widthFt, setWidthFt] = useState(12)
  const [lengthFt, setLengthFt] = useState(16)
  const [neonText, setNeonText] = useState('PrimeLux')
  const [includeLogo, setIncludeLogo] = useState(true)
  const [ambienceId, setAmbienceId] =
    useState<(typeof AMBIENCE_PRESETS)[number]['id']>('warm-dusk')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [clientLabel, setClientLabel] = useState('')

  const config: BackdropConfig = {
    frameId,
    materialId,
    widthFt,
    lengthFt,
    neonText,
    includeLogo,
    ambienceId,
  }

  const lines = useMemo(
    () => priceBackdrop(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frameId, materialId, widthFt, lengthFt, neonText, includeLogo, ambienceId],
  )

  const quote: InnovateQuote = {
    studio: 'backdrop',
    title: 'Backdrop & Floor Wrap',
    clientLabel: clientLabel || undefined,
    lines,
    config: { ...config, hasLogoPreview: Boolean(logoUrl) },
    updatedAt: new Date().toISOString(),
  }

  const ambience = AMBIENCE_PRESETS.find((a) => a.id === ambienceId) ?? AMBIENCE_PRESETS[0]
  const material = FLOOR_MATERIALS.find((m) => m.id === materialId) ?? FLOOR_MATERIALS[0]
  const frame = BACKDROP_FRAMES.find((f) => f.id === frameId) ?? BACKDROP_FRAMES[0]

  const onLogo = (file: File | null) => {
    if (!file) {
      setLogoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(file)
    setLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setIncludeLogo(true)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-[42vh] flex-1 overflow-hidden border-b border-[var(--ink)]/10 lg:min-h-0 lg:border-b-0 lg:border-r">
          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background:
                material.id === 'metallic-gold'
                  ? 'linear-gradient(145deg, #2a2218 0%, #5a4a32 40%, #c9a86c 100%)'
                  : material.id === 'marble-print'
                    ? 'linear-gradient(160deg, #ece7e0 0%, #cfc6bb 45%, #a89f94 100%)'
                    : 'linear-gradient(160deg, #1a1816 0%, #3a3530 55%, #6a6258 100%)',
            }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ background: ambience.overlay }}
          />
          <div
            className="absolute left-1/2 top-[18%] h-40 w-[70%] -translate-x-1/2 rounded-full blur-3xl transition-all duration-700"
            style={{ background: ambience.glow }}
          />

          <div
            className="absolute bottom-0 left-1/2 h-[38%] w-[92%] origin-bottom transition-all duration-500"
            style={{
              transform: 'translateX(-50%) perspective(800px) rotateX(58deg)',
              background:
                material.id === 'metallic-gold'
                  ? 'linear-gradient(90deg, #8a7040, #e8d090, #8a7040)'
                  : material.id === 'marble-print'
                    ? 'linear-gradient(90deg, #ddd6ce, #f5f1eb, #cfc7bd)'
                    : 'linear-gradient(90deg, #2c2a27, #4a4640, #2c2a27)',
              boxShadow: '0 0 40px rgba(0,0,0,0.35)',
            }}
          />

          <div className="absolute left-1/2 top-[22%] w-[58%] max-w-md -translate-x-1/2">
            <div
              className={cn(
                'relative mx-auto aspect-[4/3] border border-[var(--linen)]/30 bg-[var(--ink)]/25 backdrop-blur-sm transition-all duration-500',
                frame.id === 'arch-wall' && 'rounded-t-[50%] rounded-b-sm',
                frame.id === 'velvet-panels' && 'rounded-sm',
                frame.id === 'greenery-grid' &&
                  'rounded-sm [background-image:linear-gradient(rgba(138,154,139,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(138,154,139,0.35)_1px,transparent_1px)] [background-size:18%_22%]',
                frame.id === 'mirror-box' &&
                  'rounded-sm border-[var(--linen)]/60 shadow-[inset_0_0_40px_rgba(255,255,255,0.15)]',
              )}
            >
              {logoUrl && includeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="absolute left-1/2 top-6 h-12 w-auto max-w-[40%] -translate-x-1/2 object-contain opacity-90"
                />
              ) : null}
              {neonText.trim() ? (
                <p
                  className="absolute inset-x-4 bottom-8 text-center font-serif text-2xl tracking-wide text-[var(--linen)] md:text-3xl"
                  style={{
                    textShadow: `0 0 12px ${ambience.glow}, 0 0 28px ${ambience.glow}`,
                  }}
                >
                  {neonText}
                </p>
              ) : null}
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--linen)]/55">
              {frame.label} · {widthFt}×{lengthFt} ft
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-[var(--ink)]/10 bg-[var(--linen)] p-6 md:grid-cols-2 lg:p-8">
          <Field label="Client label (optional)">
            <input
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
              placeholder="e.g. Winter Gala — Acme"
            />
          </Field>

          <Field label="Frame">
            <div className="flex flex-wrap gap-2">
              {BACKDROP_FRAMES.map((f) => (
                <Chip key={f.id} active={frameId === f.id} onClick={() => setFrameId(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Floor material">
            <div className="flex flex-wrap gap-2">
              {FLOOR_MATERIALS.map((m) => (
                <Chip key={m.id} active={materialId === m.id} onClick={() => setMaterialId(m.id)}>
                  {m.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Ambience">
            <div className="flex flex-wrap gap-2">
              {AMBIENCE_PRESETS.map((a) => (
                <Chip key={a.id} active={ambienceId === a.id} onClick={() => setAmbienceId(a.id)}>
                  {a.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={`Floor width (${widthFt} ft)`}>
            <input
              type="range"
              min={6}
              max={40}
              value={widthFt}
              onChange={(e) => setWidthFt(Number(e.target.value))}
              className="w-full accent-[var(--champagne)]"
            />
          </Field>

          <Field label={`Floor length (${lengthFt} ft)`}>
            <input
              type="range"
              min={6}
              max={50}
              value={lengthFt}
              onChange={(e) => setLengthFt(Number(e.target.value))}
              className="w-full accent-[var(--champagne)]"
            />
          </Field>

          <Field label="Neon signage text">
            <input
              value={neonText}
              onChange={(e) => setNeonText(e.target.value.slice(0, 40))}
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
              placeholder="Event name"
            />
          </Field>

          <Field label="Logo upload">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
                className="text-sm file:mr-3 file:border-0 file:bg-[var(--ink)] file:px-3 file:py-1.5 file:text-xs file:text-[var(--linen)]"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--ink)]/70">
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                />
                Include logo fab fee
              </label>
            </div>
          </Field>
        </div>
      </div>

      <QuotePanel
        quote={quote}
        className="w-full shrink-0 lg:sticky lg:top-0 lg:h-screen lg:w-80 xl:w-96"
      />
    </div>
  )
}
