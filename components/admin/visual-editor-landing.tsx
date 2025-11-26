"use client"

import { motion } from "framer-motion"
import {
    LayoutTemplate,
    HelpCircle,
    Phone,
    Image as ImageIcon,
    BookOpen,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface VisualEditorLandingProps {
    onSelectPage: (page: string) => void
}

const pages = [
    {
        id: 'about',
        label: 'About Us',
        icon: LayoutTemplate,
        description: 'Edit your story, values, and team information.',
        color: 'from-purple-500/20 to-blue-500/20'
    },
    {
        id: 'how-it-works',
        label: 'How It Works',
        icon: HelpCircle,
        description: 'Manage steps, FAQs, and process details.',
        color: 'from-emerald-500/20 to-teal-500/20'
    },
    {
        id: 'contact',
        label: 'Contact',
        icon: Phone,
        description: 'Update contact info, form settings, and location.',
        color: 'from-orange-500/20 to-red-500/20'
    },
    {
        id: 'gallery',
        label: 'Gallery',
        icon: ImageIcon,
        description: 'Curate your portfolio and event showcases.',
        color: 'from-pink-500/20 to-rose-500/20'
    },
    {
        id: 'journal',
        label: 'Journal',
        icon: BookOpen,
        description: 'Write and manage blog posts and news.',
        color: 'from-amber-500/20 to-yellow-500/20'
    },
]

export function VisualEditorLanding({ onSelectPage }: VisualEditorLandingProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center mb-16 space-y-4"
            >
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 text-gold mb-4 ring-1 ring-gold/20">
                    <LayoutTemplate className="w-6 h-6" />
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">Visual Editor</h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto font-light">
                    Select a page to start editing content inline. What you see is what you get.
                </p>

                <Button asChild variant="outline" className="mt-8 border-border/50 hover:bg-secondary/50">
                    <Link href="/admin/content">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
                {pages.map((page, index) => {
                    const Icon = page.icon
                    return (
                        <motion.button
                            key={page.id}
                            onClick={() => onSelectPage(page.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative p-8 rounded-xl border border-border/40 bg-gradient-to-br ${page.color} hover:border-gold/30 transition-all duration-300 text-left overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm group-hover:bg-background/80 transition-colors duration-300" />

                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-background border border-border/50 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-gold/50 transition-all duration-300">
                                    <Icon className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-serif font-medium mb-2 group-hover:text-gold transition-colors">{page.label}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {page.description}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
