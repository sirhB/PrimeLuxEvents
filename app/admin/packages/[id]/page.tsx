import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PackageBuilderForm from '../new/PackageBuilderForm'
import { PackageItemGroup } from '@/components/admin/PackageItemGroupBuilder'

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Package Details with Groups and Options AND Static Items
    const { data: pkg, error } = await supabase
        .from('packages')
        .select(`
            *,
            package_item_groups (
                id,
                name,
                description,
                min_selections,
                max_selections,
                display_order,
                package_item_options (
                    id,
                    product_id,
                    is_default,
                    quantity,
                    display_order,
                    products (
                        name
                    )
                )
            ),
            package_items (
                id,
                product_id,
                quantity,
                products (
                    name
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error || !pkg) {
        console.error('Error fetching package:', error)
        try {
            // Attempt fallback if query fails (e.g. if schema mismatch)
            redirect('/admin/packages')
        } catch (e) {
            // This is just to satisfy the linter if redirect is not detected as returning never
            return <div>Error loading package</div>
        }
    }

    // 2. Fetch All Products for the picker
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category_id')
        .order('name')

    // 3. Transform data for the form
    // We need to sort groups and options by display_order
    const groups: PackageItemGroup[] = pkg.package_item_groups
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((g: any) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            min_selections: g.min_selections,
            max_selections: g.max_selections,
            display_order: g.display_order,
            options: g.package_item_options
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((o: any) => ({
                    id: o.id,
                    product_id: o.product_id,
                    product_name: o.products?.name || 'Unknown Product',
                    is_default: o.is_default,
                    quantity: o.quantity
                }))
        }))

    // Transform static items
    const staticItems = pkg.package_items.map((i: any) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: i.products?.name || 'Unknown Product',
        quantity: i.quantity
    }))

    const initialData = {
        id: pkg.id,
        package: {
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            image_url: pkg.image_url,
            is_featured: pkg.is_featured,
            discount_type: pkg.discount_type,
            discount_value: pkg.discount_value,
            original_price: pkg.original_price,
            savings_amount: pkg.savings_amount
        },
        groups,
        staticItems
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Package</h1>
                <p className="text-gray-600 mt-2">
                    Update package details, configurable items, and pricing.
                </p>
            </div>

            <PackageBuilderForm
                products={products || []}
                initialData={initialData}
            />
        </div>
    )
}
