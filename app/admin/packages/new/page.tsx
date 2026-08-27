import { createClient } from '@/lib/supabase/server'
import PackageBuilderForm from './PackageBuilderForm'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function NewPackagePage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .order('name')

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Packages', href: '/admin/packages' }, { label: 'New' }]}
                title="Create New Package"
                description="Design a package with configurable items and discounts."
            />
            <PackageBuilderForm products={products || []} />
        </AdminPage>
    )
}
