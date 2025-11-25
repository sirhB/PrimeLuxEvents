import { HeroSection } from "@/components/hero-section"
import { FeaturedCategories } from "@/components/featured-categories"
import { InteractiveProcess } from "@/components/interactive-process"
import { FeaturedCollection } from "@/components/featured-collection"
import { BrandValuesSection } from "@/components/brand-values-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { getSiteContent } from "@/lib/content"

export default async function Home() {
  const content = await getSiteContent()

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection
        title={content['home.hero.title']}
        subtitle={content['home.hero.subtitle']}
        ctaPrimary={content['home.hero.cta_primary']}
        ctaSecondary={content['home.hero.cta_secondary']}
      />
      <BrandValuesSection
        title={content['home.values.title']}
        description={content['home.values.description']}
        items={content['home.values.items']}
      />
      <FeaturedCategories />
      <InteractiveProcess />
      <FeaturedCollection />
      <TestimonialsSection
        title={content['home.testimonials.title']}
        description={content['home.testimonials.description']}
        items={content['home.testimonials.items']}
      />

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">Ready to plan your event?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg">
            Browse our full catalog, check availability, and secure your rentals instantly online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-medium text-primary transition-all duration-300 hover:bg-background/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Start Your Quote
            </a>
            <a
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-primary-foreground/20 bg-transparent px-8 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
