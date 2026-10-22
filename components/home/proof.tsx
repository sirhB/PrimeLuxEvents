'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

type Stat = { label: string; value: number | null; suffix?: string }

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) { setN(value); return }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, value])
  return <span ref={ref} className="tabular-nums">{n}</span>
}

/**
 * Proof. Stats are real counts only (catalog, categories, venues) — anything we
 * don't know shows as a labeled placeholder. Reviews are placeholders until a
 * real review source (e.g. Google Business Profile) is connected.
 */
export function Proof({ stats }: { stats: Stat[] }) {
  const [paused, setPaused] = useState(false)
  const placeholders = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <section className="proof" aria-labelledby="proof-title">
      <h2 id="proof-title" className="sr-only">Proof</h2>
      <dl className="proof-stats">
        {stats.map((s) => (
          <div key={s.label} className="proof-stat">
            <dt>{s.label}</dt>
            <dd>{s.value == null ? <span className="proof-ph">Placeholder</span> : <><CountUp value={s.value} />{s.suffix}</>}</dd>
          </div>
        ))}
      </dl>
      <div className="proof-marquee" data-paused={paused || undefined}>
        <button type="button" className="proof-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? 'Play reviews' : 'Pause reviews'}
        </button>
        <div className="proof-track">
          {[0, 1].map((dup) => (
            <ul key={dup} className="proof-row" aria-hidden={dup === 1 || undefined}>
              {placeholders.map((i) => (
                <li key={i} className="proof-card">
                  <p className="proof-ph-label">Review placeholder {i}</p>
                  <p className="proof-quote">Connect Google reviews to show real client quotes here.</p>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
