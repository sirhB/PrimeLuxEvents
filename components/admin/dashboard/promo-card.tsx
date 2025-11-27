'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

export function PromoCard() {
    return (
        <Card className="bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-sm h-full overflow-hidden relative">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-serif font-medium flex items-center gap-2 text-[var(--dashboard-text)]">
                    Congratulations! 🎉
                </CardTitle>
                <p className="text-sm text-[var(--dashboard-text-muted)] font-sans">
                    Some of your products already have the highest buyers
                </p>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-[var(--dashboard-background)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:shadow-md transition-all">
                        <div className="h-24 w-24 bg-white rounded-lg shadow-sm flex items-center justify-center text-3xl">
                            👕
                        </div>
                    </div>
                    <div className="bg-[var(--dashboard-background)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:shadow-md transition-all">
                        <div className="h-24 w-24 bg-white rounded-lg shadow-sm flex items-center justify-center text-3xl">
                            🧢
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 left-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-50">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-50">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
