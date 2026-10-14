'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'

const CHAPTERS = [
  {
    id: 'venue',
    label: 'Venue',
    title: 'The room, waiting.',
    body: 'We start with the space itself — the footprint, the flow, and what the room can hold before a single piece is placed.',
    image: '/images/service-setup.png',
    alt: 'An event space being prepared before décor arrives',
  },
  {
    id: 'decor',
    label: 'Decor',
    title: 'Seating and tables, placed.',
    body: 'Chairs, tables, and statement pieces from the collection land where the evening needs them.',
    image: '/images/luxury_furniture_collection_1767781427931.png',
    alt: 'Luxury rental furniture arranged for a celebration',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    title: 'Light, brought in.',
    body: 'Marquee letters, uplights, and fixtures set the temperature of the room once the furniture is in place.',
    image: '/images/products/large-marquee-cross-with-light.jpg',
    alt: 'Illuminated marquee cross from the lighting collection',
  },
  {
    id: 'celebration',
    label: 'Celebration',
    title: 'The night, fully styled.',
    body: 'Guests arrive to a room that already feels finished — furniture, florals, and light working as one.',
    image: '/images/luxury_event_setup_celebration_1767781442112.png',
    alt: 'A fully styled celebration ready for guests',
  },
] as const

function ChapterImage({
  chapter,
  index,
  progress,
  priority,
}: {
  chapter: (typeof CHAPTERS)[number]
  index: number
  progress: MotionValue<number>
  priority?: boolean
}) {
  const start = index / CHAPTERS.length
  const peak = (index + 0.15) / CHAPTERS.length
  const fade = (index + 0.85) / CHAPTERS.length
  const end = (index + 1) / CHAPTERS.length
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, 0.18, 0.28]
      : index === CHAPTERS.length - 1
        ? [start - 0.06, peak, 1]
        : [start - 0.04, peak, fade, end],
    index === 0 ? [1, 1, 0] : index === CHAPTERS.length - 1 ? [0, 1, 1] : [0, 1, 1, 0],
  )

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <Image
        src={chapter.image}
        alt={chapter.alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 70vw"
        className="object-cover"
      />
    </motion.div>
  )
}

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(value * CHAPTERS.length)))
    setActive((current) => (current === next ? current : next))
  })

  const goTo = (index: number) => {
    const node = ref.current
    if (!node) return
    const start = node.offsetTop
    const span = node.offsetHeight - window.innerHeight
    window.scrollTo({ top: start + span * (index / (CHAPTERS.length - 1)), behavior: 'smooth' })
  }

  const chapter = CHAPTERS[active]

  return (
    <div id="scroll-story">
      <section
        ref={ref}
        className="scroll-story-pin relative h-[340vh] bg-[var(--theme-dark)] text-[var(--theme-on-dark)]"
        aria-label="How a room comes together"
      >
        <div className="sticky top-[var(--header-height,7.25rem)] flex h-[calc(100svh-var(--header-height,7.25rem))] flex-col overflow-hidden">
          <div className="flex items-end justify-between gap-6 px-5 pb-4 pt-6 md:px-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-on-dark)]">
              The evening, in four movements
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--theme-on-dark-muted)]">
              {String(active + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
            </p>
          </div>

          <div className="grid min-h-0 flex-1 md:grid-cols-12">
            <div className="flex items-center gap-4 overflow-x-auto px-5 pb-4 md:hidden">
              {CHAPTERS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-current={index === active}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: index === active ? 'var(--theme-accent-on-dark)' : 'var(--theme-on-dark-muted)' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative min-h-[42vh] md:col-span-7 md:min-h-0">
              {CHAPTERS.map((item, index) => (
                <ChapterImage key={item.id} chapter={item} index={index} progress={scrollYProgress} priority={index === 0} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-dark)] via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            <div className="relative z-10 flex flex-col justify-center px-5 py-8 md:col-span-5 md:px-12">
              <ol className="mb-8 hidden gap-5 md:flex md:flex-col">
                {CHAPTERS.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={index === active}
                      className="group flex items-center gap-4 text-left"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border"
                        style={{
                          borderColor: 'var(--theme-accent-on-dark)',
                          background: index <= active ? 'var(--theme-accent-on-dark)' : 'transparent',
                        }}
                      />
                      <span
                        className="text-[12px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: index === active ? 'var(--theme-accent-on-dark)' : 'var(--theme-on-dark-muted)' }}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="relative mb-8 hidden h-px w-full md:block" aria-hidden>
                <div className="absolute inset-0 bg-[var(--theme-on-dark)]/15" />
                <motion.div
                  style={{ scaleX: scrollYProgress }}
                  className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--theme-accent-on-dark)]"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-on-dark)]" aria-live="polite">
                {chapter.label}
              </p>
              <h2 className="mt-3 max-w-md font-serif text-4xl font-light leading-tight text-[var(--theme-on-dark)] md:text-6xl">
                {chapter.title}
              </h2>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-[var(--theme-on-dark)]/75">
                {chapter.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-story-static bg-[var(--theme-dark)] px-5 py-16 text-[var(--theme-on-dark)] md:px-10" aria-label="How a room comes together">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-on-dark)]">
          The evening, in four movements
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {CHAPTERS.map((item) => (
            <article key={item.id}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <h2 className="mt-4 font-serif text-3xl font-light">{item.title}</h2>
              <p className="mt-2 text-sm font-light leading-relaxed text-[var(--theme-on-dark)]/75">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
