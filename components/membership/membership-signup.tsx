'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, MotionConfig } from 'framer-motion'
import { Check } from 'lucide-react'
import { openBillingPortal, startMembershipCheckout } from '@/lib/membership/actions'
import { openPayoutsDashboard, refreshConnectStatus, startConnectOnboarding } from '@/lib/connect/actions'
import { MEMBERSHIP_POLICIES, type MembershipStatus } from '@/lib/membership/policy'

export type ConnectState = { started: boolean; chargesEnabled: boolean; payoutsEnabled: boolean }
export type SignupState = { signedIn: boolean; status: MembershipStatus; banned: boolean; periodEnd: string | null; joined?: boolean; connect?: ConnectState; connectReturn?: boolean; balanceDueCents?: number; balanceDueUrl?: string | null; platformFee?: string }

const EASE = [0.23, 1, 0.32, 1] as const
const PERKS = [
  '50% off eligible rentals: that’s your cost',
  'Set your own client prices and keep your markup',
  'Build carts for each client’s event from the full catalog',
  'Clients approve quotes and pay you online; Prime Lux’s share is split out automatically',
]

export function MembershipSignup({ state, demo = false }: { state: SignupState; demo?: boolean }) {
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const blocked = state.banned || state.status === 'terminated'
  const member = state.status === 'active' || state.status === 'past_due'

  const join = () => {
    if (demo) { setError('Preview: this opens Stripe Checkout'); return }
    start(async () => {
      const r = await startMembershipCheckout(agreed)
      if (r.ok) window.location.assign(r.url); else setError(r.error)
    })
  }
  const portal = () => {
    if (demo) return
    start(async () => {
      const r = await openBillingPortal()
      if (r.ok) window.location.assign(r.url); else setError(r.error)
    })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] text-[var(--dashboard-text)]">
        <section className="bg-[var(--theme-dark)] px-5 pb-10 pt-12 text-white md:px-10 md:pb-16 md:pt-20">
          <div className="mx-auto max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}
              className="text-[11px] uppercase tracking-[0.22em] text-[var(--theme-accent,#d4b26a)]">Prime Lux · For event planners</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
              className="mt-3 font-serif text-[2.75rem] leading-[1.02] tracking-[-0.02em] md:text-7xl">Planner<br />Membership</motion.h1>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE, delay: 0.08 }}
              className="mt-8 flex items-end gap-4">
              <p className="font-serif text-6xl leading-none tabular-nums text-[var(--theme-accent,#d4b26a)] md:text-7xl">$99</p>
              <p className="pb-1 text-sm leading-snug text-white/70">per month<br /><span className="text-white">50% off eligible rentals</span></p>
            </motion.div>
            <ul className="mt-8 grid gap-3">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/85"><Check className="mt-0.5 size-4 shrink-0 text-[var(--theme-accent,#d4b26a)]" />{p}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-5 py-10 md:px-10">
          <div className="mx-auto grid max-w-3xl gap-8">
            {state.joined && member && <p role="status" className="border-l-2 border-[var(--dashboard-accent-green)] pl-3 text-sm">Welcome in. Your member pricing is live.</p>}

            <div>
              <h2 className="font-serif text-3xl">Membership policies</h2>
              <ol className="mt-4 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
                {[...MEMBERSHIP_POLICIES, { title: 'Prime Lux platform/service fee', body: `Prime Lux charges a platform/service fee for the tools and payment platform on every payment you collect through Prime Lux, including invoices for your own services: ${state.platformFee ?? 'currently 0%'}. It’s deducted from your proceeds along with Prime Lux’s rental share, shown on every payment, and refunded in proportion with any refund. It’s never added to your client’s total, and your client pays the same price however they pay. Don’t add card, processing, transaction, or convenience fees to client invoices or carts.` }].map((p, i) => (
                  <li key={p.title} className="grid grid-cols-[2rem_1fr] gap-2 py-4">
                    <span className="font-serif text-lg tabular-nums text-[var(--dashboard-accent-gold)]">{i + 1}</span>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--dashboard-text-muted)]">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-5">
              {state.status === 'balance_due' ? (
                <div role="status" className="flex flex-col gap-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--dashboard-accent-red)]">Balance due</p>
                  <p className="font-serif text-4xl tabular-nums">{`$${((state.balanceDueCents ?? 0) / 100).toFixed(2)}`}</p>
                  <p className="text-sm leading-relaxed text-[var(--dashboard-text-muted)]">You canceled while a membership payment was past due. That balance is still owed and Stripe keeps trying your card on file. Member pricing, client carts, and invoicing are off. Once it’s settled, or collection ends unpaid, the membership is closed permanently.</p>
                  {state.balanceDueUrl && (
                    <a href={state.balanceDueUrl} className="inline-flex min-h-12 items-center justify-center bg-[var(--theme-dark)] text-sm font-medium text-white transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]">Pay balance</a>
                  )}
                </div>
              ) : blocked ? (
                <p className="text-sm">This account can’t join the planner membership. Questions? <Link className="underline" href="/contact">Contact us</Link>.</p>
              ) : member ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm">{state.status === 'past_due' ? 'Your last payment failed. Update your card to keep your membership. If it stays unpaid, the membership is terminated permanently.' : `You’re a member${state.periodEnd ? `. Renews ${new Date(state.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.`}</p>
                  <ConnectPayouts c={state.connect ?? { started: false, chargesEnabled: false, payoutsEnabled: false }} demo={demo} returned={Boolean(state.connectReturn)} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link href="/account/planner/carts" className="inline-flex min-h-12 items-center justify-center bg-[var(--theme-dark)] text-sm font-medium text-white transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]">Open client carts</Link>
                    <button type="button" onClick={portal} disabled={pending} className="hub-chip min-h-12">Manage billing</button>
                  </div>
                </div>
              ) : !state.signedIn ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm">Sign in with your planner account to join.</p>
                  <Link href="/login?next=/planners/membership" className="inline-flex min-h-12 items-center justify-center bg-[var(--theme-dark)] text-sm font-medium text-white active:scale-[0.97]">Sign in to join</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <label className="flex items-start gap-3 text-sm leading-relaxed">
                    <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--theme-dark)]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    I’ve read and agree to the membership policies, including that fees are nonrefundable and nonpayment means permanent termination.
                  </label>
                  <button type="button" onClick={join} disabled={!agreed || pending}
                    className="inline-flex min-h-12 items-center justify-center bg-[var(--theme-dark)] text-sm font-medium text-white transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-40">
                    Join for $99/month
                  </button>
                  <p className="text-[11px] text-[var(--dashboard-text-muted)]">Secure checkout by Stripe. Billed monthly until you cancel.</p>
                </div>
              )}
              {error && <p role="alert" className="mt-3 text-xs text-[var(--dashboard-accent-red)]">{error}</p>}
            </div>
          </div>
        </section>
      </div>
    </MotionConfig>
  )
}

/** "Connect payouts": Stripe Express onboarding. Client payment links stay blocked until charges are enabled. */
function ConnectPayouts({ c, demo, returned }: { c: ConnectState; demo: boolean; returned: boolean }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const ready = c.chargesEnabled
  const go = (fn: () => Promise<{ ok: true; url: string } | { ok: false; error: string }>) => {
    if (demo) { setErr('Preview: this opens Stripe'); return }
    start(async () => { const r = await fn(); if (r.ok) window.location.assign(r.url); else setErr(r.error) })
  }
  const step = (done: boolean, label: string) => (
    <li className="flex items-center gap-2 text-sm">
      <span aria-hidden className={`grid size-5 place-items-center rounded-full border ${done ? 'border-[var(--dashboard-accent-green)] bg-[var(--dashboard-accent-green)] text-white' : 'border-[var(--dashboard-border)]'}`}>{done && <Check className="size-3" />}</span>
      <span className={done ? '' : 'text-[var(--dashboard-text-muted)]'}>{label}</span>
    </li>
  )
  return (
    <div id="payouts" className="scroll-mt-6 border-y border-[var(--dashboard-border)] py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl">Connect payouts</h3>
        <span className={`text-[11px] uppercase tracking-[0.1em] ${ready ? 'text-[var(--dashboard-accent-green)]' : 'text-[var(--dashboard-accent-orange)]'}`}>{ready ? 'Ready' : c.started ? 'In progress' : 'Required'}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--dashboard-text-muted)]">Clients pay you directly through Stripe. Prime Lux’s share (your rental cost, delivery, setup, and tax on rentals) is taken from each payment automatically; the rest pays out to your bank.</p>
      <ol className="mt-3 grid gap-2">
        {step(c.started, 'Stripe account created')}
        {step(c.chargesEnabled, 'Can accept client payments')}
        {step(c.payoutsEnabled, 'Payouts to your bank')}
      </ol>
      {returned && !ready && <p role="status" className="mt-3 text-xs">Thanks. Stripe may take a minute to verify. <button type="button" className="underline" onClick={() => start(async () => { await refreshConnectStatus() })}>Check again</button></p>}
      <div className="mt-3">
        {ready ? (
          <button type="button" disabled={pending} onClick={() => go(openPayoutsDashboard)} className="hub-chip min-h-12 w-full">Open Stripe payouts dashboard</button>
        ) : (
          <button type="button" disabled={pending} onClick={() => go(startConnectOnboarding)}
            className="inline-flex min-h-12 w-full items-center justify-center bg-[var(--dashboard-accent-gold)] text-sm font-medium text-[var(--theme-dark)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-40">
            {c.started ? 'Finish setup with Stripe' : 'Connect payouts with Stripe'}
          </button>
        )}
      </div>
      {err && <p role="alert" className="mt-2 text-xs text-[var(--dashboard-accent-red)]">{err}</p>}
    </div>
  )
}
