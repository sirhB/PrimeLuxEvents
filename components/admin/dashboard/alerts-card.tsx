'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'

const alerts = [
    {
        id: 1,
        message: "Seating plan needs approval for",
        project: "Hope for All Charity Gala",
        type: "success",
        icon: CheckCircle2,
        color: "text-green-500"
    },
    {
        id: 2,
        message: "Mia Thompson's payment was declined for",
        project: "Emma & Liam's Wedding (Dessert)",
        type: "error",
        icon: AlertCircle,
        color: "text-red-500"
    },
    {
        id: 3,
        message: "DJ not confirmed",
        project: "Clay's Birthday Party",
        type: "warning",
        icon: AlertCircle, // Using AlertCircle as placeholder for warning if needed, or AlertTriangle
        color: "text-red-400"
    },
    {
        id: 4,
        message: "Photo vendor reply pending",
        project: "Hope for All Charity Gala",
        type: "warning",
        icon: AlertCircle,
        color: "text-red-400"
    }
]

export function AlertsCard() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Alerts</CardTitle>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3">
                            <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
                            <div className="text-sm">
                                <span className="text-gray-900">{alert.message} </span>
                                <span className="text-[#6366f1] font-medium cursor-pointer hover:underline">{alert.project}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
