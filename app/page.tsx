import { HeroSection } from "@/components/hero-section"
import { FeaturedCategories } from "@/components/featured-categories"
import { InteractiveProcess } from "@/components/interactive-process"
import { FeaturedCollection } from "@/components/featured-collection"
import { BrandValuesSection } from "@/components/brand-values-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { getSiteContent } from "@/lib/content"

export const dynamic = 'force-dynamic'

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
      <section className="py-24 md:py-40 bg-[#1A1A1A] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6 block">Start Your Journey</span>
            <h2 className="text-4xl md:text-6xl font-serif font-light mb-8 tracking-tight">Ready to plan your next extraordinary event?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg font-light leading-relaxed">
              Browse our full catalog, check availability, and secure your rentals instantly online. Our team is here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/catalog"
                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-gold px-12 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all duration-500 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">Start Your Quote</span>
                <div className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex h-16 items-center justify-center rounded-full border border-white/20 bg-transparent px-12 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
