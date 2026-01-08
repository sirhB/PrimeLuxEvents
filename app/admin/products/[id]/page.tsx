import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { notFound } from 'next/navigation'
import { AdminQRCode } from '@/components/admin/qr-code'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const [productResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('*'),
    ])

    // Fetch variants if this product is part of a group
    let variants: any[] = []
    if (productResult.data && productResult.data.group_id) {
        const { data: variantsData } = await supabase
            .from('products')
            .select('id, name, color, image_url, slug')
            .eq('group_id', productResult.data.group_id)
            .order('created_at', { ascending: true })

        variants = variantsData || []
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-light tracking-tight">Edit Product</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage product details, inventory, and variants.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <ProductForm
                        product={productResult.data}
                        categories={categoriesResult.data || []}
                        variants={variants}
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
                                <p className="text-[10px] text-gray-500 font-medium">SKU: {productResult.data?.sku || 'N/A'}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Scan to view in warehouse</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
