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
        .select(`
            *,
            package_items (
                id,
                quantity,
                product_id
            )
        `)
        .eq('id', id)
        .single()

    if (pkgError) {
        throw new Error(`Package Load Error: ${JSON.stringify(pkgError)}`)
    }

    if (!pkg) {
        notFound()
    }

    // 2. Fetch groups and options separately (without nested products to avoid PGRST200)
    const { data: groupsData, error: groupsError } = await supabase
        .from('package_item_groups')
        .select(`
            *,
            package_item_options (
                id,
                product_id,
                is_default,
                quantity,
                display_order
            )
        `)
        .eq('package_id', id)
        .order('display_order')

    if (groupsError) {
        console.error('Error loading package groups:', groupsError)
    }

    // 3. Fetch all products needed for resolution
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url')

    const productMap = new Map(products?.map(p => [p.id, p]) || [])

    // 4. Transform groups with resolved products
    const groups = groupsData?.map((g: any) => ({
        ...g,
        package_item_options: g.package_item_options.map((o: any) => ({
            ...o,
            products: productMap.get(o.product_id) || { name: 'Unknown', price: 0, image_url: '' }
        }))
    }))

    if (groupsError) {
        console.error('Error loading package groups:', groupsError)
        // We catch this but don't crash, allowing the page to load with 0 groups
    }

    // 3. Attach groups to package object so it matches expected structure
    pkg.package_item_groups = groups || []

    // Transform data for the client component
    const transformedPkg = {
        ...pkg,
        staticItems: (pkg.package_items || []).map((item: any) => ({
            ...item,
            product: productMap.get(item.product_id) || { name: 'Unknown Product', price: 0, image_url: '' }
        })),
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

                <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 md:px-6 text-white">
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

            {/* Included Items Section (Static) */}
            {pkg.package_items && pkg.package_items.length > 0 && (
                <div className="container mx-auto px-4 md:px-6 py-12 -mt-10 relative z-30 mb-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-serif font-light mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-gold"></span>
                            Included in this Package
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {pkg.package_items.map((item: any) => {
                                const product = productMap.get(item.product_id)
                                return (
                                    <div key={item.id} className="flex items-center gap-4 bg-[#FDFBF7] p-4 rounded-xl">
                                        <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                            {product?.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                    <span className="text-xs">No Img</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{product?.name || 'Unknown Product'}</h3>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Configurator Section */}
            <div className="container mx-auto px-4 md:px-6 pb-24 relative z-30">
                <PackageConfigurator pkg={transformedPkg} />
            </div>
        </div>
    )
}
