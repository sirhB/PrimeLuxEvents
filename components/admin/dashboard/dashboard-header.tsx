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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)] group-focus-within:text-[var(--dashboard-accent-gold)] transition-colors" />
                <Input
                    placeholder="Search for orders, customers, or tasks..."
                    className="pl-12 glass-card border-none shadow-lg rounded-2xl h-14 focus-visible:ring-[var(--dashboard-accent-gold)]/20 transition-all text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)]/50"
                />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <Button className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black rounded-2xl h-14 px-8 shadow-lg shadow-[var(--dashboard-accent-gold)]/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-bold uppercase tracking-wider text-xs">New Event</span>
                </Button>

                <div className="h-10 w-px bg-[var(--dashboard-border)] mx-2 hidden md:block" />

                <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl glass-card hover:bg-[var(--dashboard-card-hover)] transition-all">
                    <Bell className="h-5 w-5 text-[var(--dashboard-text-muted)]" />
                    <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[var(--dashboard-background)] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl glass-card hover:bg-[var(--dashboard-card-hover)] transition-all outline-none group">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text-muted)] shrink-0 shadow-lg group-hover:border-[var(--dashboard-accent-gold)]/30 transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="font-bold text-[var(--dashboard-text)] text-sm leading-none mb-1">Admin User</p>
                                <p className="text-[var(--dashboard-text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-70">Administrator</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl glass-morphism border-[var(--dashboard-border)]">
                        <DropdownMenuLabel className="font-serif text-lg font-light px-3 py-2 text-[var(--dashboard-text)]">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-[var(--dashboard-accent-gold)]/10 focus:text-[var(--dashboard-accent-gold)] text-[var(--dashboard-text-muted)]">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
