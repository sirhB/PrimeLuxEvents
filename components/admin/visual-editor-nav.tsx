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
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-[50] shadow-sm">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNavigateToLanding}
                    className="hover:bg-muted"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Editing Page</span>
                    <h1 className="font-serif text-lg font-medium capitalize prose-stone">
                        {pages.find(p => p.id === activePage)?.label}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                    {pages.map((page) => {
                        const Icon = page.icon
                        const isActive = activePage === page.id
                        return (
                            <Button
                                key={page.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => onPageChange(page.id)}
                                className={cn(
                                    "h-8 px-3 rounded-md transition-all duration-300",
                                    isActive ? "bg-white shadow-sm text-gold" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5 mr-2" />
                                <span className="text-xs">{page.label}</span>
                            </Button>
                        )
                    })}
                </div>

                <div className="w-px h-6 bg-border mx-2" />

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 border-border hover:bg-muted text-xs" asChild>
                        <Link href={`/${activePage === 'home' ? '' : activePage}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </Link>
                    </Button>
                    <Button size="sm" className="h-9 bg-gold text-black hover:bg-gold/90 text-xs font-bold px-6">
                        Publish Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}
