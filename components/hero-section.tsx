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
    <section className="relative h-[100svh] w-full overflow-hidden bg-[var(--ink)]">
      <div className="hero-parallax absolute inset-0">
        <Image
          src="/images/mist-cedar-hero-vivid.jpg"
          alt="Guests toasting with champagne at a sunlit celebration dinner"
          fill
          className="object-cover object-[center_40%]"
          priority
          sizes="100vw"
        />
        {/* Edge only — keeps header/footer transition clean without a center wash */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--ink)]/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--linen)] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center md:px-10">
        <div className="hero-enter space-y-7 md:space-y-9">
          <p
            className="font-serif text-5xl font-light tracking-tight text-white md:text-7xl lg:text-8xl"
            style={{ textShadow: "0 2px 24px rgba(26,36,32,0.45), 0 1px 2px rgba(26,36,32,0.55)" }}
          >
            PrimeLux<span className="text-[var(--champagne)]">.</span>
          </p>

          <h1
            className="mx-auto max-w-3xl font-serif text-2xl font-light leading-snug tracking-tight text-white md:text-4xl lg:text-5xl"
            style={{ textShadow: "0 2px 20px rgba(26,36,32,0.4), 0 1px 2px rgba(26,36,32,0.5)" }}
          >
            {title}
          </h1>

          <p
            className="mx-auto max-w-xl text-base font-light leading-relaxed text-white/90 md:text-lg"
            style={{ textShadow: "0 1px 14px rgba(26,36,32,0.45), 0 1px 2px rgba(26,36,32,0.4)" }}
          >
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:gap-5">
            <Link href="/catalog" className="lux-cta group shadow-lg shadow-[var(--ink)]/25">
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#how-it-works" className="lux-cta-ghost on-media group">
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
