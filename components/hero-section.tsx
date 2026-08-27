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
  title = "Curating Unforgettable Moments of Luxury",
  subtitle = "Premier event rentals and styling for weddings, galas, and corporate gatherings. Browse our collection and book directly online.",
  ctaPrimary = "Rent Online",
  ctaSecondary = "How It Works",
}: HeroSectionProps) {
  return (
    <section className="spotlight-frame relative h-[100vh] w-full overflow-hidden bg-[var(--ink,#121110)]">
      <div className="hero-parallax absolute inset-0">
        <Image
          src="/images/luxury-event-hero.png"
          alt="Luxury event setup with curated rental pieces"
          fill
          className="object-cover opacity-50 contrast-125"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[var(--ink,#121110)]" />
      </div>

      <div className="relative z-10 container mx-auto flex h-full flex-col items-center justify-center px-4 text-center md:px-6">
        <div className="hero-enter max-w-5xl space-y-10">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[var(--champagne,#B8956B)]/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--champagne,#B8956B)] md:text-xs">
              Bespoke event rentals
            </span>
            <span className="h-px w-12 bg-[var(--champagne,#B8956B)]/50" />
          </div>

          <h1 className="font-serif text-5xl font-light leading-[0.9] tracking-tighter text-white md:text-7xl lg:text-9xl">
            {title}
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-gray-200 opacity-80 md:text-xl">
            {subtitle}
          </p>

          <div className="flex flex-col justify-center gap-6 pt-4 sm:flex-row">
            <Link
              href="/catalog"
              className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-[var(--champagne,#B8956B)] px-10 text-sm font-bold uppercase tracking-widest text-black transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {ctaPrimary} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
            </Link>

            <Link
              href="/how-it-works"
              className="group inline-flex h-16 items-center justify-center rounded-full border border-white/30 bg-white/5 px-10 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white/10 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Play className="h-3 w-3 fill-white" /> {ctaSecondary}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4 text-white/30">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Explore collection</span>
        <div className="h-16 w-px bg-gradient-to-b from-[var(--champagne,#B8956B)]/50 to-transparent" />
      </div>
    </section>
  )
}
