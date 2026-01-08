'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    Plus,
    X,
    ChevronRight,
    ArrowRight,
    Command,
    Clock,
    TrendingUp,
    Truck,
    Package as BoxIcon,
    Layers
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
}

const QUICK_ACTIONS = [
    { icon: Plus, label: 'Create New Order', href: '/admin/orders/new', color: 'text-green-500' },
    { icon: Package, label: 'Add New Product', href: '/admin/products/new', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'View Analytics', href: '/admin/analytics', color: 'text-[var(--dashboard-accent-gold)]' },
]

const NAVIGATION = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Truck, label: 'Logistics', href: '/admin/logistics' },
    { icon: BoxIcon, label: 'Inventory', href: '/admin/products?stock_status=low_stock' },
    { icon: Layers, label: 'Categories', href: '/admin/categories' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    // Filter results based on query
    const filteredNav = NAVIGATION.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    )
    const filteredActions = QUICK_ACTIONS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    )

    const allItems = [...filteredActions, ...filteredNav]

    const handleSelect = useCallback((item: any) => {
        router.push(item.href)
        onClose()
    }, [router, onClose])

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (isOpen) onClose()
                else return // handled elsewhere or just open it if we want
            }

            if (!isOpen) return

            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % allItems.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (allItems[selectedIndex]) {
                    handleSelect(allItems[selectedIndex])
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, allItems, selectedIndex, handleSelect])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-24 px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-2xl bg-[#0a0a0a]/90 border border-[var(--dashboard-border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto glass-card lg:border-2"
                        >
                            <div className="flex items-center px-6 py-4 border-b border-[var(--dashboard-border)]">
                                <Search className="h-5 w-5 text-[var(--dashboard-accent-gold)] mr-4 opacity-50" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent border-none outline-none text-lg text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)]/50 font-light"
                                />
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 ml-4">
                                    <span className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase">ESC</span>
                                </div>
                            </div>

                            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {allItems.length > 0 ? (
                                    <div className="space-y-4 py-2">
                                        {filteredActions.length > 0 && (
                                            <div>
                                                <h3 className="px-4 py-2 text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-[0.2em] opacity-50">Quick Actions</h3>
                                                <div className="space-y-1 mt-1">
                                                    {filteredActions.map((item, idx) => {
                                                        const isSelected = selectedIndex === idx
                                                        return (
                                                            <button
                                                                key={item.label}
                                                                onClick={() => handleSelect(item)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-left",
                                                                    isSelected ? "bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] hover:bg-white/5 hover:text-[var(--dashboard-text)]"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("p-2 rounded-lg bg-black/40 border border-white/5 group-hover:border-white/10", isSelected && "border-[var(--dashboard-accent-gold)]/30")}>
                                                                        <item.icon className={cn("h-4 w-4", item.color)} />
                                                                    </div>
                                                                    <span className="font-medium">{item.label}</span>
                                                                </div>
                                                                {isSelected && <ArrowRight className="h-4 w-4 animate-in slide-in-from-left-2 duration-300" />}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {filteredNav.length > 0 && (
                                            <div>
                                                <h3 className="px-4 py-2 text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-[0.2em] opacity-50">Navigation</h3>
                                                <div className="space-y-1 mt-1">
                                                    {filteredNav.map((item, idx) => {
                                                        const globalIdx = idx + filteredActions.length
                                                        const isSelected = selectedIndex === globalIdx
                                                        return (
                                                            <button
                                                                key={item.label}
                                                                onClick={() => handleSelect(item)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-left",
                                                                    isSelected ? "bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] hover:bg-white/5 hover:text-[var(--dashboard-text)]"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("p-2 rounded-lg bg-black/40 border border-white/5 group-hover:border-white/10", isSelected && "border-[var(--dashboard-accent-gold)]/30")}>
                                                                        <item.icon className="h-4 w-4" />
                                                                    </div>
                                                                    <span className="font-medium font-serif italic text-base">{item.label}</span>
                                                                </div>
                                                                {isSelected && <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--dashboard-accent-gold)] opacity-50">Go to <ChevronRight className="h-3 w-3" /></div>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <Command className="h-6 w-6 text-[var(--dashboard-text-muted)] opacity-30" />
                                        </div>
                                        <p className="text-[var(--dashboard-text-muted)] font-light">No commands found for "{query}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-[var(--dashboard-border)] bg-black/20 flex items-center justify-between text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-widest">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 rotate-90" /> Select</span>
                                    <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 -rotate-90" /> Navigate</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full border border-[var(--dashboard-text-muted)]" /> Close</span>
                                </div>
                                <div>PrimeLux Command Center</div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
