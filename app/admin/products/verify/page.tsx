import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/authorization'
import { VerificationView } from '@/components/admin/products/verification-view'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function ProductVerificationPage() {
    await requirePermission('products.update')
    const supabase = await createClient()

    // Fetch unverified products
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(name)
        `)
        .eq('is_verified', false)
        .order('created_at', { ascending: false })

    // Fetch all categories for the dropdown
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    // Fetch total count of unverified products (for accurate "Remaining" count)
    const { count: totalUnverified } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)

    if (error) {
        throw new Error('Failed to fetch unverified products')
    }

    return (
        <AdminPage>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: 'Verify' }]}
                title="Product Verification"
                description="Review and verify product details for the catalog."
                actions={
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="icon" className="rounded-md">
                            <Link href="/admin/products">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="text-right">
                            <span className="text-2xl font-semibold text-[var(--dashboard-accent-gold)]">
                                {totalUnverified || 0}
                            </span>
                            <p className="text-[var(--dashboard-text-muted)] text-[10px] uppercase tracking-wider font-bold">
                                Remaining
                            </p>
                        </div>
                    </div>
                }
            />

            {products && products.length > 0 ? (
                <VerificationView products={products} categories={categories || []} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center glass-card p-12 rounded-[var(--dashboard-radius)] border-none animate-fade-in">
                    <div className="h-16 w-16 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center mb-6">
                        <span className="text-2xl font-semibold text-[var(--dashboard-accent-gold)]">✓</span>
                    </div>
                    <h2 className="text-base font-semibold text-[var(--dashboard-text)] mb-2">All Products Verified</h2>
                    <p className="text-[var(--dashboard-text-muted)] max-w-sm text-center mb-8 text-sm">
                        Great job! There are no pending products waiting for verification at this time.
                    </p>
                    <Button asChild className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
                        <Link href="/admin/products">Return to Inventory</Link>
                    </Button>
                </div>
            )}
        </AdminPage>
    )
}
