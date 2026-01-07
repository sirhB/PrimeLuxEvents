"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  return (
    <div ref={containerRef} className="relative h-[100vh] w-full overflow-hidden bg-[#1A1A1A]">
      {/* Background Image with Parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0 w-full h-full">
        <Image
          src="/images/luxury-event-hero.png"
          alt="Luxury Event Setup"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]" />
      </motion.div>

      {/* Content */}
      <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
        <motion.div
          style={{ opacity }}
          className="max-w-5xl space-y-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="w-12 h-px bg-gold/50" />
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Bespoke Event Rentals</span>
            <span className="w-12 h-px bg-gold/50" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-9xl font-serif text-white font-light tracking-tighter leading-[0.9]"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light opacity-80"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-4"
          >
            <Link
              href="/catalog"
              className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-gold px-10 text-sm font-bold uppercase tracking-widest text-black transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {ctaPrimary} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
            </Link>

            <Link
              href="/how-it-works"
              className="group inline-flex h-16 items-center justify-center rounded-full border border-white/30 bg-white/5 px-10 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Play className="h-3 w-3 fill-white" /> {ctaSecondary}
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/30"
      >
        <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Explore Collection</span>
        <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent" />
      </motion.div>
    </div>
  )
}
