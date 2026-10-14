'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/providers/cart-provider'
import { formatCurrency } from '@/lib/utils'
import type { PublicProduct } from '@/lib/catalog/catalog-view'

interface ShowroomCarouselProps {
  pieces: PublicProduct[]
  variant?: 'feature' | 'teaser'
}

function wrapOffset(index: number, active: number, count: number) {
  let offset = index - active
  if (offset > count / 2) offset -= count
  if (offset < -count / 2) offset += count
  return offset
}

export function ShowroomCarousel({ pieces, variant = 'feature' }: ShowroomCarouselProps) {
  const reduce = useReducedMotion()
  const { addItem } = useCart()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const scrolling = useRef(false)
  const skipScrollSync = useRef(true)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (skipScrollSync.current) {
      skipScrollSync.current = false
      return
    }
    if (scrolling.current) {
      scrolling.current = false
      return
    }
    const scroller = scrollerRef.current
    const child = scroller?.children[active] as HTMLElement | undefined
    if (!scroller || !child) return
    if (window.matchMedia('(min-width: 768px)').matches) return
    const left = child.offsetLeft - (scroller.clientWidth - child.offsetWidth) / 2
    scroller.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }, [active, reduce])

  if (pieces.length === 0) return null

  const count = pieces.length
  const selected = pieces[Math.min(active, count - 1)]
  const href = `/catalog/${selected.category_slug}/${selected.slug}`

  const onMobileScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget
    const center = scroller.scrollLeft + scroller.clientWidth / 2
    let best = 0
    let bestDistance = Number.POSITIVE_INFINITY
    Array.from(scroller.children).forEach((child, index) => {
      const node = child as HTMLElement
      const mid = node.offsetLeft + node.offsetWidth / 2
      const distance = Math.abs(mid - center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    if (best !== active) {
      scrolling.current = true
      setActive(best)
    }
  }

  const addToEvent = () => {
    addItem(selected.id, 1)
    toast.success(`${selected.name} added to your event`)
  }

  return (
    <section
      id={variant === 'feature' ? 'showroom' : 'showroom-teaser'}
      aria-roledescription="carousel"
      aria-label="Showroom"
      className="relative overflow-hidden bg-[var(--theme-dark)] text-[var(--theme-on-dark)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 38% 52% at 50% 36%, color-mix(in srgb, var(--theme-accent-on-dark) 34%, transparent), transparent 70%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-on-dark)]">
              {variant === 'teaser' ? 'From the floor' : 'Showroom'}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-[var(--theme-on-dark)] md:text-5xl">
              {variant === 'teaser' ? 'Pieces in the light.' : 'A closer look.'}
            </h2>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--theme-on-dark-muted)]">
            {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
        </div>

        <div className="relative mt-4 hidden h-[38rem] md:block" style={{ perspective: '1600px' }}>
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {pieces.map((piece, index) => {
              const offset = wrapOffset(index, active, count)
              const visible = Math.abs(offset) <= 2
              return (
                <motion.button
                  key={piece.id}
                  type="button"
                  aria-label={`Show ${piece.name}`}
                  aria-current={index === active}
                  onClick={() => setActive(index)}
                  className="absolute top-[6%] w-[250px] text-left"
                  style={{
                    left: '50%',
                    marginLeft: -125,
                    transformStyle: 'preserve-3d',
                    zIndex: 20 - Math.abs(offset),
                    pointerEvents: visible ? 'auto' : 'none',
                  }}
                  initial={false}
                  animate={{
                    x: offset * 270,
                    z: -Math.abs(offset) * 150,
                    rotateY: offset * -28,
                    scale: offset === 0 ? 1 : 0.84,
                    opacity: visible ? 1 : 0,
                  }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 22, mass: 0.85 }}
                >
                  <span className="relative mx-auto block h-72 w-52">
                    {piece.image_url && (
                      <Image
                        src={piece.image_url}
                        alt=""
                        fill
                        sizes="250px"
                        className="object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.45)]"
                        priority={index === 0}
                      />
                    )}
                  </span>
                  <span className="mx-auto mt-2 block h-3 w-40 rounded-full bg-black/80 shadow-[0_0_0_12px_rgba(0,0,0,0.35)]" />
                </motion.button>
              )
            })}
          </div>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onMobileScroll}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[8vw] pb-4 md:hidden"
        >
          {pieces.map((piece, index) => (
            <button
              key={piece.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${piece.name}`}
              aria-current={index === active}
              className="w-[74vw] shrink-0 snap-center"
            >
              <span className="relative mx-auto block h-64 w-full">
                {piece.image_url && (
                  <Image src={piece.image_url} alt="" fill sizes="74vw" className="object-contain" loading={index === 0 ? undefined : 'lazy'} />
                )}
              </span>
              <span className="mx-auto mt-3 block h-3 w-32 rounded-full bg-black/80" />
            </button>
          ))}
        </div>

        <div className="relative z-30 mx-auto mt-2 max-w-lg text-center md:pointer-events-none md:absolute md:inset-x-0 md:bottom-2 md:mt-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--theme-accent-on-dark)]">
            {selected.category_name}
          </p>
          <h3 className="mt-3 font-serif text-4xl font-light text-[var(--theme-accent-on-dark)] md:text-5xl">
            <Link href={href} className="pointer-events-auto hover:underline">
              {selected.name}
            </Link>
          </h3>
          <p className="mt-3 text-lg font-light text-[var(--theme-on-dark)]">{formatCurrency(selected.price)}</p>
          <div className="pointer-events-auto mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActive((current) => (current - 1 + count) % count)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--theme-on-dark)]/25"
              aria-label="Previous piece"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={addToEvent}
              className="inline-flex min-h-12 items-center bg-[var(--theme-accent)] px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--theme-on-accent)]"
            >
              Add to event
            </button>
            <button
              type="button"
              onClick={() => setActive((current) => (current + 1) % count)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--theme-on-dark)]/25"
              aria-label="Next piece"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="pointer-events-auto mt-8 flex gap-2 overflow-x-auto pb-1">
            {pieces.map((piece, index) => (
              <button
                key={piece.id}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                className="shrink-0 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{
                  borderColor: index === active ? 'var(--theme-accent-on-dark)' : 'color-mix(in srgb, var(--theme-on-dark) 25%, transparent)',
                  color: index === active ? 'var(--theme-accent-on-dark)' : 'var(--theme-on-dark-muted)',
                }}
              >
                {piece.category_name}
              </button>
            ))}
          </div>
          {variant === 'teaser' && (
            <Link href="/catalog#showroom" className="pointer-events-auto mt-8 inline-flex text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--theme-accent-on-dark)]">
              Open the full showroom
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
