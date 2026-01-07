"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Settings,
    Type,
    Image as ImageIcon,
    Layers,
    ChevronRight,
    Search,
    Laptop,
    Tablet,
    Smartphone,
    Save,
    RotateCcw,
    ChevronLeft,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VisualEditorSidebarProps {
    activePage: string
    content: any
    onUpdateContent: (key: string, value: string) => void
}

import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface VisualEditorSidebarProps {
    activePage: string
    content: any
    onUpdateContent: (key: string, value: string) => void
}

export function VisualEditorSidebar({ activePage, content, onUpdateContent }: VisualEditorSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedSections, setExpandedSections] = useState<string[]>(['hero', 'story', 'values', 'cta'])
    const [savingKeys, setSavingKeys] = useState<string[]>([])
    const supabase = createClient()

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    const pageKeys = Object.keys(content || {}).filter(key =>
        key.startsWith(activePage + '.') ||
        (activePage === 'how-it-works' && key.startsWith('howitworks.'))
    )

    const handleSaveField = async (key: string, value: string) => {
        setSavingKeys(prev => [...prev, key])
        try {
            const { data: existing } = await supabase
                .from('content')
                .select('id')
                .eq('key', key)
                .single()

            if (existing) {
                await supabase.from('content').update({ value }).eq('key', key)
            } else {
                await supabase.from('content').insert([{ key, value, type: key.includes('image') ? 'image' : 'text' }])
            }
            toast.success(`Updated ${key.split('.').pop()}`)
        } catch (error) {
            toast.error("Failed to save field")
        } finally {
            setSavingKeys(prev => prev.filter(k => k !== key))
        }
    }

    // Group keys by section
    const sections: Record<string, string[]> = {}
    pageKeys.forEach(key => {
        const parts = key.split('.')
        const section = parts[1] || 'general'
        if (!sections[section]) sections[section] = []
        sections[section].push(key)
    })

    const filteredSections = Object.entries(sections).filter(([name, keys]) => {
        if (!searchQuery) return true
        return keys.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
            name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <div className="w-[320px] h-screen bg-white border-r border-border flex flex-col z-[40]">
            <div className="p-4 border-b space-y-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-gold" />
                        </div>
                        <h2 className="font-serif text-xl font-medium">Editor</h2>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-gold/30"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6 pb-24">
                    {filteredSections.map(([name, keys]) => (
                        <div key={name} className="space-y-3">
                            <button
                                onClick={() => toggleSection(name)}
                                className="flex items-center justify-between w-full text-left group"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-gold transition-colors">
                                    {name}
                                </span>
                                {expandedSections.includes(name) ? (
                                    <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-gold" />
                                ) : (
                                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-gold" />
                                )}
                            </button>

                            <AnimatePresence initial={false}>
                                {expandedSections.includes(name) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        {keys.map(key => {
                                            const label = key.split('.').slice(2).join(' ') || key.split('.')[1]
                                            const value = content[key]
                                            const isImage = key.includes('image')
                                            const isSaving = savingKeys.includes(key)

                                            return (
                                                <div key={key} className="space-y-2 p-3 rounded-xl border border-transparent hover:border-gold/20 hover:bg-gold/5 transition-all group relative">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {isImage ? (
                                                                <ImageIcon className="w-3 h-3 text-gold/60" />
                                                            ) : (
                                                                <Type className="w-3 h-3 text-gold/60" />
                                                            )}
                                                            <label className="text-xs font-semibold text-foreground capitalize tracking-tight">
                                                                {label}
                                                            </label>
                                                        </div>
                                                        {isSaving && (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gold" />
                                                        )}
                                                    </div>

                                                    {isImage ? (
                                                        <Input
                                                            value={typeof value === 'string' ? value : ''}
                                                            onChange={(e) => onUpdateContent(key, e.target.value)}
                                                            onBlur={(e) => handleSaveField(key, e.target.value)}
                                                            className="text-[11px] h-8 bg-white border-muted/60 focus-visible:ring-gold/30"
                                                            placeholder="Image URL..."
                                                        />
                                                    ) : (
                                                        <textarea
                                                            value={typeof value === 'string' ? value : ''}
                                                            onChange={(e) => onUpdateContent(key, e.target.value)}
                                                            onBlur={(e) => handleSaveField(key, e.target.value)}
                                                            className="w-full text-[11px] p-2 rounded-lg border border-muted/60 bg-white min-h-[80px] resize-none focus:ring-2 focus:ring-gold/20 focus:border-gold/50 outline-none transition-all leading-relaxed"
                                                            placeholder={`Enter ${label}...`}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white h-20 flex items-center justify-center">
                <div className="flex items-center bg-muted/30 p-1 rounded-full gap-1 border border-border/50">
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-white shadow-sm rounded-full">
                        <Laptop className="w-4 h-4 text-gold" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white transition-colors rounded-full">
                        <Tablet className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white transition-colors rounded-full">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
