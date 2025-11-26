"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    LayoutTemplate,
    HelpCircle,
    Phone,
    Image as ImageIcon,
    BookOpen,
    ArrowLeft,
    Eye
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface VisualEditorNavProps {
    activePage: string
    onPageChange: (page: string) => void
}

const pages = [
    { id: 'about', label: 'About Us', icon: LayoutTemplate },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'journal', label: 'Journal', icon: BookOpen },
]

export function VisualEditorNav({ activePage, onPageChange }: VisualEditorNavProps) {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
            <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 text-white/70 hover:text-white hover:bg-white/10 mr-2"
                title="Back to Admin"
            >
                <Link href="/admin/content">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </Button>

            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                {pages.map((page) => {
                    const Icon = page.icon
                    const isActive = activePage === page.id

                    return (
                        <button
                            key={page.id}
                            onClick={() => onPageChange(page.id)}
                            className={cn(
                                "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                isActive ? "text-black" : "text-white/60 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {page.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            <Button
                asChild
                variant="default"
                size="sm"
                className="rounded-full bg-gold text-black hover:bg-gold/90 ml-2 px-4"
            >
                <Link href={`/${activePage === 'home' ? '' : activePage}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live
                </Link>
            </Button>
        </motion.div>
    )
}
