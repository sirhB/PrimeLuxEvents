import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
    title: 'Event Packages | PrimeLux Events',
    description: 'Ready-made rental packages that bundle popular pieces and save planning time.',
}

export default async function PackagesPage() {
    const supabase = await createClient()
    const { data: packages } = await supabase
        .from('packages')
        .select('*, package_item_groups(count)')
        .order('is_featured', { ascending: false })
        .order('price', { ascending: true })

    return (
        <main>
            <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-28">
                <p className="lux-label">Rentals</p>
                <h1 className="mt-4 font-serif text-5xl font-medium leading-[0.95] md:text-7xl">Packages</h1>
                <p className="mt-5 text-base font-light leading-relaxed text-[var(--theme-muted)]">
                    Thoughtfully grouped rentals so you can plan faster and stay on budget.
                </p>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
                {packages && packages.length > 0 ? (
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <Link href={`/packages/${pkg.id}`} key={pkg.id} className="group block">
                                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)]">
                                    {pkg.image_url ? (
                                        <Image
                                            src={pkg.image_url}
                                            alt=""
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        />
                                    ) : null}
                                </div>
                                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">
                                    {pkg.is_featured ? 'Featured' : 'Package'}
                                    {pkg.savings_amount > 0 ? ` · Save ${formatCurrency(pkg.savings_amount)}` : ''}
                                </p>
                                <h2 className="mt-1 font-serif text-3xl font-medium">{pkg.name}</h2>
                                <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-[var(--theme-muted)]">
                                    {pkg.description}
                                </p>
                                <p className="mt-3 font-serif text-2xl">
                                    {pkg.original_price > pkg.price && (
                                        <span className="mr-2 text-base text-[var(--theme-muted)] line-through">
                                            {formatCurrency(pkg.original_price)}
                                        </span>
                                    )}
                                    {formatCurrency(pkg.price)}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="py-20 text-center font-serif text-3xl text-[var(--theme-muted)]">
                        Packages are being prepared for the next season.
                    </p>
                )}
            </section>
        </main>
    )
}
