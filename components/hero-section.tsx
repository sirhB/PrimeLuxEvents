"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight, Play } from "lucide-react"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

export function HeroSection({
  title = "PrimeLux Events",
  subtitle = "Luxury party rentals from our Shelton showroom — serving Connecticut, Rhode Island, and Massachusetts.",
  ctaPrimary = "Browse collection",
  ctaSecondary = "How it works",
}: HeroSectionProps) {
  return (
    <section className="spotlight-frame relative h-[100svh] w-full overflow-hidden bg-[var(--ink)]">
      <div className="hero-parallax absolute inset-0">
        <Image
          src="/images/luxury-event-hero.png"
          alt="Luxury event setup with curated rental pieces"
          fill
          className="object-cover opacity-45 contrast-125"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-[var(--ink)]" />
      </div>

      <div className="relative z-10 container mx-auto flex h-full flex-col items-center justify-center px-4 text-center md:px-6">
        <div className="hero-enter max-w-4xl space-y-8 md:space-y-10">
          <p className="lux-label">Shelton, Connecticut</p>

          <h1 className="font-serif text-5xl font-light leading-[0.92] tracking-tighter text-white md:text-7xl lg:text-8xl">
            {title}
          </h1>

          <p className="mx-auto max-w-xl text-base font-light leading-relaxed text-white/75 md:text-lg">
            {subtitle}
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row sm:gap-5">
            <Link href="/catalog" className="lux-cta group">
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/how-it-works" className="lux-cta-ghost group">
              <Play className="h-3 w-3 fill-current" />
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/35">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-12 w-px bg-gradient-to-b from-[var(--champagne)]/50 to-transparent" />
      </div>
    </section>
  )
}
