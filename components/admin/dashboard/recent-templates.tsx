'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

const templates = [
    {
        id: 1,
        category: "Finance",
        title: "Event Budget Tracker",
        description: "Track and manage expenses across key categories.",
        color: "bg-pink-50"
    },
    {
        id: 2,
        category: "Guest Management",
        title: "Guest Seating Plan",
        description: "Plan guest seating with drag & drop layout.",
        color: "bg-orange-50"
    },
    {
        id: 3,
        category: "Vendors",
        title: "Vendor Onboarding Checklist",
        description: "Step-by-step tasks to onboard new vendors efficiently.",
        color: "bg-purple-50"
    },
    {
        id: 4,
        category: "Guest Management",
        title: "RSVP Tracker",
        description: "Track guest responses, meal choices & special notes.",
        color: "bg-blue-50"
    }
]

export function RecentTemplates() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Recent Templates</CardTitle>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className={`${template.color} p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-pointer`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                                    {template.category}
                                </span>
                                <div className="h-8 w-8 bg-[#6366f1]/10 rounded-lg flex items-center justify-center text-[#6366f1]">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{template.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {template.description}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
