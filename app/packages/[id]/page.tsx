import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PackageConfigurator from '@/components/packages/PackageConfigurator'
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
        <div className="pb-24">
            <div className="mx-auto grid max-w-6xl items-end gap-8 px-5 py-12 md:grid-cols-2 md:px-8 md:py-20">
                <div>
                    <Link href="/packages" className="inline-flex items-center text-[11px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Packages
                    </Link>
                    <p className="lux-label mt-6">
                        {pkg.is_featured ? 'Featured' : 'Package'}
                        {pkg.savings_amount > 0 ? ` · Save ${formatCurrency(pkg.savings_amount)}` : ''}
                    </p>
                    <h1 className="mt-3 font-serif text-5xl font-medium leading-[0.95] md:text-6xl">{pkg.name}</h1>
                    <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)]">
                        {pkg.description}
                    </p>
                </div>
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)]">
                    {pkg.image_url ? (
                        <Image src={pkg.image_url} alt="" fill className="object-cover" priority />
                    ) : null}
                </div>
            </div>

            {/* Included Items Section (Static) */}
            {pkg.package_items && pkg.package_items.length > 0 && (
                <div className="container mx-auto px-4 md:px-6 py-12 -mt-10 relative z-30 mb-8">
                    <div className="border border-[var(--theme-dark)]/10 bg-white p-6 md:p-8">
                        <h2 className="mb-6 font-serif text-3xl font-medium">Included</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {pkg.package_items.map((item: any) => {
                                const product = productMap.get(item.product_id)
                                return (
                                    <div key={item.id} className="flex items-center gap-4 bg-[var(--surface-elevated)] p-4 rounded-xl">
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
