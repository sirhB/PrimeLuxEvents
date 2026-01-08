'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, AlertTriangle, BellRing, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const alerts = [
    {
        id: 1,
        message: "Seating plan needs approval for",
        project: "Hope for All Charity Gala",
        type: "success",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
    },
    {
        id: 2,
        message: "Mia Thompson's payment was declined for",
        project: "Emma & Liam's Wedding",
        type: "error",
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50"
    },
    {
        id: 3,
        message: "DJ not confirmed for",
        project: "Clay's Birthday Party",
        type: "warning",
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-50"
    }
]

export function AlertsCard() {
    return (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <BellRing className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight">System Alerts</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">Critical updates requiring action</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full font-medium">
                    Clear All
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 cursor-pointer">
                            <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                                alert.bgColor,
                                alert.color
                            )}>
                                <alert.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-600 leading-snug">
                                    {alert.message} <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{alert.project}</span>
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
