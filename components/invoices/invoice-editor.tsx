'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Check, Copy, Download, ExternalLink, Minus, Plus, Trash2 } from 'lucide-react'
import { Presence } from '@/components/motion/presence'
import { Notice, PressButton, StateChip, money, shortDate } from '@/components/admin/carts/parts'
import { saveInvoice, sendInvoice, voidInvoice, type SaveInvoiceLine } from '@/lib/invoices/actions'
import { priceInvoice } from '@/lib/invoices/math'
import { planPayments, type PlanMode } from '@/lib/carts/pricing'
import { allocateFees, applicationFeeForPayment, isBlockedFeeLabel } from '@/lib/carts/split'
import type { InvoiceContext, InvoiceView } from '@/lib/invoices/types'

const EASE = [0.23, 1, 0.32, 1] as const
type CatLine = { key: string; kind: 'catalog'; productId: string | null; keepLineId?: string; name: string; list: number; setup: number; eligible: boolean; quantity: number; markupBps: number | null }
type CusLine = { key: string; kind: 'custom'; name: string; description: string; quantity: number; unitCents: number; taxable: boolean }
type Line = CatLine | CusLine
let seq = 0
const k = () => `n${++seq}`
const cents = (s: string) => Math.max(0, Math.round(Number(s.replace(/[^0-9.]/g, '') || 0) * 100))

export function InvoiceEditor({ invoice, ctx, demo = false }: { invoice: InvoiceView; ctx: InvoiceContext; demo?: boolean }) {
  const router = useRouter()
  const locked = invoice.status !== 'draft' || !ctx.canInvoice
  const [title, setTitle] = useState(invoice.title)
  const [memo, setMemo] = useState(invoice.memo)
  const [due, setDue] = useState(invoice.dueDate ?? '')
  const [delivery, setDelivery] = useState(String(invoice.deliveryFeeCents / 100))
  const [mode, setMode] = useState<PlanMode>(invoice.planMode)
  const [depositPct, setDepositPct] = useState(String((invoice.depositBps ?? 3000) / 100))
  const [count, setCount] = useState(invoice.installments ?? 3)
  const [lines, setLines] = useState<Line[]>(() => invoice.lines.map((l) => l.kind === 'catalog'
    ? { key: l.id, kind: 'catalog', productId: l.productId, keepLineId: l.productId ? undefined : l.id, name: l.name, list: l.listUnitCents, setup: l.setupFeeCents, eligible: l.eligible, quantity: l.quantity, markupBps: l.markupBps }
    : { key: l.id, kind: 'custom', name: l.name, description: l.description, quantity: l.quantity, unitCents: l.unitCents, taxable: l.taxable }))
  const [pick, setPick] = useState(ctx.catalog[0]?.productId ?? '')
  const [flash, setFlash] = useState<string | null>(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [pending, start] = useTransition()

  const pricingCtx = { memberActive: ctx.memberActive, memberDiscountBps: ctx.memberDiscountBps, maxLineDiscountBps: ctx.maxLineDiscountBps, defaultMarkupBps: null }
  const cat = lines.filter((l): l is CatLine => l.kind === 'catalog')
  const cus = lines.filter((l): l is CusLine => l.kind === 'custom')
  const p = useMemo(() => priceInvoice(
    cat.map((l) => ({ listUnitCents: l.list, setupFeeCents: l.setup, quantity: l.quantity, eligible: l.eligible, markupBps: l.markupBps })),
    cus, pricingCtx, { deliveryFeeCents: cents(delivery), taxRate: invoice.taxRate, marketplaceFacilitator: ctx.marketplaceFacilitator },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [lines, delivery, invoice.taxRate, ctx.memberActive])
  const plan = useMemo(() => planPayments({ totalCents: p.totalCents, mode, depositBps: Math.round(Number(depositPct || 0) * 100), installments: count }), [p.totalCents, mode, depositPct, count])
  const planShares = allocateFees(plan.payments.map((x) => x.amountCents), p.primeLuxFeeCents, p.totalCents)
  const planFees = plan.payments.map((x, i) => applicationFeeForPayment(x.amountCents, planShares[i], ctx.platformFee))
  const platformTotal = invoice.status === 'draft' ? planFees.reduce((a, f) => a + f.platformFeeCents, 0) : invoice.payments.reduce((a, x) => a + x.platformFeeCents, 0)
  const blocked = lines.some((l) => l.kind === 'custom' && (isBlockedFeeLabel(l.name) || isBlockedFeeLabel(l.description))) || isBlockedFeeLabel(title) || isBlockedFeeLabel(memo)

  const set = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? ({ ...l, ...patch } as Line) : l)))
  const addCatalog = () => {
    const c = ctx.catalog.find((x) => x.productId === pick); if (!c) return
    setLines((ls) => [...ls, { key: k(), kind: 'catalog', productId: c.productId, name: c.name, list: c.listUnitCents, setup: c.setupFeeCents, eligible: c.eligible, quantity: 1, markupBps: 3000 }])
  }
  const addCustom = () => setLines((ls) => [...ls, { key: k(), kind: 'custom', name: '', description: '', quantity: 1, unitCents: 0, taxable: false }])

  const payload = (): Parameters<typeof saveInvoice>[1] => ({
    title, memo, dueDate: due || null, deliveryFeeCents: cents(delivery), planMode: mode, depositPct: Number(depositPct), installments: count,
    lines: lines.map((l): SaveInvoiceLine => l.kind === 'catalog'
      ? { kind: 'catalog', productId: l.productId, keepLineId: l.keepLineId, quantity: l.quantity, markupBps: l.markupBps }
      : { kind: 'custom', name: l.name, description: l.description, quantity: l.quantity, unitCents: l.unitCents, taxable: l.taxable }),
  })
  const save = () => {
    if (demo) { setFlash('Preview: draft saved'); return }
    start(async () => { const r = await saveInvoice(invoice.id, payload()); setFlash(r.ok ? 'Draft saved' : r.error); if (r.ok) router.refresh() })
  }
  const send = () => {
    setConfirmSend(false)
    if (demo) { setFlash(`Preview: Stripe would email ${plan.payments.length} invoice${plan.payments.length === 1 ? '' : 's'} to ${invoice.client.email}`); return }
    start(async () => {
      const s1 = await saveInvoice(invoice.id, payload()); if (!s1.ok) { setFlash(s1.error); return }
      const r = await sendInvoice(invoice.id); setFlash(r.ok ? `Sent. Stripe emailed ${invoice.client.email}.` : r.error); router.refresh()
    })
  }
  const voidIt = () => {
    if (demo) { setFlash('Preview: invoice would be voided'); return }
    if (!window.confirm('Void every unpaid payment on this invoice?')) return
    start(async () => { const r = await voidInvoice(invoice.id); setFlash(r.ok ? 'Voided' : r.error); router.refresh() })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5 pb-28 md:pb-0">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">Invoice for</p>
            <p className="truncate font-serif text-2xl">{invoice.client.name}</p>
            <p className="truncate text-xs text-[var(--dashboard-text-muted)]">{invoice.client.email}</p>
          </div>
          <StateChip state={invoice.display} />
        </header>

        {!ctx.canInvoice && invoice.status === 'draft' && <Notice>Invoicing is included with an active planner membership. <Link className="underline" href="/planners/membership">Renew</Link> to edit or send.</Notice>}
        {ctx.canInvoice && !ctx.connectReady && invoice.status === 'draft' && <Notice>Connect payouts before sending. <Link className="underline" href="/planners/membership#payouts">Connect payouts</Link></Notice>}

        <section className="grid gap-3 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Title
            <input className="plan-field" value={title} disabled={locked} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">{plan.payments.length > 1 ? 'First payment due' : 'Due date'}
            <input type="date" className="plan-field tabular-nums" value={due} disabled={locked} onChange={(e) => setDue(e.target.value)} />
          </label>
        </section>

        <section aria-labelledby="lines-h" className="flex flex-col gap-3">
          <h2 id="lines-h" className="font-serif text-2xl">Line items</h2>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li key={l.key} layout="position" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18, ease: EASE }}
                  className="border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-3">
                  {l.kind === 'catalog' ? <CatalogRow l={l} locked={locked} memberActive={ctx.memberActive} discountBps={ctx.memberDiscountBps} onChange={(x) => set(l.key, x)} onRemove={() => setLines((ls) => ls.filter((y) => y.key !== l.key))} />
                    : <CustomRow l={l} locked={locked} onChange={(x) => set(l.key, x)} onRemove={() => setLines((ls) => ls.filter((y) => y.key !== l.key))} />}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {!locked && (
            <div className="grid gap-2 border border-dashed border-[var(--dashboard-border)] p-3">
              <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Prime Lux rental
                <select className="plan-field" value={pick} onChange={(e) => setPick(e.target.value)}>
                  {ctx.catalog.map((c) => <option key={c.productId} value={c.productId}>{c.name} · {money(c.listUnitCents)}{c.eligible && ctx.memberActive ? ' · member 50%' : ''}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={addCatalog} className="hub-chip min-h-11"><Plus className="mr-1 inline size-4" />Rental</button>
                <button type="button" onClick={addCustom} className="hub-chip min-h-11"><Plus className="mr-1 inline size-4" />Your service</button>
              </div>
              <p className="text-[11px] text-[var(--dashboard-text-muted)]">Your services (planning, coordination, other vendors) are yours in full; Prime Lux takes no fee on them.</p>
            </div>
          )}
        </section>

        <section className="grid gap-3 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
          {cat.length > 0 && (
            <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Prime Lux delivery ($)
              <input className="plan-field tabular-nums" inputMode="decimal" value={delivery} disabled={locked} onChange={(e) => setDelivery(e.target.value.replace(/[^0-9.]/g, ''))} />
            </label>
          )}
          <div role="radiogroup" aria-label="Payment schedule" className="grid grid-cols-3 gap-2">
            {(['full', 'deposit', 'installments'] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} disabled={locked} onClick={() => setMode(m)}
                className={`plan-choice !p-3 text-left text-sm capitalize transition-[border-color,background-color] duration-150 ${mode === m ? '!border-[var(--theme-dark)] bg-[var(--dashboard-surface)]' : ''}`}>{m === 'full' ? 'In full' : m}</button>
            ))}
          </div>
          {mode === 'deposit' && <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Deposit (%)<input className="plan-field tabular-nums" inputMode="decimal" value={depositPct} disabled={locked} onChange={(e) => setDepositPct(e.target.value.replace(/[^0-9.]/g, ''))} /></label>}
          {mode === 'installments' && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--dashboard-text-muted)]">Payments, 30 days apart</span>
              <Stepper value={count} min={2} max={12} disabled={locked} onChange={setCount} />
            </div>
          )}
          <ol className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] text-sm">
            {(invoice.status === 'draft' ? plan.payments.map((x, i) => ({ id: String(i), label: x.label, amountCents: x.amountCents, fee: planFees[i].applicationFeeCents, status: null as null | string, hostedUrl: null as string | null, pdfUrl: null as string | null, dueDate: null as string | null, number: null as string | null }))
              : invoice.payments.map((x) => ({ id: x.id, label: x.label, amountCents: x.amountCents, fee: x.applicationFeeCents, status: x.status as string, hostedUrl: x.hostedUrl, pdfUrl: x.pdfUrl, dueDate: x.dueDate, number: x.number }))).map((x) => (
              <li key={x.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 py-3">
                <span className="min-w-0 truncate">{x.label}{x.number ? <span className="ml-2 text-xs text-[var(--dashboard-text-muted)]">{x.number}</span> : null}</span>
                <span className="tabular-nums">{money(x.amountCents)}</span>
                <span className="text-xs text-[var(--dashboard-text-muted)]">{x.dueDate ? `Due ${shortDate(x.dueDate)} · ` : ''}Prime Lux fee {money(x.fee)}</span>
                <span className="flex items-center justify-end gap-1">
                  {x.status && <StateChip state={x.status} />}
                  {x.pdfUrl && <a href={x.pdfUrl} aria-label="Download PDF" className="hub-chip inline-flex w-11 items-center justify-center px-0"><Download className="size-4" /></a>}
                  {x.hostedUrl && <a href={x.hostedUrl} target="_blank" rel="noreferrer" aria-label="Open Stripe invoice" className="hub-chip inline-flex w-11 items-center justify-center px-0"><ExternalLink className="size-4" /></a>}
                </span>
              </li>
            ))}
          </ol>
          <Presence show={plan.warnings.length > 0 && invoice.status === 'draft'} id={plan.warnings.join()}>
            <p className="border-l-2 border-[var(--dashboard-accent-orange)] pl-3 text-xs text-[var(--dashboard-text-muted)]">{plan.warnings.join(' ')}</p>
          </Presence>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Note on the invoice
            <textarea rows={3} className="plan-field resize-none" value={memo} disabled={locked} onChange={(e) => setMemo(e.target.value)} />
          </label>
        </section>

        {invoice.payUrl && <PayLink url={invoice.payUrl} />}

        {blocked && <Notice>Card, processing, transaction, or convenience fees can’t be added to invoices. Prices must be the same however the client pays.</Notice>}

        <dl className="grid gap-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 text-sm">
          {p.catalogSubtotalCents + p.catalogSetupCents > 0 && <Row k="Prime Lux rentals + setup" v={money(p.catalogSubtotalCents + p.catalogSetupCents)} />}
          {p.customSubtotalCents > 0 && <Row k="Your services" v={money(p.customSubtotalCents)} />}
          {p.deliveryFeeCents > 0 && <Row k="Delivery" v={money(p.deliveryFeeCents)} />}
          <Row k="Tax" v={money(p.taxCents)} />
          <div className="flex items-baseline justify-between border-t border-[var(--dashboard-border)] pt-2"><dt>Client pays</dt><dd className="font-serif text-2xl tabular-nums">{money(p.totalCents)}</dd></div>
          <Row k="Prime Lux rental share" v={`−${money(p.primeLuxFeeCents)}`} muted />
          {platformTotal > 0 && <Row k="Prime Lux platform fee" v={`−${money(platformTotal)}`} muted />}
          <Row k="You keep, before Stripe fees" v={money(p.plannerGrossCents - platformTotal)} strong />
          <p className="text-[11px] text-[var(--dashboard-text-muted)]">Prime Lux’s share comes out of your proceeds. Your client pays the same total however they pay.</p>
        </dl>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
          <Presence show={Boolean(flash)} id={flash ?? ''}><p role="status" className="mb-2 text-center text-xs">{flash}</p></Presence>
          {invoice.status === 'draft' ? (
            confirmSend ? (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="hub-chip min-h-12" onClick={() => setConfirmSend(false)}>Cancel</button>
                <PressButton disabled={pending} onClick={send}>Email {invoice.client.name.split(' ')[0]}</PressButton>
              </div>
            ) : (
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <button type="button" className="hub-chip min-h-12 px-5" disabled={locked || pending || blocked} onClick={save}>Save</button>
                <PressButton disabled={locked || pending || blocked || !ctx.connectReady || p.totalCents <= 0} onClick={() => setConfirmSend(true)}>Send {money(p.totalCents)} invoice</PressButton>
              </div>
            )
          ) : (invoice.status === 'open' || invoice.status === 'uncollectible') && (
            <button type="button" className="hub-chip min-h-12 w-full text-[var(--dashboard-accent-red)]" disabled={pending} onClick={voidIt}>Void unpaid payments</button>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}

function Row({ k: key, v, muted, strong }: { k: string; v: string; muted?: boolean; strong?: boolean }) {
  return <div className="flex justify-between gap-3"><dt className={muted || !strong ? 'text-[var(--dashboard-text-muted)]' : ''}>{key}</dt><dd className={`tabular-nums ${strong ? 'font-medium' : ''}`}>{v}</dd></div>
}

function Stepper({ value, min, max, disabled, onChange }: { value: number; min: number; max: number; disabled?: boolean; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center border border-[var(--dashboard-border)]">
      <button type="button" aria-label="Fewer" disabled={disabled} className="grid size-11 place-items-center active:scale-[0.97]" onClick={() => onChange(Math.max(min, value - 1))}><Minus className="size-4" /></button>
      <span className="w-10 text-center tabular-nums">{value}</span>
      <button type="button" aria-label="More" disabled={disabled} className="grid size-11 place-items-center active:scale-[0.97]" onClick={() => onChange(Math.min(max, value + 1))}><Plus className="size-4" /></button>
    </div>
  )
}

function CatalogRow({ l, locked, memberActive, discountBps, onChange, onRemove }: { l: CatLine; locked: boolean; memberActive: boolean; discountBps: number; onChange: (p: Partial<CatLine>) => void; onRemove: () => void }) {
  const cost = l.eligible && memberActive ? Math.round(l.list * (1 - discountBps / 10000)) : l.list
  const client = Math.round(cost * (1 + (l.markupBps ?? 0) / 10000))
  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{l.name}</p>
          <p className="text-[11px] text-[var(--dashboard-text-muted)]">Prime Lux rental · your cost {money(cost)}{l.eligible && memberActive ? ' (member)' : ''}</p>
        </div>
        {!locked && <button type="button" aria-label={`Remove ${l.name}`} onClick={onRemove} className="grid size-11 shrink-0 place-items-center text-[var(--dashboard-text-muted)] active:scale-[0.97]"><Trash2 className="size-4" /></button>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <label className="text-[11px] text-[var(--dashboard-text-muted)]">Markup %
          <input className="plan-field w-24 tabular-nums" inputMode="decimal" disabled={locked} value={String((l.markupBps ?? 0) / 100)} onChange={(e) => onChange({ markupBps: Math.round(Number(e.target.value.replace(/[^0-9.]/g, '') || 0) * 100) })} />
        </label>
        <Stepper value={l.quantity} min={1} max={100000} disabled={locked} onChange={(quantity) => onChange({ quantity })} />
        <p className="min-w-[5.5rem] text-right text-sm tabular-nums">{money(client * l.quantity)}</p>
      </div>
    </div>
  )
}

function CustomRow({ l, locked, onChange, onRemove }: { l: CusLine; locked: boolean; onChange: (p: Partial<CusLine>) => void; onRemove: () => void }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-start gap-2">
        <input aria-label="Service" placeholder="Planning fee, coordination, florist…" className="plan-field !mt-0 flex-1" disabled={locked} value={l.name} onChange={(e) => onChange({ name: e.target.value })} />
        {!locked && <button type="button" aria-label="Remove line" onClick={onRemove} className="grid size-11 shrink-0 place-items-center text-[var(--dashboard-text-muted)] active:scale-[0.97]"><Trash2 className="size-4" /></button>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <label className="text-[11px] text-[var(--dashboard-text-muted)]">Price ($)
          <input className="plan-field w-28 tabular-nums" inputMode="decimal" disabled={locked} defaultValue={l.unitCents ? String(l.unitCents / 100) : ''} onChange={(e) => onChange({ unitCents: cents(e.target.value) })} />
        </label>
        <Stepper value={l.quantity} min={1} max={100000} disabled={locked} onChange={(quantity) => onChange({ quantity })} />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-xs text-[var(--dashboard-text-muted)]">
        <input type="checkbox" className="size-5 accent-[var(--theme-dark)]" disabled={locked} checked={l.taxable} onChange={(e) => onChange({ taxable: e.target.checked })} /> Taxable
        <span className="ml-auto text-[10px] uppercase tracking-[0.1em]">Your service · no Prime Lux fee</span>
      </label>
    </div>
  )
}

function PayLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <div className="min-w-0"><p className="text-sm">Client pay page</p><p className="truncate text-xs text-[var(--dashboard-text-muted)]">{url}</p></div>
      <button type="button" aria-label="Copy pay link" className="hub-chip inline-flex w-11 shrink-0 items-center justify-center px-0" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}
