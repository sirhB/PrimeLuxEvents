'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { submitEventPlan } from '@/app/plan/actions'
import type { VenueListing } from '@/lib/venues/directory'
import { cn } from '@/lib/utils'

const STEPS = ['Occasion', 'Date', 'Venue', 'Services', 'Rentals', 'Budget', 'Contact'] as const

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Bridal shower', 'Baby shower', 'Private dinner', 'Anniversary', 'Other']
const SERVICES = ['Planning', 'Design', 'Florals', 'Lighting design', 'Staffing', 'Catering coordination']
const RENTALS = ['Seating', 'Tables', 'Linens', 'Lounge', 'Lighting', 'Bars', 'Dance floor', 'Tents']
const BUDGETS = ['Under $2,500', '$2,500–$7,500', '$7,500–$15,000', '$15,000–$30,000', '$30,000 and above']

type Draft = {
  event_type: string
  event_date: string
  guest_count: string
  venue_choice: 'primelux' | 'own' | 'undecided' | ''
  venue_id: string
  venue_name: string
  services: string[]
  rentals: string[]
  budget_range: string
  contact_name: string
  contact_email: string
  contact_phone: string
  notes: string
  website: string
}

const EMPTY: Draft = {
  event_type: '',
  event_date: '',
  guest_count: '',
  venue_choice: '',
  venue_id: '',
  venue_name: '',
  services: [],
  rentals: [],
  budget_range: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
  website: '',
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function PlanFlow({ venues }: { venues: VenueListing[] }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState('')

  const guestCount = Number(draft.guest_count)
  const ready = useMemo(() => {
    if (step === 0) return Boolean(draft.event_type)
    if (step === 1) return Boolean(draft.event_date) && Number.isFinite(guestCount) && guestCount > 0
    if (step === 2) {
      if (draft.venue_choice === 'primelux') return Boolean(draft.venue_id)
      if (draft.venue_choice === 'own') return draft.venue_name.trim().length > 1
      return draft.venue_choice === 'undecided'
    }
    if (step === 3) return draft.services.length > 0
    if (step === 4) return true
    if (step === 5) return Boolean(draft.budget_range)
    return draft.contact_name.trim().length > 1 && draft.contact_email.includes('@') && draft.contact_phone.trim().length > 6
  }, [step, draft, guestCount])

  const patch = (partial: Partial<Draft>) => setDraft((current) => ({ ...current, ...partial }))

  async function finish() {
    setPending(true)
    setError('')
    const result = await submitEventPlan({
      event_type: draft.event_type as 'Wedding',
      event_date: draft.event_date || null,
      guest_count: guestCount || null,
      venue_choice: draft.venue_choice as 'primelux',
      venue_id: draft.venue_id || null,
      venue_name: draft.venue_name || null,
      services: draft.services as 'Planning'[],
      rentals: draft.rentals as 'Seating'[],
      budget_range: draft.budget_range as 'Under $2,500',
      contact_name: draft.contact_name,
      contact_email: draft.contact_email,
      contact_phone: draft.contact_phone,
      notes: draft.notes || null,
      website: draft.website,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error || 'Please try again.')
      return
    }
    setReference(result.reference || 'PL-RECEIVED')
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="lux-label">Received</p>
        <h1 className="mt-4 font-serif text-5xl font-medium">We have the plan.</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-[var(--theme-muted)]">Reference {reference}</p>
        <p className="mt-6 font-light leading-relaxed text-[var(--theme-muted)]">
          A planner will write back about the date, the room, and what should be in it.
        </p>
        <Link href="/" className="lux-cta mt-10">
          Return home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-28 md:pt-36">
      <p className="lux-label">Plan your event</p>
      <h1 className="mt-3 font-serif text-5xl font-medium leading-none md:text-6xl">Tell us the evening.</h1>
      <p className="mt-4 max-w-lg font-light text-[var(--theme-muted)]">
        Occasion, date, guests, venue, services, rentals, budget, and how to reach you.
      </p>

      <ol className="mt-8 flex gap-3 overflow-x-auto pb-2 text-[10px] uppercase tracking-[0.16em]">
        {STEPS.map((label, index) => (
          <li key={label} className={cn('shrink-0', index === step ? 'text-[var(--theme-dark)]' : 'text-[var(--theme-muted)]')}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 min-h-[280px]">
        {step === 0 && (
          <ChoiceGrid
            options={EVENT_TYPES}
            value={draft.event_type}
            onChange={(event_type) => patch({ event_type })}
          />
        )}
        {step === 1 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm">
              Date
              <input
                type="date"
                value={draft.event_date}
                onChange={(event) => patch({ event_date: event.target.value })}
                className="plan-field"
              />
            </label>
            <label className="block text-sm">
              Guest count
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={draft.guest_count}
                onChange={(event) => patch({ guest_count: event.target.value })}
                className="plan-field"
                placeholder="120"
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <ChoiceGrid
              options={['A Prime Lux venue', 'We have a venue', 'Still deciding']}
              value={draft.venue_choice === 'primelux' ? 'A Prime Lux venue' : draft.venue_choice === 'own' ? 'We have a venue' : draft.venue_choice === 'undecided' ? 'Still deciding' : ''}
              onChange={(label) => {
                const venue_choice = label === 'A Prime Lux venue' ? 'primelux' : label === 'We have a venue' ? 'own' : 'undecided'
                patch({ venue_choice, venue_id: '', venue_name: '' })
              }}
            />
            {draft.venue_choice === 'primelux' && (
              <div className="grid gap-3">
                {venues.map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => patch({ venue_id: venue.id, venue_name: venue.name })}
                    className={cn('plan-choice text-left', draft.venue_id === venue.id && 'is-on')}
                  >
                    <span className="font-serif text-2xl">{venue.name}</span>
                    <span className="mt-1 block text-sm font-light text-[var(--theme-muted)]">
                      Up to {venue.capacity} guests · {venue.neighborhood}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {draft.venue_choice === 'own' && (
              <label className="block text-sm">
                Venue name
                <input
                  value={draft.venue_name}
                  onChange={(event) => patch({ venue_name: event.target.value })}
                  className="plan-field"
                  placeholder="The place, and the town"
                />
              </label>
            )}
          </div>
        )}
        {step === 3 && (
          <ChoiceGrid
            multiple
            options={SERVICES}
            value={draft.services}
            onChange={(value) => patch({ services: toggle(draft.services, value) })}
          />
        )}
        {step === 4 && (
          <div>
            <p className="mb-4 text-sm font-light text-[var(--theme-muted)]">Choose any pieces you already know you want. You can skip this.</p>
            <ChoiceGrid
              multiple
              options={RENTALS}
              value={draft.rentals}
              onChange={(value) => patch({ rentals: toggle(draft.rentals, value) })}
            />
          </div>
        )}
        {step === 5 && (
          <ChoiceGrid options={BUDGETS} value={draft.budget_range} onChange={(budget_range) => patch({ budget_range })} />
        )}
        {step === 6 && (
          <div className="grid gap-5">
            <label className="block text-sm">
              Name
              <input value={draft.contact_name} onChange={(event) => patch({ contact_name: event.target.value })} className="plan-field" autoComplete="name" />
            </label>
            <label className="block text-sm">
              Email
              <input type="email" value={draft.contact_email} onChange={(event) => patch({ contact_email: event.target.value })} className="plan-field" autoComplete="email" />
            </label>
            <label className="block text-sm">
              Phone
              <input value={draft.contact_phone} onChange={(event) => patch({ contact_phone: event.target.value })} className="plan-field" autoComplete="tel" />
            </label>
            <label className="block text-sm">
              Notes
              <textarea value={draft.notes} onChange={(event) => patch({ notes: event.target.value })} className="plan-field min-h-28" />
            </label>
            <label className="hidden" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={draft.website} onChange={(event) => patch({ website: event.target.value })} />
            </label>
            <dl className="grid gap-2 border-t border-[var(--theme-dark)]/10 pt-4 text-sm">
              <Row label="Occasion" value={draft.event_type} />
              <Row label="Date" value={draft.event_date} />
              <Row label="Guests" value={draft.guest_count} />
              <Row label="Venue" value={draft.venue_name || draft.venue_choice} />
              <Row label="Services" value={draft.services.join(', ')} />
              <Row label="Rentals" value={draft.rentals.join(', ') || 'Not specified'} />
              <Row label="Budget" value={draft.budget_range} />
            </dl>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-[var(--destructive)]">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button type="button" className="lux-cta-ghost" disabled={step === 0 || pending} onClick={() => setStep((value) => value - 1)}>
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="lux-cta" disabled={!ready} onClick={() => setStep((value) => value + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="lux-cta" disabled={!ready || pending} onClick={() => void finish()}>
            {pending ? 'Sending' : 'Send the plan'}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-[var(--theme-muted)]">{label}</dt>
      <dd className="text-right">{value || '—'}</dd>
    </div>
  )
}

function ChoiceGrid({
  options,
  value,
  onChange,
  multiple,
}: {
  options: string[]
  value: string | string[]
  onChange: (value: string) => void
  multiple?: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const on = multiple ? (value as string[]).includes(option) : value === option
        return (
          <button key={option} type="button" onClick={() => onChange(option)} className={cn('plan-choice', on && 'is-on')}>
            {option}
          </button>
        )
      })}
    </div>
  )
}
