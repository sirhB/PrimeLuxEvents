'use client'

import { ConvertCartToInvoice } from '@/components/invoices/convert-cart'
import { useMemo, useState, useTransition } from 'react'
import { Minus, Plus, Search, StickyNote, Trash2, X } from 'lucide-react'
import { Presence } from '@/components/motion/presence'
import { quoteDeliveryFee, savePlannerCart, sharePlannerCart } from '@/lib/carts/actions'
import { markupPct, priceCart, type PricedLine } from '@/lib/carts/pricing'
import type { CartLineView, CartView, CatalogPick, PlannerCartContext } from '@/lib/carts/types'
import { Notice, PressButton, StateChip, money, pct, shortDate } from './parts'
import { PaymentStep } from './payment-step'

const STEPS = ['Build', 'Shared', 'Approved', 'Paid'] as const
const stepIndex = (s: CartView['status']) => (s === 'draft' ? 0 : s === 'shared' ? 1 : s === 'approved' ? 2 : 3)
const toBps = (v: string) => (v.trim() === '' ? null : Math.round(Number(v.replace(/[^0-9.]/g, '') || 0) * 100))
const toCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, '') || 0) * 100)

export function PlannerCart({ cart, ctx, demo = false }: { cart: CartView; ctx: PlannerCartContext; demo?: boolean }) {
  const [lines, setLines] = useState<CartLineView[]>(cart.lines)
  const [title, setTitle] = useState(cart.title)
  const [note, setNote] = useState(cart.noteToClient)
  const [markup, setMarkup] = useState(cart.defaultMarkupBps == null ? '' : String(cart.defaultMarkupBps / 100))
  const [delivery, setDelivery] = useState(String(cart.deliveryFeeCents / 100))
  const [address, setAddress] = useState('')
  const [picker, setPicker] = useState(false)
  const [status, setStatus] = useState(cart.status)
  const [dirty, setDirty] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const locked = !(status === 'draft' || status === 'shared')

  const pricing = useMemo(() => priceCart(
    lines.map((l) => ({ listUnitCents: l.listUnitCents, setupFeeCents: l.setupFeeCents, quantity: l.quantity, eligible: l.eligible, clientUnitCents: l.clientUnitCents, markupBps: l.markupBps, discountBps: l.discountBps })),
    { memberActive: ctx.memberActive, memberDiscountBps: ctx.limits.memberDiscountBps, maxLineDiscountBps: ctx.limits.maxLineDiscountBps, defaultMarkupBps: toBps(markup) },
    { deliveryFeeCents: toCents(delivery), taxRate: cart.taxRate },
  ), [lines, ctx, markup, delivery, cart.taxRate])

  const edit = (id: string, patch: Partial<CartLineView>) => { setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l))); setDirty(true) }
  const add = (p: CatalogPick) => {
    setLines((ls) => {
      const hit = p.itemType !== 'venue' && ls.find((l) => l.refId === p.refId)
      if (hit) return ls.map((l) => (l === hit ? { ...l, quantity: l.quantity + 1 } : l))
      return [...ls, { id: `new-${p.refId}-${Date.now()}`, itemType: p.itemType, refId: p.refId, name: p.name, imageUrl: p.imageUrl, listUnitCents: p.priceCents, eligible: p.eligible, clientUnitCents: null, markupBps: null, setupFeeCents: p.setupFeeCents, quantity: 1, discountBps: 0, note: '' }]
    })
    setDirty(true)
    setFlash(`Added ${p.name}`)
  }

  const save = (then?: () => Promise<void>) => {
    if (demo) { setDirty(false); setFlash('Preview: saved locally'); return }
    start(async () => {
      const r = await savePlannerCart(cart.id, {
        title, noteToClient: note, deliveryFeeCents: toCents(delivery), defaultMarkupBps: toBps(markup),
        lines: lines.filter((l) => l.refId).map((l) => ({
          itemType: l.itemType, refId: l.refId!, quantity: l.quantity, discountBps: l.discountBps, note: l.note,
          clientUnitCents: l.clientUnitCents, markupBps: l.markupBps, venueFeeCents: l.itemType === 'venue' ? l.listUnitCents : undefined,
        })),
      })
      if (!r.ok) { setFlash(r.error); return }
      setDirty(false)
      if (then) await then(); else setFlash('Saved')
    })
  }
  const share = () => {
    if (demo) { setStatus('shared'); setFlash('Preview: quote shared to the client’s event hub'); return }
    save(async () => {
      const r = await sharePlannerCart(cart.id)
      if (r.ok) { setStatus('shared'); setFlash('Shared. It’s in the client’s event hub now.') } else setFlash(r.error)
    })
  }
  const siteRate = () => start(async () => {
    if (demo) { setDelivery('125'); return }
    const r = await quoteDeliveryFee(address)
    if (r.ok) { setDelivery(String(r.cents / 100)); setDirty(true) } else setFlash(r.error)
  })

  return (
    <div className="flex flex-col gap-5 pb-44 md:pb-0">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">{cart.eventTitle} · {shortDate(cart.eventDate)}</p>
            <input aria-label="Cart title" disabled={locked} value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true) }}
              className="mt-1 w-full bg-transparent font-serif text-3xl leading-tight outline-none focus-visible:underline disabled:opacity-100" />
            <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">For {cart.clientName}</p>
          </div>
          <StateChip state={status} />
        </div>
        <ol aria-label="Progress" className="grid grid-cols-4 gap-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5">
              <span className={`h-0.5 transition-colors duration-200 ${i <= stepIndex(status) ? 'bg-[var(--dashboard-accent-gold)]' : 'bg-[var(--dashboard-border)]'}`} />
              <span className={`text-[11px] ${i === stepIndex(status) ? 'font-medium' : 'text-[var(--dashboard-text-muted)]'}`}>{s}</span>
            </li>
          ))}
        </ol>
      </header>

      {!ctx.memberActive && (
        <Notice>
          {ctx.memberStatus === 'terminated' ? 'Membership terminated: list prices only.' : <>No active membership, so your cost is the list price. <a className="underline" href="/planners/membership">Join for 50% off eligible rentals</a>.</>}
        </Notice>
      )}
      {locked && <Notice>{status === 'approved' ? 'The client approved this quote, so it’s locked. Collect payment below.' : 'Paid and turned into the event’s order.'}</Notice>}

      <Presence show={!!flash} id={flash ?? ''}><p role="status" className="text-sm text-[var(--dashboard-text-muted)]">{flash}</p></Presence>

      <section aria-label="Items" className="border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {!locked && (
          <label className="flex items-center justify-between gap-3 border-b border-[var(--dashboard-border)] px-4 py-3 text-xs font-medium text-[var(--dashboard-text-muted)]">
            Default markup on cost
            <span className="flex h-11 items-center gap-1 border border-[var(--dashboard-border)] bg-white px-2">
              +<input inputMode="decimal" className="w-12 bg-transparent text-right tabular-nums text-[var(--dashboard-text)] outline-none" placeholder="list" value={markup} onChange={(e) => { setMarkup(e.target.value.replace(/[^0-9.]/g, '')); setDirty(true) }} />%
            </span>
          </label>
        )}
        <ul className="divide-y divide-[var(--dashboard-border)]">
          {lines.map((l, i) => <LineRow key={l.id} line={l} p={pricing.lines[i]} ctx={ctx} locked={locked}
            onEdit={(patch) => edit(l.id, patch)} onRemove={() => { setLines((ls) => ls.filter((x) => x.id !== l.id)); setDirty(true) }} />)}
          {lines.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">Empty. Add rentals, packages, or a venue from the catalog.</li>}
        </ul>
        {!locked && (
          <div className="p-3">
            <button type="button" className="hub-chip inline-flex w-full items-center justify-center gap-2" aria-expanded={picker} onClick={() => setPicker(!picker)}>
              {picker ? <X className="size-4" /> : <Plus className="size-4" />}{picker ? 'Close catalog' : 'Add from catalog'}
            </button>
          </div>
        )}
        <Presence show={picker && !locked} id="picker"><CatalogPicker items={ctx.catalog} memberActive={ctx.memberActive} onAdd={add} /></Presence>
      </section>

      <section aria-label="Fees and note" className="grid gap-4 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Delivery fee (USD)
          <input disabled={locked} className="plan-field tabular-nums" inputMode="decimal" value={delivery} onChange={(e) => { setDelivery(e.target.value.replace(/[^0-9.]/g, '')); setDirty(true) }} />
        </label>
        {!locked && (
          <div className="flex gap-2">
            <input aria-label="Venue address" className="plan-field !mt-0 flex-1" placeholder="Venue address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <button type="button" className="hub-chip" disabled={pending} onClick={siteRate}>Site rate</button>
          </div>
        )}
        <p className="text-xs text-[var(--dashboard-text-muted)]">Setup fees come from each catalog item. Tax applies to items and setup, like the site checkout.</p>
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Note to the client
          <textarea disabled={locked} rows={3} className="plan-field resize-none" value={note} onChange={(e) => { setNote(e.target.value); setDirty(true) }} />
        </label>
      </section>

      {(status === 'approved' || status === 'paid' || status === 'ordered') && (
        <PaymentStep cartId={cart.id} totalCents={pricing.totalCents} paidCents={cart.paidCents} limits={ctx.limits} links={cart.payments}
          enabled={status === 'approved' && ctx.stripeConfigured} connect={ctx.connect} demo={demo} onFlash={setFlash} />
      )}

      {(status === 'draft' || status === 'shared' || status === 'approved') && cart.paidCents === 0 && <ConvertCartToInvoice cartId={cart.id} demo={demo} />}

      <Summary p={pricing} />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mb-2 flex items-baseline justify-between md:hidden">
          <span className="font-serif text-2xl tabular-nums">{money(pricing.totalCents)}</span>
          <span className="text-xs tabular-nums text-[var(--dashboard-accent-gold)]">Your margin {money(pricing.marginCents)}</span>
        </div>
        {!locked && (
          <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
            <button type="button" className="hub-chip" disabled={pending || !dirty} onClick={() => save()}>{dirty ? 'Save' : 'Saved'}</button>
            <PressButton disabled={pending || lines.length === 0} onClick={share}>{status === 'shared' ? 'Update quote' : 'Share with client'}</PressButton>
          </div>
        )}
      </div>
    </div>
  )
}

function LineRow({ line, p, ctx, locked, onEdit, onRemove }: {
  line: CartLineView; p: PricedLine | undefined; ctx: PlannerCartContext; locked: boolean
  onEdit: (patch: Partial<CartLineView>) => void; onRemove: () => void
}) {
  const [noteOpen, setNoteOpen] = useState(!!line.note)
  const [mode, setMode] = useState<'price' | 'markup'>(line.markupBps != null ? 'markup' : 'price')
  if (!p) return null
  const memberLine = p.memberDiscounted
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium leading-snug">{line.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--dashboard-text-muted)]">
            <span className="capitalize">{line.itemType}</span>
            {line.eligible && (
              <span className={`border px-1.5 py-0.5 ${memberLine ? 'border-[color-mix(in_srgb,var(--dashboard-accent-gold)_45%,transparent)] text-[var(--dashboard-accent-gold)]' : 'border-[var(--dashboard-border)]'}`}>
                {memberLine ? `Member ${pct(ctx.limits.memberDiscountBps)} off` : 'Eligible for members'}
              </span>
            )}
            {line.setupFeeCents > 0 && <span className="tabular-nums">+ {money(line.setupFeeCents)} setup</span>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular-nums">{money(p.clientNetCents)}</p>
          <p className="text-[11px] text-[var(--dashboard-text-muted)]">client</p>
        </div>
      </div>

      {/* Cost / client / margin: planner + admin only. */}
      <dl className="mt-3 grid grid-cols-3 border border-[var(--dashboard-border)] text-center text-xs">
        <div className="border-r border-[var(--dashboard-border)] px-2 py-2">
          <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Your cost</dt>
          <dd className="mt-0.5 tabular-nums">{money(p.costUnitCents)}{memberLine && <s className="ml-1 text-[var(--dashboard-text-muted)]">{money(p.listUnitCents)}</s>}</dd>
        </div>
        <div className="border-r border-[var(--dashboard-border)] px-2 py-2">
          <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Client</dt>
          <dd className="mt-0.5 tabular-nums">{money(p.clientUnitCents)}</dd>
        </div>
        <div className="px-2 py-2">
          <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Margin</dt>
          <dd className="mt-0.5 tabular-nums text-[var(--dashboard-accent-gold)]">{money(p.marginCents)}</dd>
        </div>
      </dl>

      {line.itemType === 'venue' && (
        <label className="mt-3 block text-xs font-medium text-[var(--dashboard-text-muted)]">Venue fee, your cost (USD)
          <input disabled={locked} className="plan-field tabular-nums" inputMode="decimal" value={String(line.listUnitCents / 100)} onChange={(e) => onEdit({ listUnitCents: toCents(e.target.value) })} />
        </label>
      )}

      {!locked && (
        <div className="mt-3 flex items-center gap-2">
          <div role="radiogroup" aria-label="Client price by" className="flex border border-[var(--dashboard-border)] text-xs">
            {(['price', 'markup'] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => { setMode(m); onEdit(m === 'price' ? { markupBps: null } : { clientUnitCents: null, markupBps: line.markupBps ?? Math.round(markupPct(p.costUnitCents, p.clientUnitCents) * 100) }) }}
                className={`h-11 px-3 transition-colors ${mode === m ? 'bg-[var(--theme-dark)] text-white' : 'bg-white'}`}>{m === 'price' ? '$ price' : '% markup'}</button>
            ))}
          </div>
          {mode === 'price' ? (
            <input aria-label="Client unit price" inputMode="decimal" className="h-11 w-full min-w-0 border border-[var(--dashboard-border)] bg-white px-3 tabular-nums outline-none"
              placeholder={String(p.clientUnitCents / 100)} value={line.clientUnitCents == null ? '' : String(line.clientUnitCents / 100)}
              onChange={(e) => onEdit({ clientUnitCents: e.target.value === '' ? null : toCents(e.target.value) })} />
          ) : (
            <span className="flex h-11 w-full items-center gap-1 border border-[var(--dashboard-border)] bg-white px-3">
              +<input aria-label="Markup percent" inputMode="decimal" className="w-full bg-transparent tabular-nums outline-none" value={line.markupBps == null ? '' : String(line.markupBps / 100)}
                onChange={(e) => onEdit({ markupBps: toBps(e.target.value) ?? 0 })} />%
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center border border-[var(--dashboard-border)] bg-white">
          <button type="button" aria-label={`Fewer ${line.name}`} disabled={locked || line.quantity <= 1} className="grid size-11 place-items-center transition-transform active:scale-[0.97] disabled:opacity-30" onClick={() => onEdit({ quantity: line.quantity - 1 })}><Minus className="size-4" /></button>
          <input aria-label="Quantity" disabled={locked} inputMode="numeric" className="w-12 bg-transparent text-center tabular-nums outline-none" value={line.quantity}
            onChange={(e) => onEdit({ quantity: Math.max(1, Math.min(10000, Number(e.target.value.replace(/\D/g, '')) || 1)) })} />
          <button type="button" aria-label={`More ${line.name}`} disabled={locked} className="grid size-11 place-items-center transition-transform active:scale-[0.97] disabled:opacity-30" onClick={() => onEdit({ quantity: line.quantity + 1 })}><Plus className="size-4" /></button>
        </div>
        {!memberLine && ctx.limits.maxLineDiscountBps > 0 && (
          <label className="flex h-11 items-center gap-1 border border-[var(--dashboard-border)] bg-white px-2 text-xs text-[var(--dashboard-text-muted)]">
            <span className="sr-only">Client discount percent</span>−
            <input disabled={locked} inputMode="decimal" className="w-9 bg-transparent text-right tabular-nums text-[var(--dashboard-text)] outline-none" value={line.discountBps ? String(line.discountBps / 100) : ''} placeholder="0"
              onChange={(e) => onEdit({ discountBps: Math.min(ctx.limits.maxLineDiscountBps, toBps(e.target.value) ?? 0) })} />%
          </label>
        )}
        <div className="ml-auto flex gap-1">
          <button type="button" aria-label="Note" aria-pressed={noteOpen} className={`grid size-11 place-items-center transition-colors ${noteOpen || line.note ? 'text-[var(--dashboard-accent-gold)]' : 'text-[var(--dashboard-text-muted)]'}`} onClick={() => setNoteOpen(!noteOpen)}><StickyNote className="size-4" /></button>
          {!locked && <button type="button" aria-label={`Remove ${line.name}`} className="grid size-11 place-items-center text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-red)]" onClick={onRemove}><Trash2 className="size-4" /></button>}
        </div>
      </div>
      {memberLine && <p className="mt-1 text-[11px] text-[var(--dashboard-text-muted)]">Member pricing can’t be combined with other discounts.</p>}
      <Presence show={noteOpen} id={`n-${line.id}`}>
        <input disabled={locked} aria-label={`Note for ${line.name}`} placeholder="Note for this line (client sees it)" className="plan-field text-sm" value={line.note} onChange={(e) => onEdit({ note: e.target.value })} />
      </Presence>
    </li>
  )
}

function CatalogPicker({ items, memberActive, onAdd }: { items: CatalogPick[]; memberActive: boolean; onAdd: (p: CatalogPick) => void }) {
  const [q, setQ] = useState('')
  const cats = useMemo(() => ['All', 'Member 50%', ...Array.from(new Set(items.map((i) => i.category)))], [items])
  const [cat, setCat] = useState('All')
  const shown = items.filter((i) => (cat === 'All' || (cat === 'Member 50%' ? i.eligible : i.category === cat)) && i.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 60)
  return (
    <div className="border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] p-3">
      <label className="relative block">
        <span className="sr-only">Search catalog</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dashboard-text-muted)]" />
        <input className="plan-field !mt-0 pl-9" placeholder="Search rentals, packages, venues" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`hub-chip ${cat === c ? '!border-[var(--theme-dark)] !bg-[var(--theme-dark)] text-white' : ''}`}>{c}</button>
        ))}
      </div>
      <ul className="mt-2 divide-y divide-[var(--dashboard-border)]">
        {shown.map((p) => (
          <li key={`${p.itemType}-${p.refId}`}>
            <button type="button" onClick={() => onAdd(p)} className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:bg-[var(--dashboard-card-hover)] active:scale-[0.99]">
              <span className="min-w-0">
                <span className="block truncate text-sm">{p.name}</span>
                <span className="block text-[11px] text-[var(--dashboard-text-muted)]">{p.category}{p.eligible && ' · member 50%'}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
                {p.itemType === 'venue' ? 'Set fee' : p.eligible && memberActive ? <><s className="text-[var(--dashboard-text-muted)]">{money(p.priceCents)}</s>{money(Math.round(p.priceCents / 2))}</> : money(p.priceCents)}
                <Plus className="size-4 text-[var(--dashboard-accent-gold)]" />
              </span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="py-4 text-sm text-[var(--dashboard-text-muted)]">Nothing matches.</li>}
      </ul>
    </div>
  )
}

function Summary({ p }: { p: ReturnType<typeof priceCart> }) {
  const row = (label: string, v: number) => (
    <div className="flex justify-between gap-3 py-1.5 text-sm"><dt className="text-[var(--dashboard-text-muted)]">{label}</dt><dd className="tabular-nums">{money(v)}</dd></div>
  )
  return (
    <section aria-label="Totals" className="border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Client pays</p>
      <dl className="mt-1">
        {row('Items', p.subtotalCents)}
        {p.setupFeeCents > 0 && row('Setup', p.setupFeeCents)}
        {p.deliveryFeeCents > 0 && row('Delivery', p.deliveryFeeCents)}
        {row('Tax', p.taxCents)}
        <div className="mt-2 flex items-baseline justify-between border-t border-[var(--dashboard-border)] pt-3">
          <dt className="text-sm font-medium">Total</dt><dd className="font-serif text-3xl tabular-nums">{money(p.totalCents)}</dd>
        </div>
      </dl>
      <dl className="mt-3 grid grid-cols-3 bg-[var(--theme-dark)] text-white">
        {[['Your cost', p.costCents], ['Client items', p.subtotalCents], ['Your margin', p.marginCents]].map(([k, v], i) => (
          <div key={k as string} className={`px-3 py-3 ${i < 2 ? 'border-r border-white/10' : ''}`}>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-white/60">{k}</dt>
            <dd className={`mt-1 font-serif text-lg tabular-nums ${i === 2 ? 'text-[var(--theme-accent,#d4b26a)]' : ''}`}>{money(v as number)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] text-[var(--dashboard-text-muted)]">
        {p.memberSavingsCents > 0 && `Member pricing saves you ${money(p.memberSavingsCents)}. `}
        The client never sees your cost or margin.
      </p>
    </section>
  )
}
