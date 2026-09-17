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
          src="/images/mist-cedar-hero-vivid.jpg"
          alt="Guests toasting with champagne at a sunlit celebration dinner"
          fill
          className="object-cover object-[center_40%]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--linen)]/30 via-transparent to-[var(--linen)]" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[var(--linen)]/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--linen)] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center md:px-10">
        <div className="hero-enter relative space-y-7 md:space-y-9">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[115%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--linen)]/60 blur-3xl"
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
            <Link href="#how-it-works" className="lux-cta-ghost group bg-[var(--linen)]/80">
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
