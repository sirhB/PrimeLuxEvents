'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useCart } from '@/components/providers/cart-provider'
import { formatCurrency } from '@/lib/utils'
import type { HomeProduct } from '@/lib/home/load-home'

type Group = { id: string; label: string }

/**
 * Tabbed, snap-scrolling rail of product cutouts. Product interactions are
 * frequent, so they stay snappy (≤180ms) — the only flourish is a scroll-driven
 * tilt done in CSS (animation-timeline), which is off under reduced motion.
 */
export function RentalRail({ products, groups }: { products: HomeProduct[]; groups: readonly Group[] }) {
  const { addItem } = useCart()
  const available = groups.filter((g) => products.some((p) => p.group === g.id))
  const [tab, setTab] = useState(available[0]?.id ?? 'seating')
  const list = useMemo(() => products.filter((p) => p.group === tab).slice(0, 14), [products, tab])

  return (
    <MotionConfig reducedMotion="user">
      <section className="rail" aria-labelledby="rail-title">
        <div className="rail-head">
          <p className="lux-label">The collection</p>
          <h2 id="rail-title" className="rail-title">Everything the room still needs.</h2>
        </div>
        <div role="tablist" aria-label="Rental categories" className="rail-tabs">
          {available.map((g) => (
            <button key={g.id} role="tab" type="button" aria-selected={tab === g.id} className="rail-tab" onClick={() => setTab(g.id)}>
              {g.label}
              {tab === g.id && <motion.span layoutId="rail-underline" className="rail-underline" transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} />}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab}
            role="tabpanel"
            className="rail-track"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.16 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {list.map((p) => (
              <li key={p.image} className="rail-item">
                <Link href={p.href} className="rail-card">
                  <span className="rail-cutout">
                    <img src={p.image} alt="" loading="lazy" />
                  </span>
                  <span className="rail-name">{p.name}</span>
                  {p.price_cents != null && <span className="rail-price">{formatCurrency(p.price_cents)}</span>}
                </Link>
                {p.id && (
                  <button type="button" className="rail-add" onClick={() => addItem(p.id!, 1)} aria-label={`Add ${p.name} to cart`}>
                    Add
                  </button>
                )}
              </li>
            ))}
            <li className="rail-item rail-more">
              <Link href="/catalog" className="rail-card rail-more-card">See all rentals →</Link>
            </li>
          </motion.ul>
        </AnimatePresence>
      </section>
    </MotionConfig>
  )
}
