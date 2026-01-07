'use client'

import { Bell, Search, Plus, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="relative w-full md:w-[450px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                <Input
                    placeholder="Search for orders, customers, or tasks..."
                    className="pl-12 bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl h-14 focus-visible:ring-indigo-500/20 transition-all"
                />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-semibold">New Event</span>
                </Button>

                <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block" />

                <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-gray-50 border border-gray-100 transition-all">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all outline-none">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya"
                                alt="Maya Brooks"
                                className="h-11 w-11 rounded-xl object-cover shadow-inner"
                            />
                            <div className="hidden md:block text-left">
                                <p className="font-bold text-gray-900 text-sm leading-none mb-1">Maya Brooks</p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Event Manager</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
                        <DropdownMenuLabel className="font-serif text-lg font-light px-3 py-2">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-50" />
                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
