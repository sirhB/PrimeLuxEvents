'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, type Transition } from 'framer-motion'
import { submitPlanLead } from '@/app/plan/lead-actions'
import { EMPTY_PLAN_DRAFT, PLAN_BUDGETS, PLAN_EVENT_TYPES, PLAN_GUEST_PRESETS, type PlanLeadDraft } from '@/lib/leads/plan-options'
import type { VenueListing } from '@/lib/venues/directory'
import { VENUE_LISTINGS } from '@/lib/venues/directory'
import { cn } from '@/lib/utils'

/**
 * Plan your event — six short steps. Emil-weighted motion: a step slides 12px in
 * with a quick ease-out and leaves with half the distance and less time, so
 * moving forward feels responsive rather than theatrical. Transform/opacity only.
 */
const EASE: Transition['ease'] = [0.23, 1, 0.32, 1]
const ENTER: Transition = { duration: 0.24, ease: EASE }
const EXIT: Transition = { duration: 0.14, ease: [0.4, 0, 1, 1] }

export const PLAN_STEPS = ['Occasion', 'Date', 'Guests', 'Location', 'Budget', 'Contact'] as const

export type PlanOnboardingProps = {
  venues?: VenueListing[]
  initial?: Partial<PlanLeadDraft> | null
  prefill?: { contact_name: string; contact_email: string; contact_phone: string } | null
  editing?: boolean
  intent?: 'cart' | 'plan'
  initialStep?: number
  onDone: (leadId: string) => void
  onSkip?: () => void
}

export function PlanOnboarding({ venues = VENUE_LISTINGS, initial, prefill, editing, intent = 'plan', initialStep = 0, onDone, onSkip }: PlanOnboardingProps) {
  const [step, setStep] = useState(initialStep)
  const [dir, setDir] = useState(1)
  const [draft, setDraft] = useState<PlanLeadDraft>(() => ({ ...EMPTY_PLAN_DRAFT, ...(prefill || {}), ...(initial || {}) }))
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const knownAccount = Boolean(prefill?.contact_email)
  const patch = (p: Partial<PlanLeadDraft>) => setDraft((d) => ({ ...d, ...p }))
  const guests = Number(draft.guest_count)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact_email.trim())
  const phoneOk = /^[0-9+()\-.\s]{7,40}$/.test(draft.contact_phone.trim()) && draft.contact_phone.replace(/\D/g, '').length >= 7

  const ready = useMemo(() => {
    switch (step) {
      case 0: return Boolean(draft.event_type)
      case 1: return draft.date_unsure || /^\d{4}-\d{2}-\d{2}$/.test(draft.event_date)
      case 2: return Number.isInteger(guests) && guests > 0 && guests <= 5000
      case 3: return draft.location_choice === 'primelux' ? Boolean(draft.venue_id) : Boolean(draft.location_choice)
      case 4: return true
      default: return draft.contact_name.trim().length > 1 && emailOk && phoneOk && draft.consent
    }
  }, [step, draft, guests, emailOk, phoneOk])

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [step])

  function go(next: number) {
    setError('')
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  async function submit() {
    setPending(true)
    setError('')
    const result = await submitPlanLead({
      event_type: draft.event_type,
      event_date: draft.date_unsure ? null : draft.event_date,
      guest_count: guests,
      location_choice: draft.location_choice,
      venue_id: draft.location_choice === 'primelux' ? draft.venue_id : null,
      location_detail: draft.location_detail.trim() || null,
      budget_range: draft.budget_range || null,
      contact_name: draft.contact_name,
      contact_email: draft.contact_email,
      contact_phone: draft.contact_phone,
      consent: draft.consent,
      website: draft.website,
    })
    setPending(false)
    if (!result.ok || !result.leadId) {
      setError(result.error || 'Please try again.')
      return
    }
    onDone(result.leadId)
  }

  const last = step === PLAN_STEPS.length - 1
  const today = new Date().toISOString().slice(0, 10)

  return (
    <MotionConfig reducedMotion="user">
      <div className="plan-ob" data-step={step}>
        <div className="plan-ob-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(step + 1) / PLAN_STEPS.length})` }} />
        </div>
        <p className="plan-ob-count">
          {String(step + 1).padStart(2, '0')} / {String(PLAN_STEPS.length).padStart(2, '0')} · {PLAN_STEPS[step]}
        </p>

        <div className="plan-ob-stage">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: 12 * dir }}
              animate={{ opacity: 1, x: 0, transition: ENTER }}
              exit={{ opacity: 0, x: -6 * dir, transition: EXIT }}
            >
              {step === 0 && (
                <Step title={editing ? 'Your event, as we have it.' : 'What are we celebrating?'} headingRef={headingRef}
                  note={intent === 'cart' ? 'A few details before your first piece, so a planner can hold it for the right date.' : undefined}>
                  <Choices options={PLAN_EVENT_TYPES} value={draft.event_type} onChange={(event_type) => { patch({ event_type }); }} />
                </Step>
              )}
              {step === 1 && (
                <Step title="When is it?" headingRef={headingRef}>
                  <label className="plan-ob-label">
                    Event date
                    <input type="date" min={today} className="plan-field" value={draft.event_date} disabled={draft.date_unsure}
                      onChange={(e) => patch({ event_date: e.target.value })} />
                  </label>
                  <label className="plan-ob-check">
                    <input type="checkbox" checked={draft.date_unsure} onChange={(e) => patch({ date_unsure: e.target.checked })} />
                    Not sure yet
                  </label>
                </Step>
              )}
              {step === 2 && (
                <Step title="How many guests?" headingRef={headingRef}>
                  <div className="plan-ob-chips">
                    {PLAN_GUEST_PRESETS.map((n) => (
                      <button key={n} type="button" aria-pressed={guests === n} className={cn('plan-ob-chip', guests === n && 'is-on')} onClick={() => patch({ guest_count: String(n) })}>
                        {n === 200 ? '200+' : `~${n}`}
                      </button>
                    ))}
                  </div>
                  <label className="plan-ob-label">
                    Or an exact count
                    <input type="number" inputMode="numeric" min={1} max={5000} className="plan-field" value={draft.guest_count}
                      onChange={(e) => patch({ guest_count: e.target.value })} />
                  </label>
                </Step>
              )}
              {step === 3 && (
                <Step title="Where will it be?" headingRef={headingRef}>
                  <div className="plan-ob-list">
                    {venues.map((v) => {
                      const on = draft.location_choice === 'primelux' && draft.venue_id === v.id
                      return (
                        <button key={v.id} type="button" aria-pressed={on} className={cn('plan-ob-option', on && 'is-on')}
                          onClick={() => patch({ location_choice: 'primelux', venue_id: v.id })}>
                          <span>{v.name}</span><small>Up to {v.capacity}</small>
                        </button>
                      )
                    })}
                    <button type="button" aria-pressed={draft.location_choice === 'own'} className={cn('plan-ob-option', draft.location_choice === 'own' && 'is-on')}
                      onClick={() => patch({ location_choice: 'own', venue_id: '' })}>
                      <span>My own venue or home</span><small>We deliver</small>
                    </button>
                    <button type="button" aria-pressed={draft.location_choice === 'tbd'} className={cn('plan-ob-option', draft.location_choice === 'tbd' && 'is-on')}
                      onClick={() => patch({ location_choice: 'tbd', venue_id: '' })}>
                      <span>Still deciding</span><small>TBD</small>
                    </button>
                  </div>
                  {draft.location_choice === 'own' && (
                    <label className="plan-ob-label">
                      Town or venue name
                      <input className="plan-field" maxLength={200} value={draft.location_detail} onChange={(e) => patch({ location_detail: e.target.value })} />
                    </label>
                  )}
                </Step>
              )}
              {step === 4 && (
                <Step title="A budget in mind?" note="Optional. It helps us suggest the right pieces." headingRef={headingRef}>
                  <Choices options={PLAN_BUDGETS} value={draft.budget_range} onChange={(budget_range) => patch({ budget_range: draft.budget_range === budget_range ? '' : budget_range })} />
                </Step>
              )}
              {step === 5 && (
                <Step title={knownAccount ? 'Is this still the best way to reach you?' : 'Where should we reach you?'} headingRef={headingRef}>
                  <label className="plan-ob-label">Name<input className="plan-field" autoComplete="name" maxLength={160} value={draft.contact_name} onChange={(e) => patch({ contact_name: e.target.value })} /></label>
                  <label className="plan-ob-label">Email<input type="email" className="plan-field" autoComplete="email" maxLength={200} value={draft.contact_email} aria-invalid={draft.contact_email !== '' && !emailOk} onChange={(e) => patch({ contact_email: e.target.value })} /></label>
                  <label className="plan-ob-label">Phone<input type="tel" className="plan-field" autoComplete="tel" maxLength={40} value={draft.contact_phone} aria-invalid={draft.contact_phone !== '' && !phoneOk} onChange={(e) => patch({ contact_phone: e.target.value })} /></label>
                  <label className="plan-ob-check">
                    <input type="checkbox" checked={draft.consent} onChange={(e) => patch({ consent: e.target.checked })} />
                    Prime Lux may contact me about this event by phone, text, or email.
                  </label>
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="plan-ob-hp" value={draft.website} onChange={(e) => patch({ website: e.target.value })} />
                </Step>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {error && <p role="alert" className="plan-ob-error">{error}</p>}

        <div className="plan-ob-actions">
          {step > 0 ? (
            <button type="button" className="plan-ob-back" onClick={() => go(step - 1)}>Back</button>
          ) : onSkip ? (
            <button type="button" className="plan-ob-back" onClick={onSkip}>Not now</button>
          ) : <span />}
          <button type="button" className="lux-cta plan-ob-next" disabled={!ready || pending}
            onClick={() => (last ? submit() : go(step + 1))}>
            {last ? (pending ? 'Saving' : editing ? 'Save details' : intent === 'cart' ? 'Continue to cart' : 'Start planning') : step === 4 && !draft.budget_range ? 'Skip' : 'Next'}
          </button>
        </div>
      </div>
    </MotionConfig>
  )
}

function Step({ title, note, headingRef, children }: { title: string; note?: string; headingRef: React.RefObject<HTMLHeadingElement | null>; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="plan-ob-title">{title}</h2>
        {note && <p className="plan-ob-note">{note}</p>}
      </div>
      {children}
    </div>
  )
}

function Choices({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="plan-ob-list">
      {options.map((option) => (
        <button key={option} type="button" aria-pressed={value === option} className={cn('plan-ob-option', value === option && 'is-on')} onClick={() => onChange(option)}>
          <span>{option}</span>
        </button>
      ))}
    </div>
  )
}
