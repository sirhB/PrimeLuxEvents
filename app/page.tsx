import { HeroSection } from "@/components/hero-section"
import { FeaturedCollection } from "@/components/featured-collection"
import { ServicesSection } from "@/components/services-section"
import { BrandValuesSection } from "@/components/brand-values-section"
import { TestimonialsSection } from "@/components/testimonials-section"

export default function Home() {
  return (
    <>
      <HeroSection />
      <BrandValuesSection />
      <FeaturedCollection />
      <ServicesSection />
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">Ready to plan your event?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg">
            Browse our full catalog, check availability, and secure your rentals instantly online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-medium text-primary transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Start Your Quote
            </a>
            <a
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-primary-foreground/20 bg-transparent px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
