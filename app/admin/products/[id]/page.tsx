import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { notFound } from 'next/navigation'
import { AdminQRCode } from '@/components/admin/qr-code'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adaptProduct, type LiveProduct } from '@/lib/catalog/adapters'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const [productResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('id, name, slug'),
    ])

    if (!productResult.data) {
        notFound()
    }

    const adapted = adaptProduct(productResult.data as LiveProduct)
    const productForForm = {
        ...productResult.data,
        ...adapted,
        // form reads both legacy and plux field names
        price: adapted?.price ?? 0,
        cost: adapted?.cost ?? 0,
        stock: adapted?.quantity_available ?? 1,
        images: adapted?.images ?? [],
    }

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: adapted?.name || 'Edit' }]}
                title="Edit Product"
                description="Manage product details, inventory, and variants."
            />

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <ProductForm
                        product={productForForm}
                        categories={categoriesResult.data || []}
                        variants={[]}
                    />
                </div>
                <div className="space-y-6">
                    <Card className="rounded-2xl border-gray-200 overflow-hidden shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b p-4">
                            <CardTitle className="text-sm font-semibold">Logistics & Tracking</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col items-center gap-4">
                            <AdminQRCode
                                url={`/admin/products/${id}`}
                                label="Product QR Label"
                            />
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 font-medium">SKU: {productForForm?.sku || 'N/A'}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Scan to view in warehouse</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminPage>
    )
}
