import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface GrandRevealHeroProps {
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

const HEADLINE = ['Moments,', 'Crowned.']

function curtainStyle(side: 'left' | 'right') {
  const edge = side === 'left' ? 'to left' : 'to right'
  return {
    backgroundImage: `
      linear-gradient(${edge}, color-mix(in srgb, var(--theme-dark) 18%, transparent), var(--theme-dark) 92%),
      repeating-linear-gradient(
        90deg,
        color-mix(in srgb, var(--theme-accent) 78%, var(--theme-dark)) 0px,
        var(--theme-accent) 14px,
        color-mix(in srgb, var(--theme-accent) 42%, black) 28px,
        color-mix(in srgb, var(--theme-accent) 88%, white) 46px
      )
    `,
  }
}

export function GrandRevealHero({
  subtitle = 'Furniture, lighting, tents, and décor for celebrations across Connecticut, Rhode Island, and Massachusetts.',
  ctaPrimary = 'Browse Catalog',
  ctaSecondary = 'How It Works',
}: GrandRevealHeroProps) {
  const letters = HEADLINE.map((line) => line.split(''))

  return (
    <section className="relative h-[calc(100svh-7.25rem)] min-h-[36rem] w-full overflow-hidden bg-[var(--theme-dark)]">
      <Image
        src="/images/luxury_event_setup_celebration_1767781442112.png"
        alt="A fully styled celebration table in a candlelit room"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_45%]"
      />
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--theme-dark)_58%,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--theme-dark)] to-transparent" />

      <div className="relative z-20 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.42em] text-[var(--theme-accent-on-dark)]">
          PrimeLux Events
        </p>
        <h1 className="font-serif text-[clamp(3.4rem,9vw,7.5rem)] font-light leading-[0.9] tracking-tight text-[var(--theme-on-dark)]">
          {letters.map((line, lineIndex) => (
            <span key={HEADLINE[lineIndex]} className="block">
              {line.map((character, index) => {
                const previous = letters.slice(0, lineIndex).reduce((sum, item) => sum + item.length, 0)
                return (
                  <span
                    key={`${lineIndex}-${index}`}
                    className="reveal-letter"
                    style={{ animationDelay: `${0.72 + (previous + index) * 0.038}s` }}
                  >
                    {character === ' ' ? '\u00A0' : character}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-[var(--theme-on-dark)]/85 md:text-lg">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/catalog" className="lux-cta">
            {ctaPrimary}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="#how-it-works" className="lux-cta-ghost on-media">
            {ctaSecondary}
          </Link>
        </div>
      </div>

      <a
        href="#scroll-story"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-on-dark)]/80"
      >
        Scroll to explore
        <span className="reveal-cue block h-8 w-px bg-[var(--theme-accent-on-dark)]" aria-hidden />
      </a>

      <div
        aria-hidden
        className="reveal-curtain reveal-curtain-left absolute inset-y-0 left-0 z-30 w-1/2 shadow-[12px_0_40px_rgba(0,0,0,0.28)]"
        style={curtainStyle('left')}
      />
      <div
        aria-hidden
        className="reveal-curtain reveal-curtain-right absolute inset-y-0 right-0 z-30 w-1/2 shadow-[-12px_0_40px_rgba(0,0,0,0.28)]"
        style={curtainStyle('right')}
      />
    </section>
  )
}
