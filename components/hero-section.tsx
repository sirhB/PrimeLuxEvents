"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

export function HeroSection({
  title = "Event rentals, ready to book",
  subtitle = "Furniture, lighting, tents, and décor for celebrations across CT, RI, and MA.",
  ctaPrimary = "Browse Catalog",
  ctaSecondary = "How It Works",
}: HeroSectionProps) {
  return (
    <section className="spotlight-frame relative h-[100svh] w-full overflow-hidden bg-[var(--linen)]">
      <div className="hero-parallax absolute inset-0">
        <Image
          src="/images/mist-cedar-hero-vivid.png"
          alt="Sunlit outdoor event tables with linen and greenery"
          fill
          className="object-cover object-center contrast-[1.05] saturate-[1.2]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--linen)]/20 via-transparent to-[var(--linen)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--linen)]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--linen)] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center md:px-10">
        <div className="hero-enter relative space-y-7 md:space-y-9">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[140%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--linen)]/75 blur-2xl"
          />
          <p className="font-serif text-5xl font-light tracking-tight text-[var(--ink)] md:text-7xl lg:text-8xl">
            PrimeLux<span className="text-[var(--champagne)]">.</span>
          </p>

          <h1 className="mx-auto max-w-3xl font-serif text-2xl font-light leading-snug tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mx-auto max-w-xl text-base font-light leading-relaxed text-[var(--ink)]/75 md:text-lg">
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:gap-5">
            <Link href="/catalog" className="lux-cta group">
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#how-it-works" className="lux-cta-ghost group bg-[var(--linen)]/70">
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
