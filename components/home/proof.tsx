'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { REVIEWS, GOOGLE_PROFILE_URL } from '@/lib/reviews/data'

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
 * don't know shows as a labeled placeholder. Reviews are real public Google
 * reviews from lib/reviews/data.ts; the strip hides itself if that list is empty.
 */
export function Proof({ stats }: { stats: Stat[] }) {
  const [paused, setPaused] = useState(false)
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
      {REVIEWS.length > 0 && (
        <>
          <div className="proof-marquee" data-paused={paused || undefined}>
            <button type="button" className="proof-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              {paused ? 'Play reviews' : 'Pause reviews'}
            </button>
            <div className="proof-track">
              {[0, 1].map((dup) => (
                <ul key={dup} className="proof-row" aria-hidden={dup === 1 || undefined}>
                  {REVIEWS.map((r) => (
                    <li key={r.name} className="proof-card">
                      <p className="proof-ph-label" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}</p>
                      <p className="proof-quote">“{r.quote}”</p>
                      <p className="proof-ph-label">{r.name} · {r.source}</p>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-sm">
            <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Read more on Google
            </a>
          </p>
        </>
      )}
    </section>
  )
}
