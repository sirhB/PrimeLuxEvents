import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function NewProductPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase.from('categories').select('*')

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: 'New' }]}
                title="New Product"
                description="Add a new item to your rental catalog."
            />
            <ProductForm categories={categories || []} />
        </AdminPage>
    )
}
