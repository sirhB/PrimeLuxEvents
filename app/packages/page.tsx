import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, Check, Star } from 'lucide-react'

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
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <Image
                    src="/images/packages-hero.png"
                    alt="Luxury Event Packages"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 container px-4 text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-tight">
                        Curated Packages
                    </h1>
                    <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto text-white/90">
                        Simplify your planning with our thoughtfully designed collections, offering premium style at exceptional value.
                    </p>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="py-24 px-4 md:px-6 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {packages?.map((pkg) => (
                        <Link
                            href={`/packages/${pkg.id}`}
                            key={pkg.id}
                            className="group block h-full"
                        >
                            <div className="relative h-full flex flex-col bg-white border border-border/40 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-2">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                                    {pkg.image_url ? (
                                        <Image
                                            src={pkg.image_url}
                                            alt={pkg.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                                            No Image
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {pkg.is_featured && (
                                            <Badge className="bg-gold text-black hover:bg-gold/90 border-none shadow-lg">
                                                <Star className="w-3 h-3 mr-1 fill-black" /> Featured
                                            </Badge>
                                        )}
                                        {pkg.savings_amount > 0 && (
                                            <Badge className="bg-white/90 text-green-800 backdrop-blur-sm border-none shadow-lg">
                                                Save {formatCurrency(pkg.savings_amount)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1 p-8">
                                    <h3 className="text-2xl font-serif mb-3 group-hover:text-gold transition-colors">
                                        {pkg.name}
                                    </h3>
                                    <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 font-light">
                                        {pkg.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-border/40 flex items-end justify-between">
                                        <div>
                                            {pkg.original_price > pkg.price && (
                                                <div className="text-sm text-muted-foreground line-through mb-1">
                                                    {formatCurrency(pkg.original_price)}
                                                </div>
                                            )}
                                            <div className="text-3xl font-light text-gold-dark">
                                                {formatCurrency(pkg.price)}
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="group/btn p-0 hover:bg-transparent hover:text-gold">
                                            Configure
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {packages?.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-serif text-muted-foreground">No packages available at the moment.</h3>
                        <p className="mt-4 text-gray-500">Please check back soon for our exclusive collections.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
