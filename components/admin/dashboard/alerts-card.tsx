'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, AlertTriangle, BellRing, ArrowRight, Package, Clock, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AlertsCardProps {
    pendingOrdersCount: number
    lowStockCount: number
    pendingTasksCount: number
}

export function AlertsCard({ pendingOrdersCount, lowStockCount, pendingTasksCount }: AlertsCardProps) {
    const alerts = []

    if (lowStockCount > 0) {
        alerts.push({
            id: 'stock',
            message: "Products running low on stock",
            count: lowStockCount,
            type: "error",
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            link: "/admin/inventory?status=low_stock"
        })
    }

    if (pendingOrdersCount > 0) {
        alerts.push({
            id: 'orders',
            message: "New orders require confirmation",
            count: pendingOrdersCount,
            type: "warning",
            icon: Package,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            link: "/admin/orders?status=pending"
        })
    }

    if (pendingTasksCount > 0) {
        alerts.push({
            id: 'tasks',
            message: "Tasks pending for today",
            count: pendingTasksCount,
            type: "info",
            icon: ClipboardList,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            link: "/admin/tasks"
        })
    }

    if (alerts.length === 0) {
        alerts.push({
            id: 'all-good',
            message: "All systems operational",
            count: 0,
            type: "success",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            link: "#"
        })
    }

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
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <Link href={alert.link} key={alert.id} className="block">
                            <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 cursor-pointer">
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                                    alert.bgColor,
                                    alert.color
                                )}>
                                    <alert.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600 leading-snug">
                                        {alert.message}
                                        {alert.count > 0 && (
                                            <span className="ml-2 font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                ({alert.count})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
