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
        <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-gold selection:text-black pt-32 pb-24 md:pt-48 md:pb-40 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

            {/* Hero Section */}
            <section className="container mx-auto px-4 md:px-6 relative z-10 mb-24 md:mb-32">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="flex items-center justify-center gap-3">
                        <span className="w-12 h-px bg-gold/30" />
                        <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Curated Intelligence</span>
                        <span className="w-12 h-px bg-gold/30" />
                    </div>

                    <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter leading-[0.85]">
                        Event <br />
                        <span className="italic text-gold">Packages</span>
                    </h1>

                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        Simplify your planning with our thoughtfully designed collections, offering premium style at exceptional value.
                    </p>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-12">
                    {packages?.map((pkg, index) => (
                        <Link
                            href={`/packages/${pkg.id}`}
                            key={pkg.id}
                            className="group relative flex flex-col h-full rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#1E1E1E]/50 backdrop-blur-sm transition-all duration-700 hover:border-gold/30 hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                {pkg.image_url ? (
                                    <Image
                                        src={pkg.image_url}
                                        alt={pkg.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <Sparkles className="w-12 h-12 text-gold/20" />
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 z-20">
                                    {pkg.is_featured && (
                                        <div className="bg-gold text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-xl">
                                            <Star className="w-3 h-3 mr-1.5 fill-black" /> Featured
                                        </div>
                                    )}
                                    {pkg.savings_amount > 0 && (
                                        <div className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-center">
                                            Save {formatCurrency(pkg.savings_amount)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 p-5 md:p-10">
                                <h3 className="text-xl md:text-3xl font-serif font-light mb-2 md:mb-4 group-hover:text-gold transition-colors tracking-tight text-white line-clamp-1 md:line-clamp-none">
                                    {pkg.name}
                                </h3>
                                <p className="text-xs md:text-base text-gray-400 line-clamp-2 mb-4 md:mb-8 flex-1 font-light leading-relaxed">
                                    {pkg.description}
                                </p>

                                <div className="pt-4 md:pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        {pkg.original_price > pkg.price && (
                                            <div className="text-xs text-gray-500 line-through font-light">
                                                {formatCurrency(pkg.original_price)}
                                            </div>
                                        )}
                                        <div className="text-xl md:text-3xl font-serif font-light text-gold">
                                            {formatCurrency(pkg.price)}
                                        </div>
                                    </div>

                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all duration-500">
                                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {(!packages || packages.length === 0) && (
                    <div className="text-center py-40">
                        <Sparkles className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                        <h3 className="text-2xl font-serif text-white mb-4">Masterpieces in Preparation</h3>
                        <p className="text-gray-500 font-light">We are tailoring our exclusive collections.</p>
                    </div>
                )}
            </section>
        </main>
    )
}
