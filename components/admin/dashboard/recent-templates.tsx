'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Layout, FileText, Users, CreditCard, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const templates = [
    {
        id: 1,
        category: "Finance",
        title: "Event Budget Tracker",
        description: "Track and manage expenses across key categories.",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        icon: CreditCard
    },
    {
        id: 2,
        category: "Planning",
        title: "Guest Seating Plan",
        description: "Plan guest seating with drag & drop layout.",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        icon: Layout
    },
    {
        id: 3,
        category: "Vendors",
        title: "Vendor Onboarding",
        description: "Step-by-step tasks to onboard new vendors.",
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        icon: FileText
    },
    {
        id: 4,
        category: "Guests",
        title: "RSVP Tracker",
        description: "Track guest responses and meal choices.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: Users
    }
]

export function RecentTemplates() {
    return (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Layout className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight">Recent Templates</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">Quick start your next project</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full font-medium">
                    Browse Library
                </Button>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="group relative p-6 rounded-3xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="h-4 w-4 text-indigo-400" />
                            </div>

                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110",
                                template.bgColor,
                                template.color
                            )}>
                                <template.icon className="h-6 w-6" />
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {template.category}
                                </span>
                                <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {template.title}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                    {template.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Use Template
                                </span>
                                <ArrowRight className="h-3 w-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
