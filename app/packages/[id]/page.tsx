import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PackageConfigurator from '@/components/packages/PackageConfigurator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: pkg } = await supabase
        .from('packages')
        .select('name, description')
        .eq('id', id)
        .single()

    if (!pkg) return { title: 'Package Not Found' }

    return {
        title: `${pkg.name} | PrimeLux Events`,
        description: pkg.description,
    }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch complete package data
    // 1. Fetch package details (simple query)
    const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single()

    if (pkgError) {
        throw new Error(`Package Load Error: ${JSON.stringify(pkgError)}`)
    }

    if (!pkg) {
        notFound()
    }

    // 2. Fetch groups and options separately to avoid deep nesting complexity/errors
    const { data: groups, error: groupsError } = await supabase
        .from('package_item_groups')
        .select(`
            *,
            package_item_options (
                *,
                products (*)
            )
        `)
        .eq('package_id', id)
        .order('display_order')

    if (groupsError) {
        console.error('Error loading package groups:', groupsError)
        // We catch this but don't crash, allowing the page to load with 0 groups
    }

    // 3. Attach groups to package object so it matches expected structure
    pkg.package_item_groups = groups || []

    // Transform data for the client component
    const transformedPkg = {
        ...pkg,
        groups: pkg.package_item_groups
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((g: any) => ({
                ...g,
                options: g.package_item_options
                    .sort((a: any, b: any) => a.display_order - b.display_order)
                    .map((o: any) => ({
                        id: o.id,
                        product_id: o.product_id,
                        is_default: o.is_default,
                        quantity: o.quantity,
                        product: o.products
                    }))
            }))
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Header */}
            <div className="relative h-[40vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10" />
                {pkg.image_url ? (
                    <Image
                        src={pkg.image_url}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-secondary" />
                )}

                <div className="relative z-20 container h-full flex flex-col justify-center px-4 md:px-6 text-white">
                    <Link href="/packages" className="inline-flex items-center text-white/80 hover:text-gold mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Packages
                    </Link>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {pkg.is_featured && (
                            <Badge className="bg-gold text-black border-none">Featured Collection</Badge>
                        )}
                        {pkg.savings_amount > 0 && (
                            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30">
                                Save {formatCurrency(pkg.savings_amount)}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light mb-4">{pkg.name}</h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl font-light leading-relaxed">
                        {pkg.description}
                    </p>
                </div>
            </div>

            {/* Configurator Section */}
            <div className="container px-4 md:px-6 py-12 -mt-10 relative z-30">
                <PackageConfigurator pkg={transformedPkg} />
            </div>
        </div>
    )
}
