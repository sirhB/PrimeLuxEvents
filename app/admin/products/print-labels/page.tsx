'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateQRCode } from '@/lib/qr'
import { Loader2, ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Product {
    id: string
    name: string
    sku: string | null
    qrDataUrl?: string
}

export default function PrintLabelsPage({
    searchParams,
}: {
    searchParams: Promise<{ ids: string }>
}) {
    const { ids } = use(searchParams)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProducts() {
            if (!ids) {
                setLoading(false)
                return
            }

            const idList = ids.split(',')
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku')
                .in('id', idList)

            if (data) {
                const productsWithQR = await Promise.all(
                    data.map(async (p) => {
                        const qrDataUrl = await generateQRCode(`/admin/products/${p.id}`)
                        return { ...p, qrDataUrl }
                    })
                )
                setProducts(productsWithQR)
            }
            setLoading(false)
        }

        fetchProducts()
    }, [ids])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Generating Labels...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto print:hidden">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/admin/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-serif">Print Labels</h1>
                            <p className="text-sm text-gray-500">{products.length} items selected</p>
                        </div>
                    </div>
                    <Button onClick={() => window.print()} className="bg-black text-white hover:bg-gold hover:text-black rounded-full px-8">
                        <Printer className="mr-2 h-4 w-4" />
                        Print All
                    </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-8 flex gap-4 items-start">
                    <div className="bg-amber-100 p-2 rounded-full">
                        <Printer className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Printer Recommendation</p>
                        <p className="text-xs text-amber-800 mt-1">
                            For best results, use a dedicated label printer. These labels are optimized for 2"x1" or 4"x6" formats.
                            Ensure "Background Graphics" is enabled in your print settings.
                        </p>
                    </div>
                </div>
            </div>

            <div className="label-grid flex flex-wrap gap-4 justify-center print:block print:p-0">
                {products.map((product) => (
                    <div key={product.id} className="label-container bg-white border border-gray-100 rounded-xl p-4 w-[350px] aspect-[2/1] flex gap-4 items-center shadow-sm print:shadow-none print:border print:border-black print:rounded-none print:m-0 print:w-[2in] print:h-[1in] print:page-break-inside-avoid">
                        <div className="qr-box flex-shrink-0 w-24 h-24 print:w-[0.8in] print:h-[0.8in]">
                            {product.qrDataUrl && (
                                <img src={product.qrDataUrl} alt="QR" className="w-full h-full object-contain" />
                            )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate print:text-[10pt]">{product.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest print:text-[7pt] print:text-black">
                                {product.sku || 'NO SKU'}
                            </p>
                            <div className="mt-auto pt-2 border-t border-gray-50 print:border-black">
                                <span className="text-[8px] font-mono text-gray-300 print:text-black print:text-[6pt]">
                                    PLX-INV-{product.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white;
                        padding: 0;
                        margin: 0;
                    }
                    .label-grid {
                        display: block !important;
                    }
                    .label-container {
                        page-break-after: always;
                        display: flex !important;
                        border: 1px solid black !important;
                        margin-bottom: 0 !important;
                        box-sizing: border-box;
                    }
                }
            `}</style>
        </div>
    )
}
