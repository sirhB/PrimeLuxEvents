'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PortfolioTable } from './portfolio-table'
import { AdminPageHeader } from '@/components/admin/page-shell'

interface PortfolioContentProps {
    categories: any[]
}

export function PortfolioContent({ categories }: PortfolioContentProps) {
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                eyebrow="Content"
                title="Portfolio"
                description="Manage your event galleries and portfolio categories."
                actions={
                    <Button asChild className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
                        <Link href="/admin/portfolio/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                }
            />

            <Card className="glass-card border-none overflow-hidden rounded-[var(--dashboard-radius)]">
                <CardContent className="p-0">
                    <PortfolioTable categories={categories || []} />
                </CardContent>
            </Card>
        </div>
    )
}
