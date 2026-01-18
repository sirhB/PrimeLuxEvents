'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PortfolioTable } from './portfolio-table'

interface PortfolioContentProps {
    categories: any[]
}

export function PortfolioContent({ categories }: PortfolioContentProps) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Management
                        </span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                            Portfolio
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Manage your event galleries and portfolio categories.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/portfolio/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="glass-card border-none overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    <PortfolioTable categories={categories || []} />
                </CardContent>
            </Card>
        </div>
    )
}
