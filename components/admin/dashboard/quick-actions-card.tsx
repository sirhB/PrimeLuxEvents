import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

export function QuickActionsCard() {
    return (
        <Card className="bg-gradient-to-br from-[var(--dashboard-accent-green)]/20 to-[var(--dashboard-accent-green)]/5 border-none text-[var(--dashboard-text)] shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <span className="p-1 rounded bg-[var(--dashboard-accent-green)]/20">✨</span>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <p className="text-sm text-[var(--dashboard-text-muted)] mb-6">
                    Manage your store efficiently.
                </p>
                <div className="flex gap-3">
                    <Button asChild className="bg-[var(--dashboard-card)] hover:bg-[var(--dashboard-card-hover)] text-white border-none">
                        <Link href="/admin/products/new">
                            Add Product
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="rounded-full bg-[var(--dashboard-card)]/50 hover:bg-[var(--dashboard-card)] text-white">
                        <Link href="/admin/orders">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
