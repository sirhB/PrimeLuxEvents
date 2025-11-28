'use client'

import { Bell, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function DashboardHeader() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search"
                    className="pl-10 bg-white border-none shadow-sm rounded-xl h-12"
                />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <Button className="bg-[#6366f1] hover:bg-[#5558dd] text-white rounded-xl h-12 px-6 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                </Button>

                <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-xl hover:bg-white/50">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <div className="flex items-center gap-3 pl-2">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya"
                        alt="Maya Brooks"
                        className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="hidden md:block text-sm">
                        <p className="font-semibold text-gray-900">Maya Brooks</p>
                        <p className="text-gray-500 text-xs">Event Manager</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
