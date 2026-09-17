import nextDynamic from "next/dynamic"
import Link from "next/link"
import { getSiteContent } from "@/lib/content"
import { Skeleton } from "@/components/ui/skeleton"
import { HomePackagesSection } from "@/components/home-packages-section"
import { ArrowRight } from "lucide-react"

const sectionFallback = (
  <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
    <Skeleton className="mb-4 h-4 w-32" />
    <Skeleton className="mb-8 h-12 w-64" />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5]" />
      ))}
    </div>
  </div>
)

const HeroSection = nextDynamic(() =>
  import("@/components/hero-section").then((m) => m.HeroSection),
)
const FeaturedCategories = nextDynamic(
  () =>
    import("@/components/featured-categories").then((m) => m.FeaturedCategories),
  { loading: () => sectionFallback },
)
const InteractiveProcess = nextDynamic(
  () =>
    import("@/components/interactive-process").then((m) => m.InteractiveProcess),
  { loading: () => sectionFallback },
)

export const revalidate = 60

export default async function Home() {
  const content = await getSiteContent()

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection
        title={content["home.hero.title"]}
        subtitle={content["home.hero.subtitle"]}
        ctaPrimary={content["home.hero.cta_primary"]}
        ctaSecondary={content["home.hero.cta_secondary"]}
      />
      <InteractiveProcess />
      <FeaturedCategories />
      <HomePackagesSection />

      <section className="relative overflow-hidden bg-[var(--surface)] py-24 text-center md:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 bg-[var(--champagne)]/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-10">
          <p className="lux-label mb-6">Inquire</p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-[var(--signal)] md:text-6xl">
            Ready to plan your celebration?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-[var(--linen)]/65 md:text-lg">
            Tell us about your date and venue, or start a quote from the catalog.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link href="/contact" className="lux-cta group">
              Inquire
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/catalog" className="lux-cta-ghost group">
              Browse catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
