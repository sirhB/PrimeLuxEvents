import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export async function HomePackagesSection() {
  const supabase = await createClient()
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, description, price, original_price, is_featured")
    .order("is_featured", { ascending: false })
    .order("price", { ascending: true })
    .limit(3)

  return (
    <section className="relative overflow-hidden bg-background py-24 text-[var(--signal)] md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[var(--champagne)]/8 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="lux-label mb-4">Packages</p>
            <h2 className="font-serif text-4xl font-light tracking-tight md:text-6xl">
              Bundles that save planning time
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-[var(--linen)]/65 md:text-lg">
              Ready-made rental sets so you can move from idea to quote faster.
            </p>
          </div>
          <Link href="/packages" className="lux-cta-ghost group shrink-0">
            All packages
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {packages && packages.length > 0 ? (
          <ul className="divide-y divide-[var(--linen)]/10 border-y border-[var(--linen)]/10">
            {packages.map((pkg) => (
              <li key={pkg.id}>
                <Link
                  href={`/packages/${pkg.id}`}
                  className="group flex flex-col gap-4 py-8 transition-colors md:flex-row md:items-center md:justify-between md:gap-10 md:py-10"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-serif text-2xl font-light tracking-tight transition-colors group-hover:text-[var(--champagne)] md:text-3xl">
                        {pkg.name}
                      </h3>
                      {pkg.is_featured ? (
                        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--champagne)]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    {pkg.description ? (
                      <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[var(--linen)]/55 line-clamp-2">
                        {pkg.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      {pkg.original_price != null &&
                      pkg.original_price > pkg.price ? (
                        <p className="text-xs font-light text-[var(--linen)]/35 line-through">
                          {formatCurrency(pkg.original_price)}
                        </p>
                      ) : null}
                      <p className="font-serif text-2xl font-light text-[var(--champagne)] md:text-3xl">
                        {formatCurrency(pkg.price)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--linen)]/40 transition-transform group-hover:translate-x-1 group-hover:text-[var(--champagne)]" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-y border-[var(--linen)]/10 py-16 text-center">
            <p className="font-serif text-2xl font-light">Packages coming soon</p>
            <p className="mt-3 text-sm font-light text-[var(--linen)]/50">
              Browse the full catalog while we finish bundling popular sets.
            </p>
            <Link href="/catalog" className="lux-cta mt-8 inline-flex">
              Browse catalog
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
