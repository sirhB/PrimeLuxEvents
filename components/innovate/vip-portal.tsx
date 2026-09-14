'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { VIP_HARDWARE } from '@/lib/innovate/catalog'
import { priceVip } from '@/lib/innovate/pricing'
import {
  loadVipEvent,
  loadVipGuests,
  makeGuestToken,
  saveVipEvent,
  saveVipGuests,
  type VipGuest,
} from '@/lib/innovate/drafts'
import type { InnovateQuote } from '@/lib/innovate/types'
import { generateQRCode } from '@/lib/qr'
import { QuotePanel } from '@/components/innovate/quote-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function parseManifest(raw: string): Omit<VipGuest, 'id' | 'checkedIn' | 'token'>[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim())
      const name = parts[0] || 'Guest'
      const email = parts[1] || ''
      const tierRaw = (parts[2] || 'standard').toLowerCase()
      const tier: VipGuest['tier'] =
        tierRaw === 'vvip' || tierRaw === 'vip' ? tierRaw : 'standard'
      return { name, email, tier }
    })
}

export function VipPortal() {
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [manifest, setManifest] = useState(
    'Alex Rivera, alex@example.com, vip\nJordan Lee, jordan@example.com, standard\nSam Chen, sam@example.com, vvip',
  )
  const [guests, setGuests] = useState<VipGuest[]>([])
  const [hardwareSkus, setHardwareSkus] = useState<string[]>(['kiosk-stand', 'badge-printer'])
  const [includeService, setIncludeService] = useState(true)
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const [welcomeName, setWelcomeName] = useState('Welcome')

  useEffect(() => {
    const meta = loadVipEvent()
    setEventName(meta.name)
    setEventDate(meta.date)
    setVenue(meta.venue)
    setGuests(loadVipGuests())
  }, [])

  useEffect(() => {
    saveVipEvent({ name: eventName, date: eventDate, venue })
  }, [eventName, eventDate, venue])

  useEffect(() => {
    saveVipGuests(guests)
  }, [guests])

  const lines = useMemo(
    () =>
      priceVip({
        guestCount: guests.length || parseManifest(manifest).length,
        hardwareSkus,
        includeService,
      }),
    [guests.length, manifest, hardwareSkus, includeService],
  )

  const quote: InnovateQuote = {
    studio: 'vip',
    title: 'VIP Guest Check-In',
    clientLabel: eventName || undefined,
    lines,
    config: {
      eventName,
      eventDate,
      venue,
      guestCount: guests.length,
      hardwareSkus,
      includeService,
    },
    updatedAt: new Date().toISOString(),
  }

  const importGuests = () => {
    const parsed = parseManifest(manifest)
    if (parsed.length === 0) {
      toast.error('No guests found in manifest')
      return
    }
    const next: VipGuest[] = parsed.map((g) => ({
      ...g,
      id: makeGuestToken(),
      checkedIn: false,
      token: makeGuestToken(),
    }))
    setGuests(next)
    setQrMap({})
    toast.success(`Imported ${next.length} guests`)
  }

  const generatePasses = async () => {
    if (guests.length === 0) {
      toast.error('Import guests first')
      return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const entries = await Promise.all(
      guests.map(async (g) => {
        const url = `${origin}/innovate/vip/check-in?token=${encodeURIComponent(g.token)}`
        const dataUrl = await generateQRCode(url)
        return [g.token, dataUrl] as const
      }),
    )
    setQrMap(Object.fromEntries(entries))
    toast.success('QR passes generated')
  }

  const toggleHardware = (sku: string) => {
    setHardwareSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku],
    )
  }

  const checkedIn = guests.filter((g) => g.checkedIn).length

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-[36vh] overflow-hidden border-b border-[var(--ink)]/10 bg-[#121110] lg:border-b-0 lg:border-r">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(184,149,107,0.35), transparent 55%)',
            }}
          />
          <div className="relative flex h-full min-h-[36vh] flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--champagne)]">
              Kiosk welcome preview
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--linen)] md:text-5xl">
              {welcomeName}
            </h2>
            <p className="mt-3 max-w-md text-sm text-[var(--linen)]/60">
              {eventName || 'Untitled event'}
              {venue ? ` · ${venue}` : ''}
              {eventDate ? ` · ${eventDate}` : ''}
            </p>
            <p className="mt-6 text-xs text-[var(--linen)]/40">
              Checked in {checkedIn}/{guests.length || 0}
            </p>
          </div>
        </div>

        <div className="space-y-8 bg-[var(--linen)] p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Event name
              </span>
              <input
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value)
                  if (e.target.value) setWelcomeName(`Welcome to ${e.target.value}`)
                }}
                className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Date
              </span>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Venue
              </span>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Guest manifest (CSV: name, email, tier)
            </p>
            <textarea
              value={manifest}
              onChange={(e) => setManifest(e.target.value)}
              rows={5}
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-[var(--champagne)]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={importGuests} className="bg-[var(--ink)] text-[var(--linen)]">
                Import guests
              </Button>
              <Button type="button" variant="outline" onClick={generatePasses}>
                Generate QR passes
              </Button>
              <Button asChild variant="outline">
                <Link href="/innovate/vip/check-in">Open check-in desk</Link>
              </Button>
            </div>
          </div>

          {guests.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
                Guests ({guests.length})
              </p>
              <ul className="max-h-64 divide-y divide-[var(--ink)]/10 overflow-auto border border-[var(--ink)]/10">
                {guests.map((g) => (
                  <li key={g.id} className="flex items-center gap-4 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{g.name}</p>
                      <p className="truncate text-xs text-[var(--ink)]/45">
                        {g.email || '—'} · {g.tier}
                        {g.checkedIn ? ' · checked in' : ''}
                      </p>
                    </div>
                    {qrMap[g.token] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrMap[g.token]} alt={`QR for ${g.name}`} className="h-14 w-14 bg-white p-0.5" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-[var(--ink)]/35">
                        No QR
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/45">
              Entry hardware
            </p>
            <div className="flex flex-wrap gap-2">
              {VIP_HARDWARE.map((hw) => (
                <button
                  key={hw.sku}
                  type="button"
                  onClick={() => toggleHardware(hw.sku)}
                  className={cn(
                    'border px-3 py-1.5 text-xs transition-colors',
                    hardwareSkus.includes(hw.sku)
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--linen)]'
                      : 'border-[var(--ink)]/15 text-[var(--ink)]/70',
                  )}
                >
                  {hw.label}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-[var(--ink)]/70">
              <input
                type="checkbox"
                checked={includeService}
                onChange={(e) => setIncludeService(e.target.checked)}
              />
              Include digital portal service fee
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
