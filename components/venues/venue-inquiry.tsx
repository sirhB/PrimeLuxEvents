'use client'

import { useState } from 'react'
import { submitVenueInquiry } from '@/app/venues/actions'
import type { VenueListing } from '@/lib/venues/directory'

export function VenueInquiry({ venue }: { venue: VenueListing }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError('')
    const guests = Number(formData.get('guest_count') || '')
    const result = await submitVenueInquiry({
      venue_id: venue.id,
      venue_name: venue.name,
      contact_name: String(formData.get('contact_name') || ''),
      contact_email: String(formData.get('contact_email') || ''),
      contact_phone: String(formData.get('contact_phone') || ''),
      event_date: String(formData.get('event_date') || '') || null,
      guest_count: Number.isFinite(guests) && guests > 0 ? guests : null,
      notes: String(formData.get('notes') || '') || null,
      website: String(formData.get('website') || ''),
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error || 'Please try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return <p className="font-serif text-3xl font-medium">The inquiry is with the venue desk.</p>
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <h2 className="font-serif text-3xl font-medium">Ask about the Pavilion</h2>
      <input name="contact_name" required placeholder="Name" className="plan-field" autoComplete="name" />
      <input name="contact_email" type="email" required placeholder="Email" className="plan-field" autoComplete="email" />
      <input name="contact_phone" required placeholder="Phone" className="plan-field" autoComplete="tel" />
      <input name="event_date" type="date" className="plan-field" />
      <input name="guest_count" type="number" min={1} placeholder="Guest count" className="plan-field" />
      <textarea name="notes" placeholder="What should the evening feel like?" className="plan-field min-h-28" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
      <button type="submit" className="lux-cta" disabled={pending}>
        {pending ? 'Sending' : 'Request a tour'}
      </button>
    </form>
  )
}
