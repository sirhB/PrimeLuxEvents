"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    LayoutTemplate,
    HelpCircle,
    Phone,
    Image as ImageIcon,
    BookOpen,
    ArrowLeft,
    Eye,
    Menu,
    X,
    Grid
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface VisualEditorNavProps {
    activePage: string
    onPageChange: (page: string) => void
    onNavigateToLanding: () => void
}

const pages = [
    { id: 'about', label: 'About Us', icon: LayoutTemplate },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'journal', label: 'Journal', icon: BookOpen },
]

export function VisualEditorNav({ activePage, onPageChange, onNavigateToLanding }: VisualEditorNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Floating Menu Button */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div
                    className="relative"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <motion.button
                        layout
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl text-white transition-all duration-300",
                            isOpen ? "rounded-b-none border-b-0" : ""
                        )}
                    >
                        <Menu className="w-4 h-4" />
                        <span className="text-sm font-medium">Pages</span>
                        <div className="w-px h-4 bg-white/20 mx-1" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">
                            {pages.find(p => p.id === activePage)?.label}
                        </span>
                    </motion.button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="absolute top-full left-0 w-[240px] -translate-x-[calc(50%-50px)] bg-black/90 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            onNavigateToLanding()
                                            setIsOpen(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors text-left"
                                    >
                                        <Grid className="w-4 h-4" />
                                        All Pages
                                    </button>

                                    <div className="h-px bg-white/10 my-1" />

                                    {pages.map((page) => {
                                        const Icon = page.icon
                                        const isActive = activePage === page.id

                                        return (
                                            <button
                                                key={page.id}
                                                onClick={() => {
                                                    onPageChange(page.id)
                                                    setIsOpen(false)
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                                    isActive ? "bg-gold/20 text-gold" : "text-white/60 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {page.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Actions Dock */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-lg"
            >
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white/70 hover:text-white hover:bg-white/10 h-8 px-3 text-xs"
                >
                    <Link href="/admin/content">
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Exit
                    </Link>
                </Button>

                <div className="w-px h-4 bg-white/10" />

                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-gold hover:text-gold hover:bg-gold/10 h-8 px-3 text-xs"
                >
                    <Link href={`/${activePage === 'home' ? '' : activePage}`} target="_blank">
                        <Eye className="w-3 h-3 mr-2" />
                        View Live
                    </Link>
                </Button>
            </motion.div>
        </>
    )
}
