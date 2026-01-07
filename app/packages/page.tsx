import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, Check, Star, Sparkles } from 'lucide-react'

export const metadata = {
    title: 'Luxury Event Packages | PrimeLux Events',
    description: 'Explore our curated event packages featuring premium rentals, decor, and exclusive savings.',
}

export default async function PackagesPage() {
    const supabase = await createClient()
    const { data: packages } = await supabase
        .from('packages')
        .select('*, package_item_groups(count)')
        .order('is_featured', { ascending: false })
        .order('price', { ascending: true })

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]" />
                <Image
                    src="/images/packages-hero.png"
                    alt="Luxury Event Packages"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="relative z-20 container px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="w-12 h-px bg-gold/50" />
                        <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Curated Collections</span>
                        <span className="w-12 h-px bg-gold/50" />
                    </div>
                    <h1 className="text-5xl md:text-8xl font-serif font-light mb-8 tracking-tighter text-white leading-tight">
                        Event Packages
                    </h1>
                    <p className="text-lg md:text-xl font-light max-w-2xl mx-auto text-gray-200 opacity-80 leading-relaxed">
                        Simplify your planning with our thoughtfully designed collections, offering premium style at exceptional value.
                    </p>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="py-24 md:py-40 px-4 md:px-6 container mx-auto relative">
                {/* Decorative background element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold/50 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                    {packages?.map((pkg, index) => (
                        <Link
                            href={`/packages/${pkg.id}`}
                            key={pkg.id}
                            className="group block h-full"
                        >
                            <div className="relative h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-4 border border-border/5">
                                {/* Image Container */}
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                                    {pkg.image_url ? (
                                        <Image
                                            src={pkg.image_url}
                                            alt={pkg.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                                            <Sparkles className="w-12 h-12 text-gold/20" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Badges */}
                                    <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                                        {pkg.is_featured && (
                                            <div className="bg-gold text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-xl">
                                                <Star className="w-3 h-3 mr-1.5 fill-black" /> Featured
                                            </div>
                                        )}
                                        {pkg.savings_amount > 0 && (
                                            <div className="bg-white text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                                                Save {formatCurrency(pkg.savings_amount)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1 p-10 text-center">
                                    <h3 className="text-3xl font-serif font-bold mb-4 group-hover:text-gold transition-colors tracking-tight">
                                        {pkg.name}
                                    </h3>
                                    <p className="text-gray-500 line-clamp-3 mb-8 flex-1 font-light text-sm leading-relaxed">
                                        {pkg.description}
                                    </p>

                                    <div className="mt-auto pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
                                        <div className="space-y-1">
                                            {pkg.original_price > pkg.price && (
                                                <div className="text-xs text-gray-400 line-through font-light">
                                                    {formatCurrency(pkg.original_price)}
                                                </div>
                                            )}
                                            <div className="text-4xl font-serif font-light text-gray-900">
                                                {formatCurrency(pkg.price)}
                                            </div>
                                        </div>

                                        <div className="w-full py-4 bg-[#1A1A1A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] group-hover:bg-gold group-hover:text-black transition-all duration-500 flex items-center justify-center gap-2">
                                            Configure Package <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {packages?.length === 0 && (
                    <div className="text-center py-40">
                        <Sparkles className="w-16 h-16 text-gold/20 mx-auto mb-8" />
                        <h3 className="text-3xl font-serif font-light text-gray-400">No packages available at the moment.</h3>
                        <p className="mt-4 text-gray-500 font-light">Please check back soon for our exclusive collections.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
