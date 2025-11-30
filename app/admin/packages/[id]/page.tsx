import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PackageBuilderForm from '../new/PackageBuilderForm'
import { PackageItemGroup } from '@/components/admin/PackageItemGroupBuilder'

export default async function EditPackagePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch Package Details with Groups and Options
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
            )
        `)
        .eq('id', params.id)
        .single()

    if (error || !pkg) {
        console.error('Error fetching package:', error)
        redirect('/admin/packages')
    }

    // 2. Fetch All Products for the picker
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
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
        groups
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
