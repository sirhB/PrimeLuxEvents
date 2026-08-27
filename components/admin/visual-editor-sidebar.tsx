"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Type,
    Image as ImageIcon,
    ChevronRight,
    ChevronDown,
    Search,
    Laptop,
    Tablet,
    Smartphone,
    PanelLeftClose,
    PanelLeft,
    List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageUpload } from "@/components/admin/image-upload"
import { useEditorContent } from "@/components/admin/visual-editor/editor-content-context"
import {
    getFieldLabel,
    getFieldType,
    getPageKeyPrefix,
    getSectionLabel,
    type PreviewDevice,
} from "@/lib/admin/visual-editor-config"

interface VisualEditorSidebarProps {
    activePage: string
    previewDevice: PreviewDevice
    onPreviewDeviceChange: (device: PreviewDevice) => void
    isOpen: boolean
    onToggle: () => void
}

export function VisualEditorSidebar({
    activePage,
    previewDevice,
    onPreviewDeviceChange,
    isOpen,
    onToggle,
}: VisualEditorSidebarProps) {
    const editor = useEditorContent()
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedSections, setExpandedSections] = useState<string[]>(['hero', 'story', 'values', 'cta'])

    if (!editor) return null

    const { content, updateField, saveField, savingKeys } = editor
    const keyPrefix = getPageKeyPrefix(activePage)

    const pageKeys = Object.keys(content || {}).filter((key) => key.startsWith(keyPrefix))

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
        )
    }

    const sections: Record<string, string[]> = {}
    pageKeys.forEach((key) => {
        const parts = key.split('.')
        const section = parts[1] || 'general'
        if (!sections[section]) sections[section] = []
        sections[section].push(key)
    })

    const filteredSections = Object.entries(sections).filter(([name, keys]) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            keys.some((k) => k.toLowerCase().includes(q) || getFieldLabel(k).toLowerCase().includes(q)) ||
            name.toLowerCase().includes(q) ||
            getSectionLabel(name).toLowerCase().includes(q)
        )
    })

    const sidebarContent = (
        <>
            <div className="sticky top-0 z-10 space-y-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-glass-bg)] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--dashboard-text)]">Content fields</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8 text-[var(--dashboard-text-muted)] md:hidden"
                        aria-label="Close sidebar"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dashboard-text-muted)]" />
                    <Input
                        placeholder="Search fields…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 border-[var(--dashboard-border)] bg-[var(--dashboard-card)] pl-9 text-xs focus-visible:ring-[var(--dashboard-accent-gold)]/30"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-5 p-4 pb-28">
                    {filteredSections.length === 0 && (
                        <p className="text-xs text-[var(--dashboard-text-muted)]">No fields match your search.</p>
                    )}

                    {filteredSections.map(([name, keys]) => (
                        <div key={name} className="space-y-2">
                            <button
                                type="button"
                                onClick={() => toggleSection(name)}
                                className="group flex w-full items-center justify-between text-left"
                            >
                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--dashboard-text-muted)] transition-colors group-hover:text-[var(--dashboard-accent-gold)]">
                                    {getSectionLabel(name)}
                                </span>
                                {expandedSections.includes(name) ? (
                                    <ChevronDown className="h-3 w-3 text-[var(--dashboard-text-muted)]" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 text-[var(--dashboard-text-muted)]" />
                                )}
                            </button>

                            <AnimatePresence initial={false}>
                                {expandedSections.includes(name) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-3 overflow-hidden"
                                    >
                                        {keys.map((key) => {
                                            const label = getFieldLabel(key)
                                            const value = content[key]
                                            const fieldType = getFieldType(key, value)
                                            const isSaving = savingKeys.has(key)

                                            return (
                                                <FieldEditor
                                                    key={key}
                                                    fieldKey={key}
                                                    label={label}
                                                    value={value}
                                                    fieldType={fieldType}
                                                    isSaving={isSaving}
                                                    onUpdate={(v) => updateField(key, v)}
                                                    onSave={(v) => saveField(key, v)}
                                                />
                                            )
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-glass-bg)] p-4 backdrop-blur-md">
                <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">
                    Preview size
                </p>
                <div className="flex items-center justify-center gap-1 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-1">
                    {(
                        [
                            { device: 'desktop' as const, icon: Laptop, label: 'Desktop' },
                            { device: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                            { device: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                        ] as const
                    ).map(({ device, icon: Icon, label }) => (
                        <Button
                            key={device}
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onPreviewDeviceChange(device)}
                            className={cn(
                                "h-9 w-9 rounded-full",
                                previewDevice === device
                                    ? "bg-[var(--dashboard-card-hover)] text-[var(--dashboard-accent-gold)]"
                                    : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]",
                            )}
                            aria-label={label}
                            aria-pressed={previewDevice === device}
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onToggle}
                    aria-label="Close sidebar overlay"
                />
            )}

            {/* Mobile toggle when closed */}
            {!isOpen && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggle}
                    className="fixed bottom-6 left-4 z-30 h-9 border-[var(--dashboard-border)] md:hidden"
                    aria-label="Open content fields"
                >
                    <PanelLeft className="mr-1.5 h-4 w-4" />
                    Fields
                </Button>
            )}

            <aside
                className={cn(
                    "glass-card relative z-50 flex w-[min(100vw-2rem,340px)] flex-col border-r border-[var(--dashboard-border)] bg-[var(--dashboard-card)]",
                    "fixed inset-y-0 left-0 transition-transform duration-300 md:relative md:translate-x-0 md:shrink-0",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                )}
                aria-label="Content fields sidebar"
            >
                {sidebarContent}
            </aside>
        </>
    )
}

type FieldEditorProps = {
    fieldKey: string
    label: string
    value: unknown
    fieldType: ReturnType<typeof getFieldType>
    isSaving: boolean
    onUpdate: (value: unknown) => void
    onSave: (value: unknown) => Promise<boolean>
}

function FieldEditor({ fieldKey, label, value, fieldType, isSaving, onUpdate, onSave }: FieldEditorProps) {
    if (fieldType === 'json') {
        const itemCount = Array.isArray(value) ? value.length : null
        return (
            <div className="space-y-2 rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List className="h-3 w-3 text-[var(--dashboard-accent-gold)]/70" />
                        <span className="text-xs font-medium capitalize text-[var(--dashboard-text)]">{label}</span>
                    </div>
                    {isSaving && (
                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-[var(--dashboard-accent-gold)]" />
                    )}
                </div>
                {itemCount !== null && (
                    <p className="text-[11px] text-[var(--dashboard-text-muted)]">
                        {itemCount} item{itemCount === 1 ? '' : 's'} — edit in the preview canvas
                    </p>
                )}
                <JsonFieldEditor value={value} onUpdate={onUpdate} onSave={onSave} />
            </div>
        )
    }

    if (fieldType === 'image') {
        const url = typeof value === 'string' ? value : ''
        return (
            <div className="space-y-2 rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-3 w-3 text-[var(--dashboard-accent-gold)]/70" />
                        <span className="text-xs font-medium capitalize text-[var(--dashboard-text)]">{label}</span>
                    </div>
                    {isSaving && (
                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-[var(--dashboard-accent-gold)]" />
                    )}
                </div>
                <Input
                    value={url}
                    onChange={(e) => onUpdate(e.target.value)}
                    onBlur={(e) => onSave(e.target.value)}
                    className="h-8 border-[var(--dashboard-border)] bg-[var(--dashboard-background)] text-[11px] focus-visible:ring-[var(--dashboard-accent-gold)]/30"
                    placeholder="Image URL…"
                />
                <ImageUpload
                    value={url ? [url] : []}
                    onChange={(urls) => {
                        const next = urls[0] ?? ''
                        onUpdate(next)
                        void onSave(next)
                    }}
                    multiple={false}
                />
            </div>
        )
    }

    const stringValue = typeof value === 'string' ? value : ''
    const isLong = fieldType === 'textarea'

    return (
        <div className="space-y-2 rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] p-3 transition-colors hover:border-[var(--dashboard-accent-gold)]/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Type className="h-3 w-3 text-[var(--dashboard-accent-gold)]/70" />
                    <label htmlFor={fieldKey} className="text-xs font-medium capitalize text-[var(--dashboard-text)]">
                        {label}
                    </label>
                </div>
                {isSaving && (
                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-[var(--dashboard-accent-gold)]" />
                )}
            </div>

            {isLong ? (
                <textarea
                    id={fieldKey}
                    value={stringValue}
                    onChange={(e) => onUpdate(e.target.value)}
                    onBlur={(e) => onSave(e.target.value)}
                    className="min-h-[80px] w-full resize-none rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-background)] p-2 text-[11px] leading-relaxed text-[var(--dashboard-text)] outline-none focus:border-[var(--dashboard-accent-gold)]/50 focus:ring-2 focus:ring-[var(--dashboard-accent-gold)]/20"
                    placeholder={`Enter ${label}…`}
                />
            ) : (
                <Input
                    id={fieldKey}
                    value={stringValue}
                    onChange={(e) => onUpdate(e.target.value)}
                    onBlur={(e) => onSave(e.target.value)}
                    className="h-8 border-[var(--dashboard-border)] bg-[var(--dashboard-background)] text-[11px] focus-visible:ring-[var(--dashboard-accent-gold)]/30"
                    placeholder={`Enter ${label}…`}
                />
            )}
        </div>
    )
}

function JsonFieldEditor({
    value,
    onUpdate,
    onSave,
}: {
    value: unknown
    onUpdate: (value: unknown) => void
    onSave: (value: unknown) => Promise<boolean>
}) {
    const [text, setText] = useState(() => JSON.stringify(value, null, 2))
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setText(JSON.stringify(value, null, 2))
        setError(null)
    }, [value])

    return (
        <div className="space-y-1">
            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value)
                    setError(null)
                }}
                onBlur={() => {
                    try {
                        const parsed = JSON.parse(text)
                        onUpdate(parsed)
                        void onSave(parsed)
                        setError(null)
                    } catch {
                        setError('Invalid JSON')
                    }
                }}
                className="min-h-[60px] w-full resize-y rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-background)] p-2 font-mono text-[10px] leading-relaxed text-[var(--dashboard-text)] outline-none focus:border-[var(--dashboard-accent-gold)]/50 focus:ring-2 focus:ring-[var(--dashboard-accent-gold)]/20"
                spellCheck={false}
            />
            {error && <p className="text-[10px] text-[var(--dashboard-accent-red)]">{error}</p>}
        </div>
    )
}
