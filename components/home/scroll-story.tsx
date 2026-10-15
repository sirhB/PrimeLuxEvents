'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

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

export function ScrollStory() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const nodes = CHAPTERS.map((chapter) => document.getElementById(`story-${chapter.id}`)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const index = Number((visible.target as HTMLElement).dataset.index)
        if (Number.isFinite(index)) setActive(index)
      },
      { threshold: [0.45, 0.6, 0.75] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`story-${CHAPTERS[index].id}`)?.scrollIntoView({
      block: 'start',
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  return (
    <section id="scroll-story" aria-label="How a room comes together" className="relative bg-[var(--theme-dark)] text-[var(--theme-on-dark)]">
      <div className="sticky top-[var(--header-height,5.5rem)] z-20 border-b border-[var(--theme-on-dark)]/10 bg-[var(--theme-dark)]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 md:px-10">
          <p className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--theme-accent-on-dark)] sm:block">
            The evening
          </p>
          <div className="relative h-px flex-1 bg-[var(--theme-on-dark)]/15" aria-hidden>
            <div
              className="absolute inset-y-0 left-0 bg-[var(--theme-accent-on-dark)] motion-reduce:transition-none transition-[width] duration-500"
              style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }}
            />
          </div>
          <ol className="flex shrink-0 items-center gap-3 md:gap-5">
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-current={index === active}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] md:text-[11px] md:tracking-[0.18em]"
                  style={{ color: index === active ? 'var(--theme-accent-on-dark)' : 'var(--theme-on-dark-muted)' }}
                >
                  {chapter.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {CHAPTERS.map((chapter, index) => (
        <article
          key={chapter.id}
          id={`story-${chapter.id}`}
          data-index={index}
          className="relative min-h-[100svh] scroll-mt-[calc(var(--header-height,5.5rem)+3.25rem)]"
        >
          <Image
            src={chapter.image}
            alt={chapter.alt}
            fill
            sizes="100vw"
            className="object-cover"
            {...(index === 0 ? { priority: true } : { loading: 'eager' as const })}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-dark)] via-[var(--theme-dark)]/55 to-[var(--theme-dark)]/25 md:bg-gradient-to-r md:from-[var(--theme-dark)] md:via-[var(--theme-dark)]/72 md:to-transparent" />
          <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-16 pt-28 md:max-w-2xl md:justify-center md:px-16 md:pb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-on-dark)]">
              {String(index + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')} · {chapter.label}
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-[var(--theme-on-dark)] md:text-6xl">
              {chapter.title}
            </h2>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-[var(--theme-on-dark)]/85 md:text-lg">
              {chapter.body}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
