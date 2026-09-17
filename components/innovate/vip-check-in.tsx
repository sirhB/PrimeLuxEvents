'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  loadVipEvent,
  loadVipGuests,
  saveVipGuests,
  type VipGuest,
} from '@/lib/innovate/drafts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function VipCheckInDesk() {
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const [guests, setGuests] = useState<VipGuest[]>([])
  const [eventName, setEventName] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    setGuests(loadVipGuests())
    setEventName(loadVipEvent().name)
  }, [])

  useEffect(() => {
    if (!tokenParam || guests.length === 0) return
    const guest = guests.find((g) => g.token === tokenParam)
    if (guest && !guest.checkedIn) {
      const next = guests.map((g) =>
        g.token === tokenParam ? { ...g, checkedIn: true } : g,
      )
      setGuests(next)
      saveVipGuests(next)
      toast.success(`${guest.name} checked in`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenParam, guests.length])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.token.toLowerCase().includes(q),
    )
  }, [guests, query])

  const checkIn = (id: string) => {
    const next = guests.map((g) => (g.id === id ? { ...g, checkedIn: true } : g))
    setGuests(next)
    saveVipGuests(next)
    const guest = next.find((g) => g.id === id)
    if (guest) toast.success(`${guest.name} checked in`)
  }

  const undo = (id: string) => {
    const next = guests.map((g) => (g.id === id ? { ...g, checkedIn: false } : g))
    setGuests(next)
    saveVipGuests(next)
  }

  const arrived = guests.filter((g) => g.checkedIn).length

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-[var(--linen)] md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--champagne)]">
            Check-in desk
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[var(--linen)]">
            {eventName || 'VIP Check-In'}
          </h1>
          <p className="mt-1 text-sm text-[var(--linen)]/55">
            {arrived}/{guests.length} arrived
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-[var(--linen)]/20 bg-transparent text-[var(--linen)] hover:bg-[var(--linen)]/5"
        >
          <Link href="/innovate/vip">Back to VIP portal</Link>
        </Button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, or token"
        className="mt-8 w-full border border-[var(--linen)]/15 bg-transparent px-3 py-2.5 text-sm text-[var(--linen)] outline-none placeholder:text-[var(--linen)]/35 focus:border-[var(--champagne)]"
      />

      {guests.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--linen)]/50">
          No guests loaded. Import a manifest in the VIP portal first (same browser).
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--linen)]/10 border-y border-[var(--linen)]/10">
          {filtered.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-[var(--linen)]">{g.name}</p>
                <p className="text-xs uppercase tracking-wider text-[var(--linen)]/40">
                  {g.tier}
                  {g.email ? ` · ${g.email}` : ''}
                </p>
              </div>
              {g.checkedIn ? (
                <button
                  type="button"
                  onClick={() => undo(g.id)}
                  className={cn(
                    'border border-[var(--sage)]/40 px-3 py-1.5 text-xs text-[var(--sage)]',
                  )}
                >
                  Arrived · Undo
                </button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="bg-[var(--champagne)] text-[var(--ink)] hover:bg-[var(--signal)]"
                  onClick={() => checkIn(g.id)}
                >
                  Check in
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
