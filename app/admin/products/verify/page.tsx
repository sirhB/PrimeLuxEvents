import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/authorization'
import { VerificationView } from '@/components/admin/products/verification-view'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ProductVerificationPage() {
    await requirePermission('products.edit')
    const supabase = await createClient()

    // Fetch up to 100 unverified products to keep the progress manageable
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(name)
        `)
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        throw new Error('Failed to fetch unverified products')
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/admin/products">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-serif font-light text-[var(--dashboard-text)]">
                            Product Verification
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] text-sm">
                            Review and verify product details for the catalog.
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-serif text-[var(--dashboard-accent-gold)]">
                        {products?.length || 0}
                    </span>
                    <p className="text-[var(--dashboard-text-muted)] text-[10px] uppercase tracking-wider font-bold">
                        Remaining
                    </p>
                </div>
            </div>

            {products && products.length > 0 ? (
                <VerificationView products={products} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center glass-card p-12 rounded-3xl border-none animate-fade-in">
                    <div className="h-20 w-20 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center mb-6">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h2 className="text-2xl font-serif text-[var(--dashboard-text)] mb-2">All Products Verified</h2>
                    <p className="text-[var(--dashboard-text-muted)] max-w-sm text-center mb-8">
                        Great job! There are no pending products waiting for verification at this time.
                    </p>
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-8">
                        <Link href="/admin/products">Return to Inventory</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
