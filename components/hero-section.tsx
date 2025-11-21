import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image" // Added Image import
import { ScrollParallaxScene } from "@/components/scroll-parallax-scene"

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
    <section className="relative h-[90vh] w-full overflow-hidden bg-black">
      <ScrollParallaxScene />
      <Image
        src="/luxury-event-setup-ballroom-chandelier.jpg"
        alt="Luxury Event Setup"
        fill
        className="object-cover opacity-60 animate-scale-in duration-[2s]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight animate-fade-in-up">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200 text-base h-12 px-8">
              <Link href="/catalog">{ctaPrimary}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white/10 text-base h-12 px-8 bg-transparent"
            >
              <Link href="/how-it-works">{ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
