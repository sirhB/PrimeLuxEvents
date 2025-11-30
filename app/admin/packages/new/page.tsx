import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PackageBuilderForm from './PackageBuilderForm'

export default async function NewPackagePage() {
    const supabase = await createClient()

    // Fetch products for the item selector
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .order('name')

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Package</h1>
                <p className="text-gray-600 mt-2">
                    Design a package with configurable items and discounts.
                </p>
            </div>

            <PackageBuilderForm products={products || []} />
        </div>
    )
}
